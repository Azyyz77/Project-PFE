/**
 * Script pour vérifier les colonnes nécessaires pour le système de facturation
 */

const { getConnection } = require('../config/database');

async function checkColumns() {
  try {
    console.log('=== VÉRIFICATION DES COLONNES ===\n');

    const pool = await getConnection();

    // Vérifier les colonnes de Facture
    console.log('1. Colonnes de la table Facture:');
    const factureColumns = await pool.request().query(`
      SELECT 
        c.name AS colonne,
        t.name AS type,
        c.max_length AS taille,
        CASE WHEN c.is_nullable = 1 THEN 'NULL' ELSE 'NOT NULL' END AS nullable
      FROM sys.columns c
      JOIN sys.types t ON c.user_type_id = t.user_type_id
      WHERE c.object_id = OBJECT_ID('Facture')
      ORDER BY c.column_id
    `);

    console.table(factureColumns.recordset);

    // Vérifier les colonnes manquantes de Facture
    const requiredFactureColumns = ['date_envoi', 'date_paiement', 'mode_paiement', 'notes'];
    const existingFactureColumns = factureColumns.recordset.map(c => c.colonne);
    const missingFactureColumns = requiredFactureColumns.filter(col => !existingFactureColumns.includes(col));

    if (missingFactureColumns.length > 0) {
      console.log('\n❌ Colonnes MANQUANTES dans Facture:', missingFactureColumns.join(', '));
    } else {
      console.log('\n✅ Toutes les colonnes requises existent dans Facture');
    }

    // Vérifier les colonnes de Agence
    console.log('\n2. Colonnes de la table Agence:');
    const agenceColumns = await pool.request().query(`
      SELECT 
        c.name AS colonne,
        t.name AS type,
        c.max_length AS taille,
        CASE WHEN c.is_nullable = 1 THEN 'NULL' ELSE 'NOT NULL' END AS nullable
      FROM sys.columns c
      JOIN sys.types t ON c.user_type_id = t.user_type_id
      WHERE c.object_id = OBJECT_ID('Agence')
      ORDER BY c.column_id
    `);

    console.table(agenceColumns.recordset);

    // Vérifier les colonnes manquantes de Agence
    const requiredAgenceColumns = ['email'];
    const existingAgenceColumns = agenceColumns.recordset.map(c => c.colonne);
    const missingAgenceColumns = requiredAgenceColumns.filter(col => !existingAgenceColumns.includes(col));

    if (missingAgenceColumns.length > 0) {
      console.log('\n❌ Colonnes MANQUANTES dans Agence:', missingAgenceColumns.join(', '));
    } else {
      console.log('\n✅ Toutes les colonnes requises existent dans Agence');
    }

    // Résumé
    console.log('\n=== RÉSUMÉ ===');
    if (missingFactureColumns.length === 0 && missingAgenceColumns.length === 0) {
      console.log('✅ Toutes les colonnes nécessaires sont présentes');
      console.log('✅ Le système de facturation peut fonctionner correctement');
    } else {
      console.log('❌ Des colonnes sont manquantes!');
      console.log('\n📋 ACTION REQUISE:');
      console.log('   1. Ouvrez SQL Server Management Studio (SSMS)');
      console.log('   2. Connectez-vous au serveur "DALI"');
      console.log('   3. Ouvrez le fichier: backend/migrations/fix_facture_agence_columns.sql');
      console.log('   4. Exécutez le script SQL');
      console.log('   5. Redémarrez le backend');
    }

    await pool.close();

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error('\nDétails:', error);
  }
}

checkColumns();
