/**
 * Script pour exécuter la migration des tables de diagnostic
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const fs = require('fs');
const { getConnection } = require('../config/database');

async function runMigration() {
  try {
    console.log('🔄 Connexion à la base de données...');
    const pool = await getConnection();
    console.log('✅ Connecté à la base de données\n');

    // Lire le fichier de migration
    const migrationPath = path.join(__dirname, '..', 'migrations', 'create_diagnostic_tables.sql');
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
          const result = await pool.request().query(batch);
          if (result.rowsAffected && result.rowsAffected[0] > 0) {
            console.log(`   ✅ ${result.rowsAffected[0]} ligne(s) affectée(s)`);
          }
        } catch (err) {
          console.error(`   ⚠️  Erreur dans le batch ${i + 1}:`, err.message);
          // Continue avec les autres batches
        }
      }
    }

    console.log('\n✅ Migration terminée avec succès!');
    console.log('\n📊 Vérification des tables créées...');

    // Vérifier que les tables existent
    const checkTables = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME IN ('ProblemePredéfini', 'Diagnostic', 'ProblemesDiagnostic')
      ORDER BY TABLE_NAME
    `);

    console.log('\n✅ Tables trouvées:');
    checkTables.recordset.forEach(table => {
      console.log(`   - ${table.TABLE_NAME}`);
    });

    // Compter les problèmes prédéfinis
    const countProblems = await pool.request().query('SELECT COUNT(*) as count FROM ProblemePredéfini');
    console.log(`\n📋 Nombre de problèmes prédéfinis: ${countProblems.recordset[0].count}`);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erreur lors de la migration:', error);
    process.exit(1);
  }
}

// Exécuter la migration
runMigration();
