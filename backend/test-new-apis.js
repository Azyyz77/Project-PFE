/**
 * Script de test pour les nouvelles API
 * - Welcome Messages
 * - Appointment History
 * - Intervention Catalog
 * - Vehicle Promotions
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Couleurs pour le terminal
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testAPI(name, method, url, data = null, token = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: {}
    };
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    log(`✅ ${name}: SUCCESS`, 'green');
    log(`   Status: ${response.status}`, 'blue');
    if (response.data.data) {
      const count = Array.isArray(response.data.data) ? response.data.data.length : 1;
      log(`   Data: ${count} item(s)`, 'blue');
    }
    return { success: true, data: response.data };
  } catch (error) {
    log(`❌ ${name}: FAILED`, 'red');
    if (error.response) {
      log(`   Status: ${error.response.status}`, 'yellow');
      log(`   Error: ${error.response.data.error || error.message}`, 'yellow');
    } else {
      log(`   Error: ${error.message}`, 'yellow');
    }
    return { success: false, error: error.message };
  }
}

async function runTests() {
  log('\n========================================', 'blue');
  log('TEST DES NOUVELLES API', 'blue');
  log('========================================\n', 'blue');
  
  let results = {
    total: 0,
    passed: 0,
    failed: 0
  };
  
  // ============================================
  // 1. INTERVENTION CATALOG
  // ============================================
  log('\n1. INTERVENTION CATALOG', 'yellow');
  log('----------------------------', 'yellow');
  
  let test = await testAPI(
    'GET Interventions Catalog',
    'GET',
    '/catalog/interventions'
  );
  results.total++;
  if (test.success) results.passed++; else results.failed++;
  
  // ============================================
  // 2. VEHICLE PROMOTIONS
  // ============================================
  log('\n2. VEHICLE PROMOTIONS', 'yellow');
  log('----------------------------', 'yellow');
  
  test = await testAPI(
    'GET Vehicle Promotions',
    'GET',
    '/vehicle-promotions'
  );
  results.total++;
  if (test.success) results.passed++; else results.failed++;
  
  test = await testAPI(
    'GET Active Promotions',
    'GET',
    '/vehicle-promotions/active'
  );
  results.total++;
  if (test.success) results.passed++; else results.failed++;
  
  // ============================================
  // 3. WELCOME MESSAGES (Sans Auth)
  // ============================================
  log('\n3. WELCOME MESSAGES (Public)', 'yellow');
  log('----------------------------', 'yellow');
  
  log('⚠️  Note: Ces endpoints nécessitent une authentification', 'yellow');
  log('   Pour tester complètement, utilisez un token JWT valide\n', 'yellow');
  
  // ============================================
  // 4. APPOINTMENT HISTORY (Sans Auth)
  // ============================================
  log('\n4. APPOINTMENT HISTORY (Public)', 'yellow');
  log('----------------------------', 'yellow');
  
  log('⚠️  Note: Ces endpoints nécessitent une authentification', 'yellow');
  log('   Pour tester complètement, utilisez un token JWT valide\n', 'yellow');
  
  // ============================================
  // 5. FEEDBACK
  // ============================================
  log('\n5. FEEDBACK', 'yellow');
  log('----------------------------', 'yellow');
  
  test = await testAPI(
    'GET All Feedback',
    'GET',
    '/feedback'
  );
  results.total++;
  if (test.success) results.passed++; else results.failed++;
  
  // ============================================
  // 6. AUDIT LOGS (Nécessite Auth Admin)
  // ============================================
  log('\n6. AUDIT LOGS', 'yellow');
  log('----------------------------', 'yellow');
  
  log('⚠️  Note: Endpoint nécessite authentification ADMIN', 'yellow');
  log('   Pour tester, utilisez un token JWT admin\n', 'yellow');
  
  // ============================================
  // RÉSUMÉ
  // ============================================
  log('\n========================================', 'blue');
  log('RÉSUMÉ DES TESTS', 'blue');
  log('========================================', 'blue');
  log(`Total: ${results.total}`, 'blue');
  log(`✅ Réussis: ${results.passed}`, 'green');
  log(`❌ Échoués: ${results.failed}`, 'red');
  log(`Taux de réussite: ${Math.round((results.passed / results.total) * 100)}%\n`, 'blue');
  
  // ============================================
  // VÉRIFICATION BASE DE DONNÉES
  // ============================================
  log('\n========================================', 'blue');
  log('VÉRIFICATION BASE DE DONNÉES', 'blue');
  log('========================================\n', 'blue');
  
  log('Pour vérifier les données dans la BDD:', 'yellow');
  log('sqlcmd -S localhost -d STA_SAV_DB -U dali -P Daligh2004 -Q "', 'blue');
  log('SELECT \'InterventionCatalog\' AS TableName, COUNT(*) AS Lignes FROM InterventionCatalog', 'blue');
  log('UNION ALL SELECT \'PromotionVehicule\', COUNT(*) FROM PromotionVehicule', 'blue');
  log('UNION ALL SELECT \'MessageAccueil\', COUNT(*) FROM MessageAccueil', 'blue');
  log('UNION ALL SELECT \'Feedback\', COUNT(*) FROM Feedback', 'blue');
  log('UNION ALL SELECT \'HistoriqueRDV\', COUNT(*) FROM HistoriqueRDV', 'blue');
  log('UNION ALL SELECT \'MessageLecture\', COUNT(*) FROM MessageLecture', 'blue');
  log('UNION ALL SELECT \'AuditLog\', COUNT(*) FROM AuditLog', 'blue');
  log('ORDER BY TableName;"', 'blue');
  log('', 'reset');
  
  // ============================================
  // ENDPOINTS DISPONIBLES
  // ============================================
  log('\n========================================', 'blue');
  log('NOUVEAUX ENDPOINTS DISPONIBLES', 'blue');
  log('========================================\n', 'blue');
  
  log('Welcome Messages:', 'yellow');
  log('  GET    /api/welcome-messages/active (Auth)', 'blue');
  log('  GET    /api/welcome-messages (Admin)', 'blue');
  log('  GET    /api/welcome-messages/:id (Auth)', 'blue');
  log('  POST   /api/welcome-messages (Admin)', 'blue');
  log('  PUT    /api/welcome-messages/:id (Admin)', 'blue');
  log('  DELETE /api/welcome-messages/:id (Admin)', 'blue');
  log('  POST   /api/welcome-messages/:id/mark-read (Auth)', 'blue');
  log('  GET    /api/welcome-messages/:id/stats (Admin)\n', 'blue');
  
  log('Appointment History:', 'yellow');
  log('  GET    /api/appointments/:id/history (Auth)', 'blue');
  log('  POST   /api/appointments/:id/history (Agent/Admin)', 'blue');
  log('  GET    /api/appointments/history/recent (Agent/Admin)', 'blue');
  log('  GET    /api/appointments/history/stats (Admin/Direction)', 'blue');
  log('  GET    /api/appointments/history/user/:userId (Admin)', 'blue');
  log('  DELETE /api/appointments/:id/history/:historyId (Admin)\n', 'blue');
  
  log('Intervention Catalog:', 'yellow');
  log('  GET    /api/catalog/interventions (Public)', 'blue');
  log('  GET    /api/catalog/interventions/:id (Public)', 'blue');
  log('  POST   /api/catalog/interventions (Admin)', 'blue');
  log('  PUT    /api/catalog/interventions/:id (Admin)', 'blue');
  log('  DELETE /api/catalog/interventions/:id (Admin)\n', 'blue');
  
  log('Vehicle Promotions:', 'yellow');
  log('  GET    /api/vehicle-promotions (Public)', 'blue');
  log('  GET    /api/vehicle-promotions/active (Public)', 'blue');
  log('  GET    /api/vehicle-promotions/:id (Public)', 'blue');
  log('  POST   /api/vehicle-promotions (Admin)', 'blue');
  log('  PUT    /api/vehicle-promotions/:id (Admin)', 'blue');
  log('  DELETE /api/vehicle-promotions/:id (Admin)\n', 'blue');
  
  log('\n========================================', 'green');
  log('✅ TESTS TERMINÉS', 'green');
  log('========================================\n', 'green');
}

// Exécuter les tests
runTests().catch(error => {
  log(`\n❌ Erreur fatale: ${error.message}`, 'red');
  process.exit(1);
});
