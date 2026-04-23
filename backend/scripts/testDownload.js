const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

async function testDownloadEndpoint() {
  console.log('🧪 Testing Download Endpoint...\n');

  try {
    // Test 1: Download without token (should fail)
    console.log('1. Testing download without token');
    try {
      const response = await axios.get(`${API_BASE}/attachments/1/download`);
      console.log('❌ Unexpected success - should require auth');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly requires authentication');
      } else {
        console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
      }
    }

    // Test 2: Check route registration
    console.log('\n2. Testing route registration');
    try {
      const response = await axios.get(`${API_BASE}/attachments/999/download`);
      console.log('Route exists but may need auth');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Route registered and requires auth');
      } else if (error.response?.status === 404) {
        console.log('✅ Route registered, file not found (expected)');
      } else {
        console.log('Status:', error.response?.status, 'Data:', error.response?.data);
      }
    }

    // Test 3: Test with invalid token
    console.log('\n3. Testing with invalid token');
    try {
      const response = await axios.get(`${API_BASE}/attachments/1/download?token=invalid`);
      console.log('❌ Should reject invalid token');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly rejects invalid token');
      } else {
        console.log('Status:', error.response?.status);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }

  console.log('\n🎯 Test Summary:');
  console.log('- Download endpoint should be accessible at /api/attachments/:id/download');
  console.log('- Should accept token via query parameter: ?token=...');
  console.log('- Should require valid authentication');
  console.log('- Check server logs for detailed error messages');
}

testDownloadEndpoint();