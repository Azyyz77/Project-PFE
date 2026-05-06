const axios = require('axios');

// Configuration
const API_URL = 'http://localhost:3000/api';
const COMMANDE_ID = 5; // ID de la commande à tester

// Token d'authentification (remplacer par votre token)
// Pour obtenir le token: se connecter sur le frontend et copier le token depuis localStorage
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjgiLCJlbWFpbCI6ImFnZW50c2F2QGdtYWlsLmNvbSIsInJvbGUiOiJBR0VOVCIsImFnZW5jZV9pZCI6IjIiLCJ0ZWxlcGhvbmVfdmVyaWZpZSI6ZmFsc2UsImlhdCI6MTc3ODA4MTEyMSwiZXhwIjoxNzc4MTY3NTIxfQ.zSUkuwj5HI4F5AENI7tP70G8BZ4H2WB4PyNZ-OKxCWM';

async function testUpdateStatus() {
  console.log('🧪 Test de mise à jour du statut de la commande\n');
  
  try {
    // 1. Récupérer la commande actuelle
    console.log(`📋 Étape 1: Récupération de la commande ${COMMANDE_ID}...`);
    const getResponse = await axios.get(`${API_URL}/repair-orders/${COMMANDE_ID}`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      }
    });
    
    console.log('✅ Commande récupérée:');
    console.log(`   - Numéro: ${getResponse.data.commande.numero}`);
    console.log(`   - Statut actuel: ${getResponse.data.commande.statut}`);
    console.log(`   - Montant total: ${getResponse.data.commande.montant_total} TND`);
    console.log(`   - Nombre de lignes: ${getResponse.data.commande.lignes.length}`);
    
    if (getResponse.data.commande.lignes.length > 0) {
      console.log('\n   Lignes:');
      getResponse.data.commande.lignes.forEach((ligne, index) => {
        console.log(`   ${index + 1}. ${ligne.description || ligne.type}: ${ligne.quantite} × ${ligne.prix_unitaire} = ${ligne.prix_total} TND`);
      });
    }
    
    console.log('\n');
    
    // 2. Mettre à jour le statut
    console.log('📋 Étape 2: Mise à jour du statut vers EN_COURS...');
    const updateResponse = await axios.put(
      `${API_URL}/repair-orders/${COMMANDE_ID}/status`,
      { statut: 'EN_COURS' },
      {
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Statut mis à jour avec succès!');
    console.log(`   - Nouveau statut: ${updateResponse.data.commande.statut}`);
    console.log(`   - Message: ${updateResponse.data.message}`);
    
    if (updateResponse.data.commande.lignes && updateResponse.data.commande.lignes.length > 0) {
      console.log('\n   Lignes dans la réponse:');
      updateResponse.data.commande.lignes.forEach((ligne, index) => {
        console.log(`   ${index + 1}. Description: ${ligne.description || 'MANQUANTE'}`);
        console.log(`      Type: ${ligne.type}`);
        console.log(`      Quantité: ${ligne.quantite}`);
        console.log(`      Prix: ${ligne.prix_total} TND`);
      });
    }
    
    console.log('\n✅ Test réussi!\n');
    
  } catch (error) {
    console.error('\n❌ Erreur lors du test:\n');
    
    if (error.response) {
      // Erreur de réponse du serveur
      console.error('Status:', error.response.status);
      console.error('Données:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      // Pas de réponse du serveur
      console.error('Pas de réponse du serveur');
      console.error('Vérifiez que le backend tourne sur', API_URL);
    } else {
      // Autre erreur
      console.error('Message:', error.message);
    }
    
    console.log('\n');
    process.exit(1);
  }
}

// Instructions
console.log('═══════════════════════════════════════════════════════════');
console.log('  Test de Mise à Jour du Statut de Commande');
console.log('═══════════════════════════════════════════════════════════\n');

if (TOKEN === 'VOTRE_TOKEN_ICI') {
  console.log('⚠️  ATTENTION: Vous devez d\'abord obtenir un token!\n');
  console.log('📝 Instructions:');
  console.log('   1. Ouvrir le frontend: http://localhost:3001');
  console.log('   2. Se connecter en tant qu\'agent');
  console.log('   3. Ouvrir DevTools (F12)');
  console.log('   4. Aller dans Console');
  console.log('   5. Taper: localStorage.getItem("token")');
  console.log('   6. Copier le token (sans les guillemets)');
  console.log('   7. Remplacer VOTRE_TOKEN_ICI dans ce fichier\n');
  console.log('   8. Relancer: node test-update-status.js\n');
  process.exit(0);
}

// Lancer le test
testUpdateStatus();
