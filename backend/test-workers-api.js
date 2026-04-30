/**
 * Script pour tester les endpoints workers et diagnostiquer les erreurs
 */

const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.cyan}═══ ${msg} ═══${colors.reset}\n`)
};

async function testWorkersAPI() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST DES ENDPOINTS WORKERS');
  console.log('='.repeat(60));

  // Test 1: Backend accessible
  log.section('Test 1: Backend Accessible');
  
  try {
    const response = await axios.get(`${API_URL}/users/login`, {
      validateStatus: () => true
    });
    
    if (response.status === 400 || response.status === 401) {
      log.success('Backend est accessible (répond aux requêtes)');
    } else {
      log.warning(`Backend répond avec status: ${response.status}`);
    }
  } catch (error) {
    log.error('Backend n\'est PAS accessible!');
    log.error(`Erreur: ${error.message}`);
    log.warning('Assurez-vous que le backend est démarré: cd backend && npm start');
    return;
  }

  // Test 2: Login Agent
  log.section('Test 2: Login Agent');
  
  let token, user;
  
  try {
    const response = await axios.post(`${API_URL}/users/login`, {
      email: 'agentsav@gmail.com',
      password: 'daligh15'
    });
    
    token = response.data.token;
    user = response.data.user;
    
    log.success('Login réussi');
    log.info(`Agent: ${user.prenom} ${user.nom}`);
    log.info(`Email: ${user.email}`);
    log.info(`Rôle: ${user.role}`);
    log.info(`Agence ID: ${user.agence_id || 'NON DÉFINI ⚠️'}`);
    
    if (!user.agence_id) {
      log.error('PROBLÈME: Agent n\'a pas d\'agence_id!');
      log.warning('Exécutez: UPDATE Utilisateur SET agence_id = 1 WHERE email = \'agentsav@gmail.com\'');
      return;
    }
    
    // Vérifier le token
    const tokenParts = token.split('.');
    const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
    
    log.info(`Token agence_id: ${payload.agence_id || 'NON DÉFINI ⚠️'}`);
    
    if (!payload.agence_id) {
      log.error('PROBLÈME: Token ne contient pas agence_id!');
      log.warning('Le backend n\'a PAS été redémarré avec les nouvelles modifications.');
      log.warning('Action: Redémarrez le backend (Ctrl+C puis npm start)');
      return;
    }
    
  } catch (error) {
    log.error(`Échec login: ${error.message}`);
    if (error.response) {
      log.error(`Status: ${error.response.status}`);
      log.error(`Data: ${JSON.stringify(error.response.data)}`);
    }
    return;
  }

  // Test 3: GET Workers by Agency
  log.section('Test 3: GET /api/workers/agency/:agenceId');
  
  try {
    const response = await axios.get(`${API_URL}/workers/agency/${user.agence_id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    log.success(`Succès: ${response.status}`);
    log.info(`Nombre d'ouvriers: ${response.data.workers?.length || 0}`);
    
  } catch (error) {
    log.error(`Échec: ${error.message}`);
    if (error.response) {
      log.error(`Status: ${error.response.status}`);
      log.error(`Data: ${JSON.stringify(error.response.data)}`);
      
      if (error.response.status === 403) {
        log.warning('Erreur 403: Vérifiez que les vérifications de sécurité sont correctes');
      } else if (error.response.status === 500) {
        log.warning('Erreur 500: Problème serveur - vérifiez les logs backend');
      }
    } else {
      log.error('Pas de réponse du serveur');
    }
  }

  // Test 4: GET Agency Assignments
  log.section('Test 4: GET /api/workers/agency/:agenceId/assignments');
  
  try {
    const response = await axios.get(`${API_URL}/workers/agency/${user.agence_id}/assignments`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    log.success(`Succès: ${response.status}`);
    log.info(`Nombre d'affectations: ${response.data.assignments?.length || 0}`);
    
  } catch (error) {
    log.error(`Échec: ${error.message}`);
    if (error.response) {
      log.error(`Status: ${error.response.status}`);
      log.error(`Data: ${JSON.stringify(error.response.data)}`);
    }
  }

  // Test 5: GET Unassigned Appointments
  log.section('Test 5: GET /api/workers/agency/:agenceId/unassigned-appointments');
  
  try {
    const response = await axios.get(`${API_URL}/workers/agency/${user.agence_id}/unassigned-appointments`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    log.success(`Succès: ${response.status}`);
    log.info(`Nombre de RDV non affectés: ${response.data.appointments?.length || 0}`);
    
  } catch (error) {
    log.error(`Échec: ${error.message}`);
    if (error.response) {
      log.error(`Status: ${error.response.status}`);
      log.error(`Data: ${JSON.stringify(error.response.data)}`);
    }
  }

  // Résumé
  log.section('RÉSUMÉ');
  
  console.log('Si tous les tests passent:');
  log.success('✓ Backend fonctionne correctement');
  log.success('✓ Agent a un agence_id');
  log.success('✓ Token contient agence_id');
  log.success('✓ Endpoints workers fonctionnent');
  
  console.log('\nSi des tests échouent:');
  log.warning('1. Vérifiez que le backend est démarré');
  log.warning('2. Vérifiez que l\'agent a agence_id en base');
  log.warning('3. Redémarrez le backend si nécessaire');
  log.warning('4. Reconnectez-vous pour obtenir un nouveau token');
  
  console.log('\n' + '='.repeat(60) + '\n');
}

testWorkersAPI().catch(error => {
  log.error(`Erreur fatale: ${error.message}`);
  console.error(error);
  process.exit(1);
});
