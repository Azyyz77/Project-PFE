require('dotenv').config();
const { getConnection } = require('./config/database');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    console.log('🔄 Connexion à la base de données...');
    const pool = await getConnection();
    
    console.log('📖 Lecture du fichier de migration...');
    const migrationPath = path.join(__dirname, 'migrations', 'add_telephone_verification.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('⚙️  Exécution de la migration...');
    await pool.request().query(sql);
    
    console.log('✅ Migration exécutée avec succès!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  }
}

runMigration();
