/**
 * Script pour supprimer les tables de diagnostic
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const fs = require('fs');
const { getConnection } = require('../config/database');

async function dropTables() {
  try {
    console.log('🔄 Connexion à la base de données...');
    const pool = await getConnection();
    console.log('✅ Connecté à la base de données\n');

    // Lire le fichier de migration
    const migrationPath = path.join(__dirname, '..', 'migrations', 'drop_diagnostic_tables.sql');
    console.log('📄 Lecture du fichier de migration:', migrationPath);
    
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Diviser le SQL en batches (séparés par GO)
    const batches = migrationSQL
      .split(/\r?\nGO\r?\n/gi)
      .filter(batch => batch.trim().length > 0);

    console.log(`📦 ${batches.length} batches SQL à exécuter\n`);

    // Exécuter chaque batch
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i].trim();
      if (batch) {
        console.log(`⚙️  Exécution du batch ${i + 1}/${batches.length}...`);
        try {
          await pool.request().query(batch);
        } catch (err) {
          console.error(`   ⚠️  Erreur dans le batch ${i + 1}:`, err.message);
        }
      }
    }

    console.log('\n✅ Suppression terminée!');
    
    // Vérifier que les tables ont été supprimées
    const checkTables = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME IN ('ProblemePredéfini', 'Diagnostic', 'ProblemesDiagnostic', 'ProblemePredefini')
      ORDER BY TABLE_NAME
    `);

    if (checkTables.recordset.length === 0) {
      console.log('\n✅ Toutes les tables ont été supprimées avec succès');
    } else {
      console.log('\n⚠️  Tables restantes:');
      checkTables.recordset.forEach(table => {
        console.log(`   - ${table.TABLE_NAME}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erreur lors de la suppression:', error);
    process.exit(1);
  }
}

// Exécuter la suppression
dropTables();
