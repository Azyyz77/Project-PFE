/**
 * Script de test pour les API du système d'information
 * Teste tous les endpoints publics
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/information';

async function testInformationAPI() {
  console.log('='.repeat(80));
  console.log('TEST DES API DU SYSTÈME D\'INFORMATION');
  console.log('='.repeat(80));
  console.log('');
  console.log('⚠️  Assurez-vous que le serveur backend est démarré (localhost:3000)');
  console.log('');

  let passedTests = 0;
  let failedTests = 0;

  // Test 1: Get Active Sections
  console.log('1️⃣  TEST: GET /public/sections');
  console.log('-'.repeat(80));
  try {
    const response = await axios.get(`${BASE_URL}/public/sections`);
    if (response.data.success && Array.isArray(response.data.data)) {
      console.log(`✅ SUCCÈS - ${response.data.data.length} sections récupérées`);
      response.data.data.forEach(section => {
        console.log(`   - ${section.titre} (${section.slug})`);
      });
      passedTests++;
    } else {
      console.log('❌ ÉCHEC - Format de réponse incorrect');
      failedTests++;
    }
  } catch (error) {
    console.log('❌ ÉCHEC -', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('   💡 Le serveur backend n\'est pas démarré');
      console.log('   💡 Démarrez-le avec: cd backend && node server.js');
    }
    failedTests++;
  }
  console.log('');

  // Test 2: Get Section by Slug
  console.log('2️⃣  TEST: GET /public/sections/garantie');
  console.log('-'.repeat(80));
  try {
    const response = await axios.get(`${BASE_URL}/public/sections/garantie`);
    if (response.data.success && response.data.data) {
      console.log('✅ SUCCÈS - Section récupérée');
      console.log(`   Titre: ${response.data.data.titre}`);
      console.log(`   Slug: ${response.data.data.slug}`);
      console.log(`   Icône: ${response.data.data.icone}`);
      passedTests++;
    } else {
      console.log('❌ ÉCHEC - Format de réponse incorrect');
      failedTests++;
    }
  } catch (error) {
    console.log('❌ ÉCHEC -', error.response?.data?.error || error.message);
    failedTests++;
  }
  console.log('');

  // Test 3: Get Contents by Section
  console.log('3️⃣  TEST: GET /public/sections/1/contents');
  console.log('-'.repeat(80));
  try {
    const response = await axios.get(`${BASE_URL}/public/sections/1/contents`);
    if (response.data.success && Array.isArray(response.data.data)) {
      console.log(`✅ SUCCÈS - ${response.data.data.length} contenus récupérés`);
      response.data.data.forEach(content => {
        console.log(`   - ${content.titre}`);
      });
      passedTests++;
    } else {
      console.log('❌ ÉCHEC - Format de réponse incorrect');
      failedTests++;
    }
  } catch (error) {
    console.log('❌ ÉCHEC -', error.response?.data?.error || error.message);
    failedTests++;
  }
  console.log('');

  // Test 4: Get All Documents
  console.log('4️⃣  TEST: GET /public/documents');
  console.log('-'.repeat(80));
  try {
    const response = await axios.get(`${BASE_URL}/public/documents`);
    if (response.data.success && Array.isArray(response.data.data)) {
      console.log(`✅ SUCCÈS - ${response.data.data.length} documents récupérés`);
      response.data.data.forEach(doc => {
        console.log(`   - ${doc.titre} (${doc.nom_fichier})`);
      });
      passedTests++;
    } else {
      console.log('❌ ÉCHEC - Format de réponse incorrect');
      failedTests++;
    }
  } catch (error) {
    console.log('❌ ÉCHEC -', error.response?.data?.error || error.message);
    failedTests++;
  }
  console.log('');

  // Test 5: Get Documents by Section
  console.log('5️⃣  TEST: GET /public/sections/1/documents');
  console.log('-'.repeat(80));
  try {
    const response = await axios.get(`${BASE_URL}/public/sections/1/documents`);
    if (response.data.success && Array.isArray(response.data.data)) {
      console.log(`✅ SUCCÈS - ${response.data.data.length} documents récupérés`);
      response.data.data.forEach(doc => {
        console.log(`   - ${doc.titre}`);
      });
      passedTests++;
    } else {
      console.log('❌ ÉCHEC - Format de réponse incorrect');
      failedTests++;
    }
  } catch (error) {
    console.log('❌ ÉCHEC -', error.response?.data?.error || error.message);
    failedTests++;
  }
  console.log('');

  // Test 6: Increment Download Count
  console.log('6️⃣  TEST: POST /public/documents/1/download');
  console.log('-'.repeat(80));
  try {
    const response = await axios.post(`${BASE_URL}/public/documents/1/download`);
    if (response.data.success) {
      console.log('✅ SUCCÈS - Compteur de téléchargement incrémenté');
      passedTests++;
    } else {
      console.log('❌ ÉCHEC - Format de réponse incorrect');
      failedTests++;
    }
  } catch (error) {
    console.log('❌ ÉCHEC -', error.response?.data?.error || error.message);
    failedTests++;
  }
  console.log('');

  // Résumé
  console.log('='.repeat(80));
  console.log('📋 RÉSUMÉ DES TESTS');
  console.log('='.repeat(80));
  console.log(`✅ Tests réussis: ${passedTests}/6`);
  console.log(`❌ Tests échoués: ${failedTests}/6`);
  console.log('');

  if (failedTests === 0) {
    console.log('🎉 TOUS LES TESTS SONT PASSÉS!');
    console.log('✅ Le système d\'information est opérationnel');
  } else if (passedTests > 0) {
    console.log('⚠️  CERTAINS TESTS ONT ÉCHOUÉ');
    console.log('💡 Vérifiez les erreurs ci-dessus');
  } else {
    console.log('❌ TOUS LES TESTS ONT ÉCHOUÉ');
    console.log('💡 Vérifiez que le serveur backend est démarré');
  }
  console.log('='.repeat(80));
}

// Exécuter les tests
testInformationAPI()
  .then(() => {
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Erreur lors des tests:', error);
    process.exit(1);
  });
