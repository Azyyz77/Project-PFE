/**
 * Script de test pour les statistiques de facturation de direction
 */

const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

// Token de test (remplacer par un vrai token DIRECTION)
const TOKEN = 'YOUR_DIRECTION_TOKEN_HERE';

async function testBillingStats() {
  try {
    console.log('=== TEST STATISTIQUES DE FACTURATION ===\n');

    // Test 1: Statistiques globales
    console.log('1. Test statistiques globales de facturation...');
    const response = await axios.get(`${API_URL}/direction/stats/billing`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      }
    });

    console.log('✅ Réponse reçue:');
    console.log('Global:', response.data.data.global);
    console.log('Nombre d\'agences:', response.data.data.par_agence.length);
    console.log('Évolution mensuelle:', response.data.data.evolution_mensuelle.length, 'mois');
    console.log('Modes de paiement:', response.data.data.modes_paiement.length);

    // Test 2: Avec filtres de date
    console.log('\n2. Test avec filtres de date...');
    const dateDebut = '2024-01-01';
    const dateFin = '2024-12-31';
    
    const response2 = await axios.get(`${API_URL}/direction/stats/billing`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      },
      params: {
        dateDebut,
        dateFin
      }
    });

    console.log('✅ Réponse avec filtres reçue');
    console.log('Total factures:', response2.data.data.global.total_factures);
    console.log('Montant total:', response2.data.data.global.montant_total, 'TND');

    console.log('\n=== TOUS LES TESTS RÉUSSIS ===');

  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
  }
}

// Vérifier que le serveur est démarré
console.log('⚠️  IMPORTANT: Assurez-vous que le backend est démarré sur le port 3000');
console.log('⚠️  Remplacez YOUR_DIRECTION_TOKEN_HERE par un vrai token DIRECTION\n');

testBillingStats();
