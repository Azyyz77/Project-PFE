/**
 * Script pour vérifier si le backend a été redémarré avec les nouvelles modifications
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

async function testBackendVersion() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST DE VERSION DU BACKEND');
  console.log('='.repeat(60));

  log.section('Test 1: Connexion Agent');

  try {
    // Connexion
    const loginResponse = await axios.post(`${API_URL}/users/login`, {
      email: 'agentsav@gmail.com',
      password: 'agent123'
    });

    const token = loginResponse.data.token;
    const user = loginResponse.data.user;

    log.success('Connexion réussie');
    log.info(`Agent: ${user.prenom} ${user.nom}`);
    log.info(`Agence ID dans la réponse: ${user.agence_id || 'NON DÉFINI'}`);

    // Décoder le token pour voir ce qu'il contient
    const tokenParts = token.split('.');
    const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
    
    log.info(`Agence ID dans le token JWT: ${payload.agence_id || 'NON DÉFINI'}`);

    if (!payload.agence_id) {
      log.error('❌ PROBLÈME: agence_id n\'est PAS dans le token JWT!');
      log.warning('Le backend n\'a PAS été redémarré avec les nouvelles modifications.');
      log.warning('Action requise:');
      log.warning('1. Arrêtez le backend (Ctrl+C)');
      log.warning('2. Redémarrez: npm start');
      log.warning('3. Relancez ce test');
      return false;
    } else {
      log.success('✓ agence_id est présent dans le token JWT');
    }

    log.section('Test 2: Vérification des Sécurités');

    // Test accès à une autre agence
    const otherAgenceId = user.agence_id === 1 ? 2 : 1;
    
    log.info(`Test: Agent (agence ${user.agence_id}) tente d'accéder à l'agence ${otherAgenceId}`);

    try {
      const response = await axios.get(`${API_URL}/workers/agency/${otherAgenceId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      log.error('❌ FAILLE: Agent peut accéder à une autre agence!');
      log.error(`Réponse: ${response.status} - ${response.data.workers.length} ouvriers`);
      log.warning('Le backend n\'a PAS été redémarré avec les vérifications de sécurité.');
      return false;

    } catch (error) {
      if (error.response && error.response.status === 403) {
        log.success('✓ Accès refusé (403) - Sécurité fonctionne!');
        log.info(`Message: ${error.response.data.message}`);
        return true;
      } else {
        log.warning(`Erreur inattendue: ${error.response?.status || error.message}`);
        return false;
      }
    }

  } catch (error) {
    log.error(`Erreur: ${error.message}`);
    if (error.response) {
      log.error(`Status: ${error.response.status}`);
      log.error(`Data: ${JSON.stringify(error.response.data)}`);
    }
    return false;
  }
}

async function main() {
  const success = await testBackendVersion();

  log.section('RÉSULTAT');

  if (success) {
    log.success('🎉 Backend correctement mis à jour et redémarré!');
    log.info('Vous pouvez maintenant exécuter: node test-agency-isolation.js');
  } else {
    log.error('❌ Backend NON mis à jour');
    log.warning('');
    log.warning('ACTIONS REQUISES:');
    log.warning('1. Ouvrez le terminal du backend');
    log.warning('2. Appuyez sur Ctrl+C pour arrêter');
    log.warning('3. Exécutez: npm start');
    log.warning('4. Attendez "Server running on port 3000"');
    log.warning('5. Relancez: node test-backend-version.js');
  }

  console.log('\n' + '='.repeat(60) + '\n');
}

main().catch(error => {
  log.error(`Erreur fatale: ${error.message}`);
  process.exit(1);
});
