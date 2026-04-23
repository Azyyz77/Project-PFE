const path = require('path');
const fs = require('fs');

// Check uploads directory
const uploadsDir = path.join(__dirname, '../uploads');

console.log('🔍 Checking uploads directory...\n');

console.log('Uploads directory path:', uploadsDir);
console.log('Directory exists:', fs.existsSync(uploadsDir));

if (fs.existsSync(uploadsDir)) {
  const files = fs.readdirSync(uploadsDir);
  console.log('Files in uploads directory:', files.length);
  
  if (files.length > 0) {
    console.log('\nFirst 10 files:');
    files.slice(0, 10).forEach((file, index) => {
      const filePath = path.join(uploadsDir, file);
      const stats = fs.statSync(filePath);
      console.log(`${index + 1}. ${file} (${stats.size} bytes)`);
    });
  } else {
    console.log('No files found in uploads directory');
  }
} else {
  console.log('❌ Uploads directory does not exist!');
  console.log('Creating uploads directory...');
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Uploads directory created');
}

// Check database for file records
async function checkDatabase() {
  try {
    const { getConnection } = require('../config/database');
    const pool = await getConnection();
    
    const result = await pool.request().query(`
      SELECT TOP 5 id, url, type_mime, taille_mo, date_upload 
      FROM PieceJointe 
      ORDER BY date_upload DESC
    `);
    
    console.log('\n📊 Recent files in database:');
    if (result.recordset.length > 0) {
      result.recordset.forEach((file, index) => {
        const filePath = path.join(uploadsDir, file.url);
        const exists = fs.existsSync(filePath);
        console.log(`${index + 1}. ID: ${file.id}, File: ${file.url}, Exists: ${exists ? '✅' : '❌'}`);
      });
    } else {
      console.log('No files found in database');
    }
    
  } catch (error) {
    console.log('❌ Database check failed:', error.message);
  }
}

checkDatabase();