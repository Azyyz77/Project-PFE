/**
 * Test de connexion agent avec vérification de agence_id
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testAgentLogin() {
  console.log('\n=== Test de Connexion Agent ===\n');

  try {
    // Test avec l'agent SAV
    const loginData = {
      email: 'agentsav@gmail.com',
      password: 'password123' // Remplacer par le vrai mot de passe
    };

    console.log('📧 Email:', loginData.email);
    console.log('🔐 Tentative de connexion...\n');

    const response = await axios.post(`${BASE_URL}/api/users/login`, loginData);

    console.log('✅ Connexion réussie!\n');
    console.log('👤 Informations utilisateur:');
    console.log('   ID:', response.data.user.id);
    console.log('   Nom:', response.data.user.prenom, response.data.user.nom);
    console.log('   Email:', response.data.user.email);
    console.log('   Rôle:', response.data.user.role);
    console.log('   Agence ID:', response.data.user.agence_id);
    console.log('   Téléphone vérifié:', response.data.user.telephone_verifie);

    if (response.data.user.agence_id) {
      console.log('\n✅ agence_id est présent!');
      console.log('   La page workers devrait fonctionner correctement.');
    } else {
      console.log('\n❌ agence_id est NULL!');
      console.log('   Exécutez cette commande SQL pour corriger:');
      console.log('   UPDATE Utilisateur SET agence_id = 1 WHERE role_id = 2');
    }

    console.log('\n🔑 Token JWT généré (premiers 50 caractères):');
    console.log('   ', response.data.token.substring(0, 50) + '...');

  } catch (error) {
    console.error('\n❌ Erreur lors de la connexion:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Message:', error.response.data.error || error.response.data.message);
    } else {
      console.error('   ', error.message);
    }
    console.log('\n💡 Vérifiez que:');
    console.log('   1. Le backend est démarré (npm start)');
    console.log('   2. Le mot de passe est correct');
    console.log('   3. L\'utilisateur existe dans la base de données');
  }
}

// Exécuter le test
testAgentLogin();
