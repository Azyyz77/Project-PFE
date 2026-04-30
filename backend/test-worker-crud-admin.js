/**
 * Test complet du cycle CRUD des ouvriers (ADMIN)
 * 
 * Ce script teste:
 * 1. Connexion ADMIN
 * 2. CREATE - Créer un ouvrier
 * 3. READ - Lire les ouvriers
 * 4. UPDATE - Modifier l'ouvrier
 * 5. DELETE - Désactiver l'ouvrier
 */

const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

// Credentials ADMIN (à créer si nécessaire)
const ADMIN_EMAIL = 'mohamedaligh.15@gmail.com';
const ADMIN_PASSWORD = 'daligh15';

let adminToken = '';
let createdWorkerId = null;

console.log('\n============================================================');
console.log('TEST CRUD COMPLET - OUVRIERS (ADMIN)');
console.log('============================================================\n');

/**
 * Test 1: Connexion ADMIN
 */
async function testAdminLogin() {
  console.log('═══ Test 1: Connexion ADMIN ═══\n');
  
  try {
    const response = await axios.post(`${API_URL}/users/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });

    adminToken = response.data.token;
    const user = response.data.user;

    console.log('✓ Connexion réussie');
    console.log(`ℹ Admin: ${user.prenom} ${user.nom}`);
    console.log(`ℹ Email: ${user.email}`);
    console.log(`ℹ Rôle: ${user.role}`);
    console.log('');

    if (user.role !== 'ADMIN') {
      console.log('⚠ ATTENTION: L\'utilisateur n\'est pas ADMIN!');
      console.log('⚠ Les tests suivants échoueront.');
      return false;
    }

    return true;
  } catch (error) {
    console.log('✗ Échec de connexion');
    if (error.response) {
      console.log(`✗ Status: ${error.response.status}`);
      console.log(`✗ Message: ${error.response.data.error || error.response.data.message}`);
    } else {
      console.log(`✗ Erreur: ${error.message}`);
    }
    console.log('\n⚠ Créez un compte ADMIN avec:');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log(`   Role: ADMIN`);
    console.log('');
    return false;
  }
}

/**
 * Test 2: CREATE - Créer un ouvrier
 */
async function testCreateWorker() {
  console.log('═══ Test 2: CREATE - Créer un ouvrier ═══\n');

  try {
    const workerData = {
      nom: 'Test',
      prenom: 'Worker',
      telephone: '+21612345678',
      email: 'test.worker@example.com',
      specialite: 'Mécanique',
      niveau_competence: 'Intermédiaire',
      agence_id: 1,
      notes: 'Ouvrier de test créé automatiquement'
    };

    const response = await axios.post(`${API_URL}/workers`, workerData, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    createdWorkerId = response.data.worker.id;

    console.log('✓ Ouvrier créé avec succès');
    console.log(`ℹ ID: ${createdWorkerId}`);
    console.log(`ℹ Nom: ${response.data.worker.nom} ${response.data.worker.prenom}`);
    console.log(`ℹ Spécialité: ${response.data.worker.specialite}`);
    console.log(`ℹ Agence ID: ${response.data.worker.agence_id}`);
    console.log('');
    return true;
  } catch (error) {
    console.log('✗ Échec de création');
    if (error.response) {
      console.log(`✗ Status: ${error.response.status}`);
      console.log(`✗ Data:`, error.response.data);
    } else {
      console.log(`✗ Erreur: ${error.message}`);
    }
    console.log('');
    return false;
  }
}

/**
 * Test 3: READ - Lire les ouvriers
 */
async function testReadWorkers() {
  console.log('═══ Test 3: READ - Lire les ouvriers ═══\n');

  try {
    const response = await axios.get(`${API_URL}/workers/agency/1`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    console.log('✓ Lecture réussie');
    console.log(`ℹ Nombre d'ouvriers: ${response.data.workers.length}`);
    
    const createdWorker = response.data.workers.find(w => w.id === createdWorkerId);
    if (createdWorker) {
      console.log(`✓ Ouvrier créé trouvé dans la liste`);
      console.log(`  - ${createdWorker.nom} ${createdWorker.prenom}`);
    } else {
      console.log(`⚠ Ouvrier créé non trouvé dans la liste`);
    }
    console.log('');
    return true;
  } catch (error) {
    console.log('✗ Échec de lecture');
    if (error.response) {
      console.log(`✗ Status: ${error.response.status}`);
      console.log(`✗ Data:`, error.response.data);
    } else {
      console.log(`✗ Erreur: ${error.message}`);
    }
    console.log('');
    return false;
  }
}

/**
 * Test 4: UPDATE - Modifier l'ouvrier
 */
async function testUpdateWorker() {
  console.log('═══ Test 4: UPDATE - Modifier l\'ouvrier ═══\n');

  if (!createdWorkerId) {
    console.log('⚠ Aucun ouvrier à modifier (création a échoué)');
    console.log('');
    return false;
  }

  try {
    const updateData = {
      specialite: 'Électricité',
      niveau_competence: 'Expert',
      notes: 'Ouvrier de test - MODIFIÉ'
    };

    const response = await axios.put(
      `${API_URL}/workers/${createdWorkerId}`,
      updateData,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );

    console.log('✓ Ouvrier modifié avec succès');
    console.log(`ℹ ID: ${response.data.worker.id}`);
    console.log(`ℹ Nouvelle spécialité: ${response.data.worker.specialite}`);
    console.log(`ℹ Nouveau niveau: ${response.data.worker.niveau_competence}`);
    console.log('');
    return true;
  } catch (error) {
    console.log('✗ Échec de modification');
    if (error.response) {
      console.log(`✗ Status: ${error.response.status}`);
      console.log(`✗ Data:`, error.response.data);
    } else {
      console.log(`✗ Erreur: ${error.message}`);
    }
    console.log('');
    return false;
  }
}

/**
 * Test 5: DELETE - Désactiver l'ouvrier
 */
async function testDeleteWorker() {
  console.log('═══ Test 5: DELETE - Désactiver l\'ouvrier ═══\n');

  if (!createdWorkerId) {
    console.log('⚠ Aucun ouvrier à supprimer (création a échoué)');
    console.log('');
    return false;
  }

  try {
    const response = await axios.delete(
      `${API_URL}/workers/${createdWorkerId}`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );

    console.log('✓ Ouvrier désactivé avec succès');
    console.log(`ℹ Message: ${response.data.message}`);
    console.log('');
    return true;
  } catch (error) {
    console.log('✗ Échec de suppression');
    if (error.response) {
      console.log(`✗ Status: ${error.response.status}`);
      console.log(`✗ Data:`, error.response.data);
    } else {
      console.log(`✗ Erreur: ${error.message}`);
    }
    console.log('');
    return false;
  }
}

/**
 * Test 6: Vérifier que l'ouvrier est désactivé
 */
async function testVerifyDeactivation() {
  console.log('═══ Test 6: Vérifier la désactivation ═══\n');

  if (!createdWorkerId) {
    console.log('⚠ Aucun ouvrier à vérifier');
    console.log('');
    return false;
  }

  try {
    // Lire tous les ouvriers (y compris inactifs)
    const response = await axios.get(`${API_URL}/workers/agency/1?actif=false`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    const deactivatedWorker = response.data.workers.find(w => w.id === createdWorkerId);
    
    if (deactivatedWorker) {
      console.log('✓ Ouvrier trouvé dans les inactifs');
      console.log(`ℹ Actif: ${deactivatedWorker.actif}`);
      
      if (!deactivatedWorker.actif) {
        console.log('✓ ✓ Ouvrier correctement désactivé');
      } else {
        console.log('⚠ Ouvrier toujours actif!');
      }
    } else {
      console.log('⚠ Ouvrier non trouvé');
    }
    console.log('');
    return true;
  } catch (error) {
    console.log('✗ Échec de vérification');
    if (error.response) {
      console.log(`✗ Status: ${error.response.status}`);
    } else {
      console.log(`✗ Erreur: ${error.message}`);
    }
    console.log('');
    return false;
  }
}

/**
 * Exécuter tous les tests
 */
async function runAllTests() {
  const results = {
    login: false,
    create: false,
    read: false,
    update: false,
    delete: false,
    verify: false
  };

  // Test 1: Login
  results.login = await testAdminLogin();
  if (!results.login) {
    console.log('❌ Tests arrêtés: connexion ADMIN échouée\n');
    console.log('============================================================\n');
    return;
  }

  // Test 2: Create
  results.create = await testCreateWorker();

  // Test 3: Read
  results.read = await testReadWorkers();

  // Test 4: Update
  results.update = await testUpdateWorker();

  // Test 5: Delete
  results.delete = await testDeleteWorker();

  // Test 6: Verify
  results.verify = await testVerifyDeactivation();

  // Résumé
  console.log('═══ RÉSUMÉ DES TESTS ═══\n');
  console.log(`${results.login ? '✓' : '✗'} Connexion ADMIN`);
  console.log(`${results.create ? '✓' : '✗'} CREATE - Créer ouvrier`);
  console.log(`${results.read ? '✓' : '✗'} READ - Lire ouvriers`);
  console.log(`${results.update ? '✓' : '✗'} UPDATE - Modifier ouvrier`);
  console.log(`${results.delete ? '✓' : '✗'} DELETE - Désactiver ouvrier`);
  console.log(`${results.verify ? '✓' : '✗'} VERIFY - Vérifier désactivation`);
  console.log('');

  const allPassed = Object.values(results).every(r => r === true);
  
  if (allPassed) {
    console.log('✅ ✅ ✅ TOUS LES TESTS RÉUSSIS ✅ ✅ ✅');
    console.log('Le cycle CRUD complet fonctionne correctement!');
  } else {
    console.log('⚠ Certains tests ont échoué');
    console.log('Vérifiez les erreurs ci-dessus');
  }

  console.log('\n============================================================\n');
}

// Exécuter les tests
runAllTests().catch(error => {
  console.error('Erreur fatale:', error.message);
  process.exit(1);
});
