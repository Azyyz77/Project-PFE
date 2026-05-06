// Script pour vérifier l'existence des tables de commandes de réparation
const { getConnection } = require('../config/database');

async function checkTables() {
  try {
    console.log('🔍 Vérification des tables de commandes de réparation...\n');
    
    const pool = await getConnection();
    
    // Liste des tables à vérifier
    const tablesToCheck = [
      'CommandeReparation',
      'LigneCommande',
      'HistoriqueStatutCommande',
      'PhotoCommande',
      'Facture',
      'Paiement'
    ];
    
    console.log('Tables à vérifier:');
    console.log('─'.repeat(50));
    
    for (const tableName of tablesToCheck) {
      const result = await pool.request().query(`
        SELECT COUNT(*) as existe
        FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_NAME = '${tableName}'
      `);
      
      const exists = result.recordset[0].existe > 0;
      const status = exists ? '✅ EXISTE' : '❌ MANQUANTE';
      console.log(`${status} - ${tableName}`);
      
      // Si la table existe, afficher sa structure
      if (exists) {
        const columns = await pool.request().query(`
          SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
          FROM INFORMATION_SCHEMA.COLUMNS
          WHERE TABLE_NAME = '${tableName}'
          ORDER BY ORDINAL_POSITION
        `);
        
        console.log(`   Colonnes (${columns.recordset.length}):`);
        columns.recordset.forEach(col => {
          const length = col.CHARACTER_MAXIMUM_LENGTH ? `(${col.CHARACTER_MAXIMUM_LENGTH})` : '';
          const nullable = col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL';
          console.log(`   - ${col.COLUMN_NAME}: ${col.DATA_TYPE}${length} ${nullable}`);
        });
        console.log('');
      }
    }
    
    console.log('─'.repeat(50));
    console.log('\n✅ Vérification terminée');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

checkTables();
