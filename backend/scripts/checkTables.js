require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { getConnection, closeConnection } = require('../config/database');

async function checkTables() {
  try {
    const pool = await getConnection();
    
    console.log('📊 Checking database tables...\n');
    
    // Get all tables
    const tables = await pool.request().query(`
      SELECT 
        t.name AS TableName,
        COUNT(c.column_id) AS ColumnCount
      FROM sys.tables t
      LEFT JOIN sys.columns c ON t.object_id = c.object_id
      GROUP BY t.name
      ORDER BY t.name
    `);
    
    console.log('All tables in database:');
    tables.recordset.forEach(row => {
      console.log(`  - ${row.TableName} (${row.ColumnCount} columns)`);
    });
    
    console.log('\n📋 Checking for appointment-related tables...\n');
    
    const appointmentTables = await pool.request().query(`
      SELECT name 
      FROM sys.tables 
      WHERE name LIKE '%rdv%' OR name LIKE '%appointment%' OR name LIKE '%rendez%'
      ORDER BY name
    `);
    
    if (appointmentTables.recordset.length > 0) {
      console.log('Found appointment-related tables:');
      appointmentTables.recordset.forEach(row => {
        console.log(`  - ${row.name}`);
      });
    } else {
      console.log('No appointment-related tables found.');
    }
    
    // Check for Feedback and Reclamation columns
    console.log('\n📋 Checking Feedback table columns...\n');
    const feedbackCols = await pool.request().query(`
      SELECT c.name, t.name AS type_name, c.max_length
      FROM sys.columns c
      JOIN sys.types t ON c.user_type_id = t.user_type_id
      WHERE object_id = OBJECT_ID('Feedback')
      ORDER BY c.column_id
    `);
    
    if (feedbackCols.recordset.length > 0) {
      console.log('Feedback columns:');
      feedbackCols.recordset.forEach(row => {
        console.log(`  - ${row.name} (${row.type_name})`);
      });
    }
    
    console.log('\n📋 Checking Reclamation table columns...\n');
    const reclamationCols = await pool.request().query(`
      SELECT c.name, t.name AS type_name, c.max_length
      FROM sys.columns c
      JOIN sys.types t ON c.user_type_id = t.user_type_id
      WHERE object_id = OBJECT_ID('Reclamation')
      ORDER BY c.column_id
    `);
    
    if (reclamationCols.recordset.length > 0) {
      console.log('Reclamation columns:');
      reclamationCols.recordset.forEach(row => {
        console.log(`  - ${row.name} (${row.type_name})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await closeConnection();
  }
}

checkTables();
