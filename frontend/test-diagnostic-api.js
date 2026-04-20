// Simple test script to verify the diagnostic API works
const axios = require('axios');

async function testDiagnosticAPI() {
  try {
    console.log('🧪 Test de l\'API diagnostics...\n');
    
    // Test sans authentification (devrait échouer)
    console.log('1. Test sans authentification...');
    try {
      await axios.get('http://localhost:3000/api/agent/diagnostics');
      console.log('   ❌ Erreur: L\'API devrait refuser l\'accès sans token');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('   ✅ Authentification requise (normal)');
      } else {
        console.log('   ⚠️  Erreur inattendue:', error.message);
      }
    }
    
    // Test de la structure de l'endpoint
    console.log('\n2. Vérification de l\'endpoint...');
    try {
      await axios.get('http://localhost:3000/api/agent/diagnostics', {
        headers: {
          'Authorization': 'Bearer invalid-token'
        }
      });
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('   ✅ Endpoint accessible (authentification échoue comme attendu)');
      } else if (error.code === 'ECONNREFUSED') {
        console.log('   ❌ Serveur backend non démarré');
        console.log('   💡 Démarrez le serveur avec: cd backend && npm run dev');
        return;
      } else {
        console.log('   ⚠️  Erreur:', error.message);
      }
    }
    
    console.log('\n✅ Test terminé!');
    console.log('📋 Prochaines étapes:');
    console.log('   1. Démarrez le serveur backend: cd backend && npm run dev');
    console.log('   2. Démarrez le frontend: cd frontend && npm run dev');
    console.log('   3. Connectez-vous avec un compte agent');
    console.log('   4. Accédez à /dashboard/agent/diagnostics');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

testDiagnosticAPI();