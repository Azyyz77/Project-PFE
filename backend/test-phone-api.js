/**
 * Script de test simple pour l'API de vérification téléphonique
 * Teste les endpoints sans dépendre de la base de données
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3000/api/users';

async function testPhoneVerificationAPI() {
  console.log('🧪 Test de l\'API de vérification téléphonique\n');

  // Test 1: Inscription d'un nouveau client
  console.log('1. Test d\'inscription...');
  try {
    const registerResponse = await axios.post(`${API_BASE}/register`, {
      prenom: 'Test',
      nom: 'Client',
      email: 'test.phone@example.com',
      telephone: '+21612345678',
      password: 'password123',
      role: 'CLIENT'
    });

    console.log('✅ Inscription réussie');
    console.log('   Message:', registerResponse.data.message);
    console.log('   Vérification requise:', registerResponse.data.verification_required);
    console.log('   Utilisateur ID:', registerResponse.data.user.id);
  } catch (error) {
    console.log('❌ Erreur inscription:', error.response?.data?.error || error.message);
  }

  // Test 2: Connexion
  console.log('\n2. Test de connexion...');
  let token = null;
  try {
    const loginResponse = await axios.post(`${API_BASE}/login`, {
      email: 'test.phone@example.com',
      password: 'password123'
    });

    token = loginResponse.data.token;
    console.log('✅ Connexion réussie');
    console.log('   Token reçu:', !!token);
    console.log('   Téléphone vérifié:', loginResponse.data.user.telephone_verifie);
    
    // Décoder le token pour vérifier son contenu
    if (token) {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      console.log('   Token contient telephone_verifie:', payload.telephone_verifie);
    }
  } catch (error) {
    console.log('❌ Erreur connexion:', error.response?.data?.error || error.message);
  }

  // Test 3: Renvoi de code de vérification
  console.log('\n3. Test de renvoi de code...');
  try {
    const resendResponse = await axios.post(`${API_BASE}/resend-verification`, {
      email: 'test.phone@example.com'
    });

    console.log('✅ Code renvoyé');
    console.log('   Message:', resendResponse.data.message);
    console.log('   Indice téléphone:', resendResponse.data.telephone_hint);
  } catch (error) {
    console.log('❌ Erreur renvoi:', error.response?.data?.error || error.message);
  }

  // Test 4: Vérification avec code incorrect
  console.log('\n4. Test avec code incorrect...');
  try {
    const verifyResponse = await axios.post(`${API_BASE}/verify-phone`, {
      email: 'test.phone@example.com',
      otp: '000000'
    });

    console.log('⚠️  Vérification acceptée (inattendu):', verifyResponse.data.message);
  } catch (error) {
    console.log('✅ Code incorrect rejeté (attendu)');
    console.log('   Erreur:', error.response?.data?.error || error.message);
  }

  // Test 5: Vérification avec code correct (simulé)
  console.log('\n5. Test avec code correct (nécessite le vrai code OTP)...');
  console.log('   ℹ️  Pour tester, remplacez "123456" par le vrai code des logs backend');
  
  try {
    const verifyResponse = await axios.post(`${API_BASE}/verify-phone`, {
      email: 'test.phone@example.com',
      otp: '123456' // Remplacer par le vrai code
    });

    console.log('✅ Vérification réussie');
    console.log('   Message:', verifyResponse.data.message);
    console.log('   Vérifié:', verifyResponse.data.verified);
  } catch (error) {
    console.log('❌ Code incorrect ou expiré (attendu si pas le bon code)');
    console.log('   Erreur:', error.response?.data?.error || error.message);
  }

  console.log('\n🏁 Tests terminés');
  console.log('\nPour un test complet:');
  console.log('1. Démarrez le backend: npm start');
  console.log('2. Vérifiez les logs pour le code OTP généré');
  console.log('3. Remplacez "123456" par le vrai code dans ce script');
  console.log('4. Relancez ce script: node test-phone-api.js');
}

// Exécuter les tests
if (require.main === module) {
  testPhoneVerificationAPI()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = { testPhoneVerificationAPI };