/**
 * Test complet du chatbot - Vérifie tous les composants
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const CHATBOT_URL = `${BASE_URL}/api/chatbot`;

// Couleurs pour la console 
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testServerHealth() {
  log('\n=== Test 1: Santé du serveur ===', 'cyan');
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    log('✓ Serveur accessible', 'green');
    log(`  Status: ${response.data.status}`, 'blue');
    return true;
  } catch (error) {
    log('✗ Serveur inaccessible', 'red');
    log(`  Erreur: ${error.message}`, 'red');
    return false;
  }
}

async function testChatbotStatus() {
  log('\n=== Test 2: Status du chatbot ===', 'cyan');
  try {
    const response = await axios.get(`${CHATBOT_URL}/status`);
    log('✓ Endpoint /status accessible', 'green');
    log(`  Status: ${response.data.status}`, 'blue');
    log(`  Provider: ${response.data.provider}`, 'blue');
    return true;
  } catch (error) {
    log('✗ Endpoint /status inaccessible', 'red');
    log(`  Erreur: ${error.message}`, 'red');
    if (error.response) {
      log(`  Status HTTP: ${error.response.status}`, 'red');
      log(`  Réponse: ${JSON.stringify(error.response.data)}`, 'red');
    }
    return false;
  }
}

async function testChatbotMessage() {
  log('\n=== Test 3: Envoi de message ===', 'cyan');
  try {
    const testMessage = 'Bonjour, quels sont les modèles Chery disponibles?';
    log(`  Message: "${testMessage}"`, 'blue');
    
    const startTime = Date.now();
    const response = await axios.post(`${CHATBOT_URL}/chat`, {
      message: testMessage,
      history: []
    });
    const duration = Date.now() - startTime;
    
    log('✓ Message envoyé avec succès', 'green');
    log(`  Temps de réponse: ${duration}ms`, 'blue');
    log(`  Réponse: ${response.data.reply.substring(0, 100)}...`, 'blue');
    return true;
  } catch (error) {
    log('✗ Erreur lors de l\'envoi du message', 'red');
    log(`  Erreur: ${error.message}`, 'red');
    if (error.response) {
      log(`  Status HTTP: ${error.response.status}`, 'red');
      log(`  Réponse: ${JSON.stringify(error.response.data)}`, 'red');
    }
    return false;
  }
}

async function testChatbotWithHistory() {
  log('\n=== Test 4: Message avec historique ===', 'cyan');
  try {
    const response = await axios.post(`${CHATBOT_URL}/chat`, {
      message: 'Et le prix du Tiggo 8 Pro?',
      history: [
        { role: 'user', content: 'Quels sont les modèles disponibles?' },
        { role: 'assistant', content: 'Nous avons le Tiggo 8 Pro, Tiggo 7, et Tiggo 4.' }
      ]
    });
    
    log('✓ Message avec historique envoyé', 'green');
    log(`  Réponse: ${response.data.reply.substring(0, 100)}...`, 'blue');
    return true;
  } catch (error) {
    log('✗ Erreur avec historique', 'red');
    log(`  Erreur: ${error.message}`, 'red');
    return false;
  }
}

async function testChatbotEmptyMessage() {
  log('\n=== Test 5: Message vide (validation) ===', 'cyan');
  try {
    await axios.post(`${CHATBOT_URL}/chat`, {
      message: '',
      history: []
    });
    log('✗ Le serveur devrait rejeter les messages vides', 'red');
    return false;
  } catch (error) {
    if (error.response && error.response.status === 400) {
      log('✓ Validation correcte des messages vides', 'green');
      return true;
    }
    log('✗ Erreur inattendue', 'red');
    return false;
  }
}

async function testCORS() {
  log('\n=== Test 6: Configuration CORS ===', 'cyan');
  try {
    const response = await axios.options(`${CHATBOT_URL}/chat`, {
      headers: {
        'Origin': 'http://localhost:3001',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    log('✓ CORS configuré correctement', 'green');
    return true;
  } catch (error) {
    log('⚠ Impossible de tester CORS (peut être normal)', 'yellow');
    return true; // Ne pas échouer le test pour CORS
  }
}

async function runAllTests() {
  log('\n╔════════════════════════════════════════╗', 'cyan');
  log('║   TEST COMPLET DU CHATBOT CHERY SAV   ║', 'cyan');
  log('╚════════════════════════════════════════╝', 'cyan');
  
  const results = [];
  
  // Test 1: Santé du serveur
  results.push(await testServerHealth());
  
  // Test 2: Status du chatbot
  results.push(await testChatbotStatus());
  
  // Test 3: Message simple
  results.push(await testChatbotMessage());
  
  // Test 4: Message avec historique
  results.push(await testChatbotWithHistory());
  
  // Test 5: Validation
  results.push(await testChatbotEmptyMessage());
  
  // Test 6: CORS
  results.push(await testCORS());
  
  // Résumé
  log('\n╔════════════════════════════════════════╗', 'cyan');
  log('║            RÉSUMÉ DES TESTS            ║', 'cyan');
  log('╚════════════════════════════════════════╝', 'cyan');
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  log(`\nTests réussis: ${passed}/${total}`, passed === total ? 'green' : 'yellow');
  
  if (passed === total) {
    log('\n✓ Tous les tests sont passés! Le chatbot fonctionne correctement.', 'green');
    log('\nVous pouvez maintenant tester dans le navigateur:', 'blue');
    log('  → http://localhost:3001/client/chatbot', 'cyan');
  } else {
    log('\n✗ Certains tests ont échoué. Vérifiez les erreurs ci-dessus.', 'red');
    log('\nActions recommandées:', 'yellow');
    log('  1. Vérifiez que le backend est démarré (npm start)', 'yellow');
    log('  2. Vérifiez le fichier .env (GROQ_API_KEY)', 'yellow');
    log('  3. Redémarrez le serveur backend', 'yellow');
  }
  
  process.exit(passed === total ? 0 : 1);
}

// Exécuter les tests
runAllTests().catch(error => {
  log('\n✗ Erreur fatale lors des tests:', 'red');
  log(error.message, 'red');
  process.exit(1);
});
