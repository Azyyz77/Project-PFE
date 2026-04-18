/**
 * Script pour diagnostiquer et corriger les problèmes de vérification téléphonique
 */

const { getConnection, sql } = require('./config/database');
const bcrypt = require('bcryptjs');

async function fixPhoneVerification() {
  try {
    console.log('🔧 Diagnostic et correction de la vérification téléphonique\n');

    const pool = await getConnection();

    // 1. Vérifier la structure de la table
    console.log('1. Vérification de la structure...');
    const columnCheck = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'Utilisateur' 
      AND COLUMN_NAME IN ('telephone_verifie', 'telephone', 'email')
      ORDER BY COLUMN_NAME
    `);

    console.log('Colonnes trouvées:');
    columnCheck.recordset.forEach(col => {
      console.log(`   ${col.COLUMN_NAME}: ${col.DATA_TYPE} (${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });

    // 2. Vérifier l'utilisateur de test
    console.log('\n2. Vérification de l\'utilisateur de test...');
    const testUser = await pool.request()
      .input('email', sql.NVarChar, 'test.phone@example.com')
      .query(`
        SELECT u.id, u.prenom, u.nom, u.email, u.telephone, u.actif, 
               u.telephone_verifie, u.date_creation, r.nom as role_nom
        FROM Utilisateur u
        LEFT JOIN Role r ON r.id = u.role_id
        WHERE u.email = @email
      `);

    if (testUser.recordset.length > 0) {
      const user = testUser.recordset[0];
      console.log('✅ Utilisateur trouvé:');
      console.log(`   ID: ${user.id}`);
      console.log(`   Nom: ${user.prenom} ${user.nom}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Téléphone: ${user.telephone}`);
      console.log(`   Rôle: ${user.role_nom}`);
      console.log(`   Actif: ${user.actif}`);
      console.log(`   Téléphone vérifié: ${user.telephone_verifie}`);
      console.log(`   Créé: ${user.date_creation}`);

      // 3. Corriger le statut si nécessaire
      if (user.telephone_verifie === null) {
        console.log('\n3. Correction du statut telephone_verifie...');
        await pool.request()
          .input('id', sql.BigInt, user.id)
          .query('UPDATE Utilisateur SET telephone_verifie = 0 WHERE id = @id');
        console.log('✅ Statut corrigé à 0 (non vérifié)');
      }
    } else {
      console.log('❌ Utilisateur non trouvé, création...');
      
      // Créer l'utilisateur de test
      const roleResult = await pool.request()
        .input('rolenom', sql.NVarChar, 'CLIENT')
        .query('SELECT id FROM Role WHERE nom = @rolenom');

      if (roleResult.recordset.length === 0) {
        console.log('❌ Rôle CLIENT non trouvé');
        return;
      }

      const role_id = roleResult.recordset[0].id;
      const hashedPassword = await bcrypt.hash('password123', 10);

      const insertResult = await pool.request()
        .input('nom', sql.NVarChar, 'Client')
        .input('prenom', sql.NVarChar, 'Test')
        .input('telephone', sql.NVarChar, '+21612345678')
        .input('email', sql.NVarChar, 'test.phone@example.com')
        .input('mot_de_passe', sql.NVarChar, hashedPassword)
        .input('role_id', sql.BigInt, role_id)
        .query(`
          INSERT INTO Utilisateur (nom, prenom, telephone, email, mot_de_passe, actif, date_creation, role_id, telephone_verifie)
          OUTPUT INSERTED.id
          VALUES (@nom, @prenom, @telephone, @email, @mot_de_passe, 1, GETDATE(), @role_id, 0)
        `);

      console.log('✅ Utilisateur créé avec ID:', insertResult.recordset[0].id);
    }

    // 4. Nettoyer les anciens utilisateurs de test
    console.log('\n4. Nettoyage des doublons...');
    const duplicates = await pool.request()
      .input('telephone', sql.NVarChar, '+21612345678')
      .query(`
        SELECT id, email, date_creation 
        FROM Utilisateur 
        WHERE telephone = @telephone 
        ORDER BY date_creation DESC
      `);

    if (duplicates.recordset.length > 1) {
      console.log(`Trouvé ${duplicates.recordset.length} utilisateurs avec le même téléphone:`);
      duplicates.recordset.forEach((user, index) => {
        console.log(`   ${index + 1}. ID: ${user.id}, Email: ${user.email}, Créé: ${user.date_creation}`);
      });

      // Garder le plus récent, supprimer les autres
      const toKeep = duplicates.recordset[0].id;
      const toDelete = duplicates.recordset.slice(1).map(u => u.id);

      if (toDelete.length > 0) {
        console.log(`Suppression des anciens (garder ID: ${toKeep})...`);
        for (const id of toDelete) {
          await pool.request()
            .input('id', sql.BigInt, id)
            .query('DELETE FROM Utilisateur WHERE id = @id');
          console.log(`   Supprimé ID: ${id}`);
        }
      }
    }

    // 5. Vérifier la configuration finale
    console.log('\n5. Configuration finale...');
    const finalUser = await pool.request()
      .input('email', sql.NVarChar, 'test.phone@example.com')
      .query(`
        SELECT u.id, u.email, u.telephone, u.telephone_verifie, u.actif, r.nom as role_nom
        FROM Utilisateur u
        LEFT JOIN Role r ON r.id = u.role_id
        WHERE u.email = @email
      `);

    if (finalUser.recordset.length > 0) {
      const user = finalUser.recordset[0];
      console.log('✅ Utilisateur final configuré:');
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Téléphone: ${user.telephone}`);
      console.log(`   Rôle: ${user.role_nom}`);
      console.log(`   Actif: ${user.actif}`);
      console.log(`   Téléphone vérifié: ${user.telephone_verifie}`);
    }

    console.log('\n✅ Correction terminée !');
    console.log('\nPour tester:');
    console.log('1. Relancez: node test-phone-api.js');
    console.log('2. Ou connectez-vous avec: test.phone@example.com / password123');

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  fixPhoneVerification()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = { fixPhoneVerification };