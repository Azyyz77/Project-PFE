const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

// Test token - you'll need to replace this with a valid admin/agent token
const TEST_TOKEN = 'your-admin-token-here';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Authorization': `Bearer ${TEST_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

async function testModerationEndpoints() {
  console.log('🧪 Testing Moderation API Endpoints...\n');

  try {
    // Test 1: Get pending files
    console.log('1. Testing GET /moderation/pending');
    try {
      const response = await api.get('/moderation/pending');
      console.log('✅ Success:', response.data);
    } catch (error) {
      console.log('❌ Error:', error.response?.data || error.message);
    }

    // Test 2: Get moderation stats (admin only)
    console.log('\n2. Testing GET /moderation/stats');
    try {
      const response = await api.get('/moderation/stats');
      console.log('✅ Success:', response.data);
    } catch (error) {
      console.log('❌ Error:', error.response?.data || error.message);
    }

    // Test 3: Get moderation history
    console.log('\n3. Testing GET /moderation/history');
    try {
      const response = await api.get('/moderation/history');
      console.log('✅ Success:', response.data);
    } catch (error) {
      console.log('❌ Error:', error.response?.data || error.message);
    }

    // Test 4: Test route registration
    console.log('\n4. Testing route registration');
    try {
      const response = await axios.get(`${API_BASE}/moderation/pending`);
      console.log('✅ Route is registered');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Route is registered (authentication required)');
      } else if (error.response?.status === 404) {
        console.log('❌ Route not found - check server.js registration');
      } else {
        console.log('❌ Error:', error.response?.data || error.message);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Test database connection and table structure
async function testDatabaseStructure() {
  console.log('\n🗄️  Testing Database Structure...\n');
  
  const { getConnection } = require('../config/database');
  
  try {
    const pool = await getConnection();
    
    // Check if moderation columns exist
    const result = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'PieceJointe' 
      AND COLUMN_NAME IN ('statut_moderation', 'modere_par', 'date_moderation', 'commentaire_moderation')
      ORDER BY COLUMN_NAME
    `);
    
    console.log('Moderation columns in PieceJointe table:');
    if (result.recordset.length > 0) {
      result.recordset.forEach(col => {
        console.log(`✅ ${col.COLUMN_NAME} (${col.DATA_TYPE}, nullable: ${col.IS_NULLABLE})`);
      });
    } else {
      console.log('❌ No moderation columns found. Run the migration script.');
    }
    
    // Check for sample data
    const countResult = await pool.request().query(`
      SELECT 
        statut_moderation,
        COUNT(*) as count
      FROM PieceJointe 
      GROUP BY statut_moderation
    `);
    
    console.log('\nFile moderation status distribution:');
    if (countResult.recordset.length > 0) {
      countResult.recordset.forEach(row => {
        console.log(`📊 ${row.statut_moderation}: ${row.count} files`);
      });
    } else {
      console.log('📊 No files in database');
    }
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  }
}

async function runAllTests() {
  await testDatabaseStructure();
  await testModerationEndpoints();
  
  console.log('\n🎯 Test Summary:');
  console.log('- Database structure: Check the output above');
  console.log('- API endpoints: Replace TEST_TOKEN with valid admin token to test');
  console.log('- Frontend: Navigate to /dashboard/admin/moderation to test UI');
  
  process.exit(0);
}

runAllTests();