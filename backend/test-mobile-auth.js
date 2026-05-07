/**
 * Script de test pour vérifier l'authentification mobile
 * 
 * Ce script teste:
 * 1. La connexion avec un compte CLIENT
 * 2. La récupération des données avec le token
 * 3. Les routes utilisées par l'app mobile
 * 
 * Usage: node test-mobile-auth.js
 */

const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

// Couleurs pour les logs
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  step: (msg) => console.log(`${colors.cyan}🔹 ${msg}${colors.reset}`),
};

// Credentials de test
const TEST_USER = {
  email: 'mobile@test.com',
  password: 'password123',
};

let authToken = null;
let userId = null;

/**
 * Test 1: Connexion
 */
async function testLogin() {
  log.step('Test 1: Connexion avec compte CLIENT');
  
  try {
    const response = await axios.post(`${API_URL}/users/login`, TEST_USER);
    
    if (response.status === 200) {
      log.success('Connexion réussie');
      
      const { token, user } = response.data;
      
      if (!token) {
        log.error('Token manquant dans la réponse');
        return false;
      }
      
      if (!user) {
        log.error('User manquant dans la réponse');
        return false;
      }
      
      log.info(`Token reçu: ${token.substring(0, 30)}...`);
      log.info(`User: ${user.prenom} ${user.nom} (${user.email})`);
      log.info(`Role: ${user.role}`);
      log.info(`ID: ${user.id}`);
      
      if (user.role !== 'CLIENT') {
        log.error(`Rôle incorrect: ${user.role} (attendu: CLIENT)`);
        return false;
      }
      
      authToken = token;
      userId = user.id;
      
      log.success('Token et user stockés pour les tests suivants');
      return true;
    }
  } catch (error) {
    if (error.response) {
      log.error(`Erreur ${error.response.status}: ${error.response.data.error || error.response.data.message}`);
    } else if (error.request) {
      log.error('Aucune réponse du serveur - Backend démarré?');
    } else {
      log.error(`Erreur: ${error.message}`);
    }
    return false;
  }
}

/**
 * Test 2: Récupération des véhicules
 */
async function testGetVehicles() {
  log.step('Test 2: Récupération des véhicules');
  
  if (!authToken || !userId) {
    log.error('Token ou userId manquant - Test de connexion échoué?');
    return false;
  }
  
  try {
    const response = await axios.get(`${API_URL}/vehicles/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    
    if (response.status === 200) {
      log.success('Véhicules récupérés avec succès');
      
      const vehicles = response.data.vehicles || response.data;
      log.info(`Nombre de véhicules: ${vehicles.length}`);
      
      if (vehicles.length > 0) {
        log.info(`Premier véhicule: ${vehicles[0].marque} ${vehicles[0].modele}`);
      }
      
      return true;
    }
  } catch (error) {
    if (error.response) {
      log.error(`Erreur ${error.response.status}: ${error.response.data.error || error.response.data.message}`);
      
      if (error.response.status === 401) {
        log.warning('Token invalide ou expiré');
      }
    } else {
      log.error(`Erreur: ${error.message}`);
    }
    return false;
  }
}

/**
 * Test 3: Récupération des rendez-vous
 */
async function testGetAppointments() {
  log.step('Test 3: Récupération des rendez-vous');
  
  if (!authToken) {
    log.error('Token manquant');
    return false;
  }
  
  try {
    const response = await axios.get(`${API_URL}/appointments/my`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    
    if (response.status === 200) {
      log.success('Rendez-vous récupérés avec succès');
      
      const appointments = response.data.appointments || response.data;
      log.info(`Nombre de rendez-vous: ${appointments.length}`);
      
      return true;
    }
  } catch (error) {
    if (error.response) {
      log.error(`Erreur ${error.response.status}: ${error.response.data.error || error.response.data.message}`);
    } else {
      log.error(`Erreur: ${error.message}`);
    }
    return false;
  }
}

/**
 * Test 4: Récupération des réclamations
 */
async function testGetComplaints() {
  log.step('Test 4: Récupération des réclamations');
  
  if (!authToken) {
    log.error('Token manquant');
    return false;
  }
  
  try {
    const response = await axios.get(`${API_URL}/complaints/my-complaints`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    
    if (response.status === 200) {
      log.success('Réclamations récupérées avec succès');
      
      const complaints = response.data;
      log.info(`Nombre de réclamations: ${Array.isArray(complaints) ? complaints.length : 0}`);
      
      return true;
    }
  } catch (error) {
    if (error.response) {
      log.error(`Erreur ${error.response.status}: ${error.response.data.error || error.response.data.message}`);
    } else {
      log.error(`Erreur: ${error.message}`);
    }
    return false;
  }
}

/**
 * Test 5: Récupération des notifications
 */
async function testGetNotifications() {
  log.step('Test 5: Récupération des notifications');
  
  if (!authToken) {
    log.error('Token manquant');
    return false;
  }
  
  try {
    const response = await axios.get(`${API_URL}/notifications`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    
    if (response.status === 200) {
      log.success('Notifications récupérées avec succès');
      
      const notifications = response.data.notifications || response.data;
      log.info(`Nombre de notifications: ${Array.isArray(notifications) ? notifications.length : 0}`);
      
      return true;
    }
  } catch (error) {
    if (error.response) {
      log.error(`Erreur ${error.response.status}: ${error.response.data.error || error.response.data.message}`);
    } else {
      log.error(`Erreur: ${error.message}`);
    }
    return false;
  }
}

/**
 * Test 6: Test sans token (doit échouer avec 401)
 */
async function testWithoutToken() {
  log.step('Test 6: Requête sans token (doit échouer)');
  
  try {
    await axios.get(`${API_URL}/vehicles/user/${userId || 1}`);
    log.error('La requête a réussi sans token - Problème de sécurité!');
    return false;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      log.success('Requête correctement rejetée (401) sans token');
      return true;
    } else {
      log.error(`Erreur inattendue: ${error.message}`);
      return false;
    }
  }
}

/**
 * Exécuter tous les tests
 */
async function runAllTests() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 TEST DE L\'AUTHENTIFICATION MOBILE');
  console.log('='.repeat(60) + '\n');
  
  log.info(`API URL: ${API_URL}`);
  log.info(`Test User: ${TEST_USER.email}`);
  console.log('');
  
  const results = {
    login: false,
    vehicles: false,
    appointments: false,
    complaints: false,
    notifications: false,
    security: false,
  };
  
  // Test 1: Connexion
  results.login = await testLogin();
  console.log('');
  
  if (!results.login) {
    log.error('Test de connexion échoué - Arrêt des tests');
    log.warning('Vérifiez que:');
    log.warning('1. Le backend est démarré (node server.js)');
    log.warning('2. Le compte mobile@test.com existe en base');
    log.warning('3. Le rôle du compte est CLIENT');
    return;
  }
  
  // Test 2: Véhicules
  results.vehicles = await testGetVehicles();
  console.log('');
  
  // Test 3: Rendez-vous
  results.appointments = await testGetAppointments();
  console.log('');
  
  // Test 4: Réclamations
  results.complaints = await testGetComplaints();
  console.log('');
  
  // Test 5: Notifications
  results.notifications = await testGetNotifications();
  console.log('');
  
  // Test 6: Sécurité
  results.security = await testWithoutToken();
  console.log('');
  
  // Résumé
  console.log('='.repeat(60));
  console.log('📊 RÉSUMÉ DES TESTS');
  console.log('='.repeat(60));
  
  const tests = [
    { name: 'Connexion', result: results.login },
    { name: 'Véhicules', result: results.vehicles },
    { name: 'Rendez-vous', result: results.appointments },
    { name: 'Réclamations', result: results.complaints },
    { name: 'Notifications', result: results.notifications },
    { name: 'Sécurité', result: results.security },
  ];
  
  tests.forEach(test => {
    const status = test.result ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} - ${test.name}`);
  });
  
  const passedTests = tests.filter(t => t.result).length;
  const totalTests = tests.length;
  
  console.log('');
  console.log(`Total: ${passedTests}/${totalTests} tests réussis`);
  
  if (passedTests === totalTests) {
    log.success('Tous les tests sont passés! 🎉');
    log.info('L\'authentification mobile fonctionne correctement');
  } else {
    log.warning(`${totalTests - passedTests} test(s) échoué(s)`);
    log.info('Consultez le guide DIAGNOSTIC_COMPLET_401.md pour résoudre les problèmes');
  }
  
  console.log('='.repeat(60) + '\n');
}

// Exécuter les tests
runAllTests().catch(error => {
  log.error(`Erreur fatale: ${error.message}`);
  process.exit(1);
});
