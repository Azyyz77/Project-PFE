/**
 * Script de test pour vérifier l'isolation multi-agences
 * 
 * Ce script teste que:
 * 1. Les agents ne peuvent accéder qu'aux données de leur agence
 * 2. Les admins peuvent accéder à toutes les agences
 * 3. Les tentatives d'accès non autorisées sont bloquées
 */

const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

// Couleurs pour la console
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

/**
 * Test de connexion et récupération du token
 */
async function login(email, password) {
  try {
    const response = await axios.post(`${API_URL}/users/login`, {
      email,
      password
    });
    
    return {
      success: true,
      token: response.data.token,
      user: response.data.user
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
}

/**
 * Test d'accès aux ouvriers d'une agence
 */
async function getWorkersByAgency(token, agenceId) {
  try {
    const response = await axios.get(`${API_URL}/workers/agency/${agenceId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return {
      success: true,
      workers: response.data.workers
    };
  } catch (error) {
    return {
      success: false,
      status: error.response?.status,
      error: error.response?.data?.error || error.message,
      message: error.response?.data?.message
    };
  }
}

/**
 * Test d'accès aux affectations d'une agence
 */
async function getAgencyAssignments(token, agenceId) {
  try {
    const response = await axios.get(`${API_URL}/workers/agency/${agenceId}/assignments`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return {
      success: true,
      assignments: response.data.assignments
    };
  } catch (error) {
    return {
      success: false,
      status: error.response?.status,
      error: error.response?.data?.error || error.message,
      message: error.response?.data?.message
    };
  }
}

/**
 * Test principal
 */
async function runTests() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST D\'ISOLATION MULTI-AGENCES');
  console.log('='.repeat(60));

  // ============================================
  // ÉTAPE 1: Connexion Agent Agence 1
  // ============================================
  log.section('ÉTAPE 1: Connexion Agent SAV (Agence 1)');
  
  const agentLogin = await login('agentsav@gmail.com', 'daligh15');
  
  if (!agentLogin.success) {
    log.error(`Échec de connexion: ${agentLogin.error}`);
    log.warning('Assurez-vous que:');
    log.warning('1. Le backend est démarré (npm start)');
    log.warning('2. L\'agent existe avec email: agentsav@gmail.com');
    log.warning('3. Le mot de passe est: agent123');
    log.warning('4. L\'agent a agence_id = 1');
    return;
  }
  
  log.success('Connexion réussie');
  log.info(`Agent: ${agentLogin.user.prenom} ${agentLogin.user.nom}`);
  log.info(`Email: ${agentLogin.user.email}`);
  log.info(`Rôle: ${agentLogin.user.role}`);
  log.info(`Agence ID: ${agentLogin.user.agence_id || 'NON DÉFINI ⚠️'}`);
  
  if (!agentLogin.user.agence_id) {
    log.error('PROBLÈME: L\'agent n\'a pas d\'agence_id défini!');
    log.warning('Exécutez cette requête SQL:');
    log.warning('UPDATE Utilisateur SET agence_id = 1 WHERE email = \'agentsav@gmail.com\'');
    return;
  }

  const agentToken = agentLogin.token;
  const agentAgenceId = agentLogin.user.agence_id;

  // ============================================
  // ÉTAPE 2: Test Accès Autorisé (Propre Agence)
  // ============================================
  log.section('ÉTAPE 2: Test Accès Autorisé (Propre Agence)');
  
  log.info(`Agent tente d'accéder aux ouvriers de l'agence ${agentAgenceId} (SA propre agence)`);
  const ownAgencyWorkers = await getWorkersByAgency(agentToken, agentAgenceId);
  
  if (ownAgencyWorkers.success) {
    log.success(`✓ AUTORISÉ: Agent peut accéder aux ouvriers de son agence`);
    log.info(`Nombre d'ouvriers: ${ownAgencyWorkers.workers.length}`);
  } else {
    log.error(`✗ ÉCHEC: Agent ne peut pas accéder à son agence (${ownAgencyWorkers.status})`);
    log.error(`Erreur: ${ownAgencyWorkers.error}`);
    log.error(`Message: ${ownAgencyWorkers.message}`);
  }

  log.info(`Agent tente d'accéder aux affectations de l'agence ${agentAgenceId}`);
  const ownAgencyAssignments = await getAgencyAssignments(agentToken, agentAgenceId);
  
  if (ownAgencyAssignments.success) {
    log.success(`✓ AUTORISÉ: Agent peut accéder aux affectations de son agence`);
    log.info(`Nombre d'affectations: ${ownAgencyAssignments.assignments.length}`);
  } else {
    log.error(`✗ ÉCHEC: Agent ne peut pas accéder aux affectations (${ownAgencyAssignments.status})`);
  }

  // ============================================
  // ÉTAPE 3: Test Accès Refusé (Autre Agence)
  // ============================================
  log.section('ÉTAPE 3: Test Accès Refusé (Autre Agence)');
  
  // Choisir une agence différente de celle de l'agent
  const otherAgenceId = agentAgenceId === 1 ? 2 : 1;
  
  log.info(`Agent (agence ${agentAgenceId}) tente d'accéder aux ouvriers de l'agence ${otherAgenceId} (AUTRE agence)`);
  const otherAgencyWorkers = await getWorkersByAgency(agentToken, otherAgenceId);
  
  if (!otherAgencyWorkers.success && otherAgencyWorkers.status === 403) {
    log.success(`✓ SÉCURITÉ OK: Accès refusé (403 Forbidden)`);
    log.info(`Message: ${otherAgencyWorkers.message}`);
  } else if (otherAgencyWorkers.success) {
    log.error(`✗ FAILLE DE SÉCURITÉ: Agent peut accéder à une autre agence!`);
    log.error(`Nombre d'ouvriers accessibles: ${otherAgencyWorkers.workers.length}`);
    log.error('CRITIQUE: L\'isolation multi-agences ne fonctionne pas!');
  } else {
    log.warning(`⚠ Erreur inattendue: ${otherAgencyWorkers.status} - ${otherAgencyWorkers.error}`);
  }

  log.info(`Agent (agence ${agentAgenceId}) tente d'accéder aux affectations de l'agence ${otherAgenceId}`);
  const otherAgencyAssignments = await getAgencyAssignments(agentToken, otherAgenceId);
  
  if (!otherAgencyAssignments.success && otherAgencyAssignments.status === 403) {
    log.success(`✓ SÉCURITÉ OK: Accès aux affectations refusé (403 Forbidden)`);
  } else if (otherAgencyAssignments.success) {
    log.error(`✗ FAILLE DE SÉCURITÉ: Agent peut accéder aux affectations d'une autre agence!`);
  }

  // ============================================
  // ÉTAPE 4: Test Admin (Accès Global)
  // ============================================
  log.section('ÉTAPE 4: Test Admin (Accès Global)');
  
  log.info('Tentative de connexion admin...');
  const adminLogin = await login('admin@sta-chery.tn', 'admin123');
  
  if (!adminLogin.success) {
    log.warning('Admin non disponible pour test (optionnel)');
    log.info('Pour tester l\'admin, créez un compte avec:');
    log.info('Email: admin@sta-chery.tn, Password: admin123, Role: ADMIN');
  } else {
    log.success('Admin connecté');
    log.info(`Admin: ${adminLogin.user.prenom} ${adminLogin.user.nom}`);
    
    const adminToken = adminLogin.token;
    
    // Test accès agence 1
    log.info('Admin tente d\'accéder à l\'agence 1');
    const adminAgency1 = await getWorkersByAgency(adminToken, 1);
    
    if (adminAgency1.success) {
      log.success(`✓ Admin peut accéder à l'agence 1 (${adminAgency1.workers.length} ouvriers)`);
    } else {
      log.error(`✗ Admin ne peut pas accéder à l'agence 1`);
    }
    
    // Test accès agence 2
    log.info('Admin tente d\'accéder à l\'agence 2');
    const adminAgency2 = await getWorkersByAgency(adminToken, 2);
    
    if (adminAgency2.success) {
      log.success(`✓ Admin peut accéder à l'agence 2 (${adminAgency2.workers.length} ouvriers)`);
    } else {
      log.warning(`⚠ Admin ne peut pas accéder à l'agence 2 (peut-être vide)`);
    }
  }

  // ============================================
  // RÉSUMÉ
  // ============================================
  log.section('RÉSUMÉ DES TESTS');
  
  console.log('Tests d\'isolation multi-agences:');
  console.log(`  ${ownAgencyWorkers.success ? '✓' : '✗'} Agent accède à sa propre agence`);
  console.log(`  ${!otherAgencyWorkers.success && otherAgencyWorkers.status === 403 ? '✓' : '✗'} Agent bloqué pour autre agence`);
  
  if (ownAgencyWorkers.success && !otherAgencyWorkers.success && otherAgencyWorkers.status === 403) {
    log.success('\n🎉 TOUS LES TESTS PASSÉS: L\'isolation multi-agences fonctionne correctement!');
  } else {
    log.error('\n❌ ÉCHEC: Des problèmes de sécurité ont été détectés!');
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
}

// Exécuter les tests
runTests().catch(error => {
  log.error(`Erreur fatale: ${error.message}`);
  console.error(error);
  process.exit(1);
});
