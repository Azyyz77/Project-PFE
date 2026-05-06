const { getConnection } = require('../config/database');
const fs = require('fs');
const path = require('path');

async function createTrigger() {
  try {
    console.log('🔧 Correction des numéros NULL et création du trigger...\n');
    
    const pool = await getConnection();
    const sqlFile = path.join(__dirname, '../migrations/fix_numero_null_and_create_trigger.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Exécuter le script SQL
    await pool.request().query(sql);
    
    console.log('\n✅ Trigger créé avec succès!');
    console.log('\nFormat des numéros: CMD-YYYYMMDD-XXXX');
    console.log('Exemple: CMD-20260506-0001\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error('\nDétails:', error);
    process.exit(1);
  }
}

createTrigger();
