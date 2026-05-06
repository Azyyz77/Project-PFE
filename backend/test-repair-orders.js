/**
 * Script de test pour le système de commandes de réparation
 * 
 * Usage: node backend/test-repair-orders.js
 */

const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

// Remplacez par un vrai token d'agent
const AGENT_TOKEN = 'YOUR_AGENT_TOKEN_HERE';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Authorization': `Bearer ${AGENT_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

async function testRepairOrderSystem() {
  console.log('🧪 Test du système de commandes de réparation\n');

  try {
    // Test 1: Créer une commande depuis un RDV
    console.log('1️⃣ Test: Créer une commande depuis un RDV...');
    const rdvId = 1; // Remplacez par un vrai ID de RDV
    
    try {
      const createResponse = await api.post(`/repair-orders/from-appointment/${rdvId}`);
      const commande = createResponse.data.commande;
      console.log('✅ Commande créée:', commande.numero);
      console.log(`   Statut: ${commande.statut}`);
      console.log(`   Lignes: ${commande.lignes.length}`);
      console.log(`   Montant: ${commande.montant_ttc} TND\n`);

      const commandeId = commande.id;

      // Test 2: Ajouter une ligne (intervention)
      console.log('2️⃣ Test: Ajouter une ligne (intervention)...');
      await api.post(`/repair-orders/${commandeId}/lines`, {
        type: 'INTERVENTION',
        description: 'Remplacement plaquettes de frein',
        quantite: 1,
        prix_unitaire: 120
      });
      console.log('✅ Ligne intervention ajoutée\n');

      // Test 3: Ajouter une ligne (pièce)
      console.log('3️⃣ Test: Ajouter une ligne (pièce)...');
      await api.post(`/repair-orders/${commandeId}/lines`, {
        type: 'PIECE',
        description: 'Plaquettes frein avant',
        quantite: 1,
        prix_unitaire: 80
      });
      console.log('✅ Ligne pièce ajoutée\n');

      // Test 4: Récupérer la commande mise à jour
      console.log('4️⃣ Test: Récupérer la commande mise à jour...');
      const getResponse = await api.get(`/repair-orders/${commandeId}`);
      const updatedCommande = getResponse.data.commande;
      console.log('✅ Commande récupérée:');
      console.log(`   Lignes: ${updatedCommande.lignes.length}`);
      console.log(`   Montant HT: ${updatedCommande.montant_ht} TND`);
      console.log(`   Montant TVA: ${updatedCommande.montant_tva} TND`);
      console.log(`   Montant TTC: ${updatedCommande.montant_ttc} TND\n`);

      // Test 5: Changer le statut
      console.log('5️⃣ Test: Changer le statut (EN_COURS)...');
      await api.patch(`/repair-orders/${commandeId}/status`, {
        statut: 'EN_COURS'
      });
      console.log('✅ Statut changé à EN_COURS\n');

      // Test 6: Changer le statut (TERMINEE)
      console.log('6️⃣ Test: Changer le statut (TERMINEE)...');
      await api.patch(`/repair-orders/${commandeId}/status`, {
        statut: 'TERMINEE'
      });
      console.log('✅ Statut changé à TERMINEE\n');

      // Test 7: Créer une facture
      console.log('7️⃣ Test: Créer une facture...');
      const invoiceResponse = await api.post(`/repair-orders/${commandeId}/invoice`);
      const facture = invoiceResponse.data.facture;
      console.log('✅ Facture créée:', facture.numero);
      console.log(`   Montant: ${facture.montant_ttc} TND`);
      console.log(`   Statut: ${facture.statut}\n`);

      // Test 8: Récupérer la facture
      console.log('8️⃣ Test: Récupérer la facture...');
      const getInvoiceResponse = await api.get(`/repair-orders/${commandeId}/invoice`);
      console.log('✅ Facture récupérée:', getInvoiceResponse.data.facture.numero, '\n');

      // Test 9: Lister les commandes
      console.log('9️⃣ Test: Lister les commandes...');
      const listResponse = await api.get('/repair-orders');
      console.log(`✅ ${listResponse.data.count} commandes trouvées\n`);

      console.log('🎉 Tous les tests sont passés avec succès !');

    } catch (error) {
      if (error.response?.status === 409) {
        console.log('⚠️  Une commande existe déjà pour ce RDV');
        console.log('   Utilisez un autre RDV ou supprimez la commande existante\n');
      } else {
        throw error;
      }
    }

  } catch (error) {
    console.error('❌ Erreur lors des tests:');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Message: ${error.response.data.error || error.response.data.message}`);
    } else {
      console.error(`   ${error.message}`);
    }
    process.exit(1);
  }
}

// Vérifier que le token est configuré
if (AGENT_TOKEN === 'YOUR_AGENT_TOKEN_HERE') {
  console.log('❌ Erreur: Veuillez configurer un token d\'agent valide');
  console.log('\n📝 Instructions:');
  console.log('1. Connectez-vous comme AGENT dans l\'application');
  console.log('2. Ouvrez la console du navigateur (F12)');
  console.log('3. Tapez: localStorage.getItem("token")');
  console.log('4. Copiez le token et remplacez AGENT_TOKEN dans ce fichier\n');
  process.exit(1);
}

// Exécuter les tests
testRepairOrderSystem();
