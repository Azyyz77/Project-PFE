require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { getConnection, closeConnection } = require('../config/database');

async function checkPieceJointeTable() {
  try {
    const pool = await getConnection();
    
    console.log('📋 Checking PieceJointe table columns...\n');
    
    const columns = await pool.request().query(`
      SELECT 
        c.name AS column_name,
        t.name AS data_type,
        c.max_length,
        c.is_nullable
      FROM sys.columns c
      JOIN sys.types t ON c.user_type_id = t.user_type_id
      WHERE object_id = OBJECT_ID('PieceJointe')
      ORDER BY c.column_id
    `);
    
    console.log('PieceJointe columns:');
    columns.recordset.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type}${row.is_nullable ? ', nullable' : ', not null'})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await closeConnection();
  }
}

checkPieceJointeTable();
