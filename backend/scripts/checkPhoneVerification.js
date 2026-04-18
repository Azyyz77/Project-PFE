/**
 * Script de diagnostic pour vérifier l'état de la vérification téléphonique
 */

const { getConnection, sql } = require('../config/database');

async function checkPhoneVerificationStatus() {
  try {
    console.log('🔍 Vérification de l\'état de la vérification téléphonique...\n');

    const pool = await getConnection();

    // Vérifier si la colonne telephone_verifie existe
    console.log('1. Vérification de la structure de la table...');
    const columnCheck = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'Utilisateur' 
      AND COLUMN_NAME = 'telephone_verifie'
    `);

    if (columnCheck.recordset.length === 0) {
      console.log('❌ La colonne telephone_verifie n\'existe pas dans la table Utilisateur');
      console.log('   Exécutez la migration: backend/migrations/add_telephone_verification.sql');
      return;
    } else {
      console.log('✅ La colonne telephone_verifie existe');
      console.log(`   Type: ${columnCheck.recordset[0].DATA_TYPE}`);
      console.log(`   Nullable: ${columnCheck.recordset[0].IS_NULLABLE}`);
      console.log(`   Défaut: ${columnCheck.recordset[0].COLUMN_DEFAULT || 'NULL'}`);
    }

    // Statistiques des utilisateurs
    console.log('\n2. Statistiques des utilisateurs...');
    const userStats = await pool.request().query(`
      SELECT 
        r.nom as role_nom,
        COUNT(*) as total_users,
        SUM(CASE WHEN u.telephone_verifie = 1 THEN 1 ELSE 0 END) as verified_users,
        SUM(CASE WHEN u.telephone_verifie = 0 OR u.telephone_verifie IS NULL THEN 1 ELSE 0 END) as unverified_users
      FROM Utilisateur u
      LEFT JOIN Role r ON r.id = u.role_id
      WHERE u.actif = 1
      GROUP BY r.nom
      ORDER BY r.nom
    `);

    console.log('📊 Répartition par rôle:');
    userStats.recordset.forEach(stat => {
      console.log(`   ${stat.role_nom || 'SANS_ROLE'}:`);
      console.log(`     Total: ${stat.total_users}`);
      console.log(`     Vérifiés: ${stat.verified_users}`);
      console.log(`     Non vérifiés: ${stat.unverified_users}`);
    });

    // Utilisateurs clients non vérifiés
    console.log('\n3. Clients non vérifiés (échantillon)...');
    const unverifiedClients = await pool.request().query(`
      SELECT TOP 5
        u.id, u.prenom, u.nom, u.email, u.telephone, 
        u.telephone_verifie, u.date_creation
      FROM Utilisateur u
      LEFT JOIN Role r ON r.id = u.role_id
      WHERE u.actif = 1 
      AND (u.telephone_verifie = 0 OR u.telephone_verifie IS NULL)
      AND r.nom = 'CLIENT'
      ORDER BY u.date_creation DESC
    `);

    if (unverifiedClients.recordset.length > 0) {
      console.log('👥 Clients non vérifiés récents:');
      unverifiedClients.recordset.forEach(client => {
        console.log(`   ID: ${client.id} | ${client.prenom} ${client.nom}`);
        console.log(`       Email: ${client.email}`);
        console.log(`       Téléphone: ${client.telephone}`);
        console.log(`       Vérifié: ${client.telephone_verifie ? 'Oui' : 'Non'}`);
        console.log(`       Créé: ${client.date_creation}`);
        console.log('');
      });
    } else {
      console.log('✅ Aucun client non vérifié trouvé');
    }

    // Test de mise à jour
    console.log('4. Test de mise à jour (simulation)...');
    const testUpdate = await pool.request().query(`
      SELECT COUNT(*) as count
      FROM Utilisateur 
      WHERE telephone_verifie IS NULL
    `);

    if (testUpdate.recordset[0].count > 0) {
      console.log(`⚠️  ${testUpdate.recordset[0].count} utilisateurs ont telephone_verifie = NULL`);
      console.log('   Recommandation: Exécuter une mise à jour pour définir la valeur par défaut à 0');
      console.log('   SQL: UPDATE Utilisateur SET telephone_verifie = 0 WHERE telephone_verifie IS NULL');
    } else {
      console.log('✅ Tous les utilisateurs ont une valeur définie pour telephone_verifie');
    }

    console.log('\n✅ Diagnostic terminé avec succès!');

  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
    process.exit(1);
  }
}

// Exécuter le diagnostic si le script est appelé directement
if (require.main === module) {
  checkPhoneVerificationStatus()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = { checkPhoneVerificationStatus };