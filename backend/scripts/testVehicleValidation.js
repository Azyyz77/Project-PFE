/**
 * Script de test pour les endpoints de validation des véhicules
 */

const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

// Fonction pour se connecter et obtenir un token
async function login(email, password) {
  try {
    const response = await axios.post(`${API_URL}/users/login`, {
      email,
      password
    });
    return response.data.token;
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.response?.data || error.message);
    throw error;
  }
}

// Fonction pour tester les endpoints
async function testEndpoints(token) {
  const headers = {
    'Authorization': `Bearer ${token}`
  };

  console.log('\n📊 Test: Obtenir les statistiques');
  try {
    const response = await axios.get(`${API_URL}/agent/vehicles/stats`, { headers });
    console.log('✅ Statistiques:', response.data);
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
  }

  console.log('\n📋 Test: Obtenir les véhicules en attente');
  try {
    const response = await axios.get(`${API_URL}/agent/vehicles/pending`, { headers });
    console.log('✅ Véhicules en attente:', response.data.count, 'véhicules');
    if (response.data.vehicles.length > 0) {
      console.log('Premier véhicule:', response.data.vehicles[0]);
    }
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
  }

  console.log('\n📋 Test: Obtenir tous les véhicules');
  try {
    const response = await axios.get(`${API_URL}/agent/vehicles`, { headers });
    console.log('✅ Tous les véhicules:', response.data.count, 'véhicules');
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
  }

  console.log('\n📋 Test: Obtenir les véhicules validés');
  try {
    const response = await axios.get(`${API_URL}/agent/vehicles?statut=VALIDE`, { headers });
    console.log('✅ Véhicules validés:', response.data.count, 'véhicules');
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
  }
}

// Fonction principale
async function main() {
  console.log('🚀 Test des endpoints de validation des véhicules\n');

  // Essayer avec un compte AGENT
  console.log('='.repeat(60));
  console.log('Test avec un compte AGENT');
  console.log('='.repeat(60));

  try {
    // Vous devez remplacer ces identifiants par un compte AGENT valide
    const agentEmail = 'agent@sta-chery.tn';
    const agentPassword = 'agent123'; // Remplacez par le vrai mot de passe

    console.log(`\n🔐 Connexion en tant qu'agent (${agentEmail})...`);
    const token = await login(agentEmail, agentPassword);
    console.log('✅ Connexion réussie!');
    console.log('Token:', token.substring(0, 50) + '...');

    await testEndpoints(token);
  } catch (error) {
    console.error('\n❌ Échec du test avec le compte AGENT');
  }

  // Essayer avec un compte ADMIN (devrait aussi fonctionner)
  console.log('\n' + '='.repeat(60));
  console.log('Test avec un compte ADMIN');
  console.log('='.repeat(60));

  try {
    const adminEmail = 'admin@sta-chery.tn';
    const adminPassword = 'admin123'; // Remplacez par le vrai mot de passe

    console.log(`\n🔐 Connexion en tant qu'admin (${adminEmail})...`);
    const token = await login(adminEmail, adminPassword);
    console.log('✅ Connexion réussie!');

    await testEndpoints(token);
  } catch (error) {
    console.error('\n❌ Échec du test avec le compte ADMIN');
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Tests terminés');
  console.log('='.repeat(60));
}

// Exécuter
main().catch(console.error);
