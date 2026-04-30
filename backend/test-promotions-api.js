/**
 * Test script for vehicle promotions and welcome messages API
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testPromotionsAPI() {
  console.log('\n🧪 Testing Vehicle Promotions API...\n');

  try {
    // Test 1: Get active promotions (PUBLIC - no auth)
    console.log('1️⃣ Testing GET /api/vehicle-promotions/public/active (PUBLIC)');
    const response1 = await axios.get(`${BASE_URL}/api/vehicle-promotions/public/active`);
    console.log('✅ Success:', response1.status);
    console.log('   Promotions found:', response1.data.promotions?.length || 0);
  } catch (error) {
    console.error('❌ Error:', error.response?.status, error.response?.data || error.message);
  }

  try {
    // Test 2: Get promotion by ID (PUBLIC)
    console.log('\n2️⃣ Testing GET /api/vehicle-promotions/public/1 (PUBLIC)');
    const response2 = await axios.get(`${BASE_URL}/api/vehicle-promotions/public/1`);
    console.log('✅ Success:', response2.status);
    console.log('   Promotion:', response2.data.promotion?.titre || 'N/A');
  } catch (error) {
    console.error('❌ Error:', error.response?.status, error.response?.data || error.message);
  }

  try {
    // Test 3: Get all promotions (ADMIN - should fail without auth)
    console.log('\n3️⃣ Testing GET /api/vehicle-promotions (ADMIN - no auth)');
    const response3 = await axios.get(`${BASE_URL}/api/vehicle-promotions`);
    console.log('✅ Success:', response3.status);
  } catch (error) {
    console.error('❌ Expected error:', error.response?.status, error.response?.data?.error || error.message);
  }
}

async function testWelcomeMessagesAPI() {
  console.log('\n\n🧪 Testing Welcome Messages API...\n');

  try {
    // Test 1: Get active messages (AUTH REQUIRED - should fail)
    console.log('1️⃣ Testing GET /api/welcome-messages/active (AUTH REQUIRED - no auth)');
    const response1 = await axios.get(`${BASE_URL}/api/welcome-messages/active`);
    console.log('✅ Success:', response1.status);
  } catch (error) {
    console.error('❌ Expected error:', error.response?.status, error.response?.data?.error || error.message);
  }

  try {
    // Test 2: Get all messages (ADMIN - should fail without auth)
    console.log('\n2️⃣ Testing GET /api/welcome-messages (ADMIN - no auth)');
    const response2 = await axios.get(`${BASE_URL}/api/welcome-messages`);
    console.log('✅ Success:', response2.status);
  } catch (error) {
    console.error('❌ Expected error:', error.response?.status, error.response?.data?.error || error.message);
  }
}

async function runTests() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  TESTING PROMOTIONS & WELCOME MESSAGES API');
  console.log('═══════════════════════════════════════════════════════');

  await testPromotionsAPI();
  await testWelcomeMessagesAPI();

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  TESTS COMPLETED');
  console.log('═══════════════════════════════════════════════════════\n');
}

runTests();
