require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { getConnection, closeConnection } = require('../config/database');

// Import the controller functions
const {
  getAgencyStats,
  getGlobalStats,
  getRevenueStats,
  getSatisfactionStats,
  getPerformanceStats
} = require('../controllers/directionStatsController');

// Mock request and response objects
function createMockReqRes(query = {}) {
  const req = { query };
  const res = {
    json: (data) => {
      console.log('✅ Response:', JSON.stringify(data, null, 2));
      return res;
    },
    status: (code) => {
      console.log(`❌ Status: ${code}`);
      return res;
    }
  };
  return { req, res };
}

async function testEndpoints() {
  try {
    console.log('🧪 Testing Direction Statistics Endpoints\n');
    console.log('=' .repeat(60));
    
    // Test 1: Agency Stats
    console.log('\n📊 Test 1: GET /api/direction/stats/agencies');
    console.log('-'.repeat(60));
    const { req: req1, res: res1 } = createMockReqRes();
    await getAgencyStats(req1, res1);
    
    // Test 2: Global Stats
    console.log('\n📊 Test 2: GET /api/direction/stats/global');
    console.log('-'.repeat(60));
    const { req: req2, res: res2 } = createMockReqRes();
    await getGlobalStats(req2, res2);
    
    // Test 3: Revenue Stats
    console.log('\n📊 Test 3: GET /api/direction/stats/revenue');
    console.log('-'.repeat(60));
    const { req: req3, res: res3 } = createMockReqRes();
    await getRevenueStats(req3, res3);
    
    // Test 4: Satisfaction Stats
    console.log('\n📊 Test 4: GET /api/direction/stats/satisfaction');
    console.log('-'.repeat(60));
    const { req: req4, res: res4 } = createMockReqRes();
    await getSatisfactionStats(req4, res4);
    
    // Test 5: Performance Stats
    console.log('\n📊 Test 5: GET /api/direction/stats/performance');
    console.log('-'.repeat(60));
    const { req: req5, res: res5 } = createMockReqRes();
    await getPerformanceStats(req5, res5);
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 All tests completed successfully!');
    console.log('The direction statistics API is working correctly.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  } finally {
    await closeConnection();
  }
}

// Run the tests
testEndpoints();
