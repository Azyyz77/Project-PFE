/**
 * Script pour tester l'endpoint API des problèmes prédéfinis
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Simuler une requête HTTP
const http = require('http');

function testEndpoint() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/problems',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  console.log('🔄 Test de l\'endpoint: http://localhost:3000/api/admin/problems\n');

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log(`📊 Status: ${res.statusCode}`);
      console.log(`📋 Headers:`, res.headers);
      console.log(`\n📄 Response:`);
      
      try {
        const json = JSON.parse(data);
        console.log(JSON.stringify(json, null, 2));
        
        if (json.problems) {
          console.log(`\n✅ ${json.problems.length} problèmes trouvés`);
        }
      } catch (err) {
        console.log(data);
      }
      
      process.exit(0);
    });
  });

  req.on('error', (error) => {
    console.error('❌ Erreur de connexion:', error.message);
    console.log('\n⚠️  Le serveur backend est-il démarré sur le port 3000?');
    console.log('   Démarrez-le avec: npm run dev');
    process.exit(1);
  });

  req.end();
}

testEndpoint();
