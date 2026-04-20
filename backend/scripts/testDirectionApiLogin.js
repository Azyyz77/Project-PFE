const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function testDirectionLogin() {
  try {
    console.log('========================================');
    console.log('Test de connexion API DIRECTION');
    console.log('========================================\n');

    const response = await fetch('http://localhost:3000/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'direction@stachery.tn',
        password: 'Direction2024!'
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ SUCCÈS: Connexion réussie!\n');
      console.log('Utilisateur:');
      console.log('  ID:       ', data.user.id);
      console.log('  Email:    ', data.user.email);
      console.log('  Nom:      ', data.user.prenom, data.user.nom);
      console.log('  Rôle:     ', data.user.role);
      console.log('');
      console.log('Token JWT:', data.token.substring(0, 50) + '...');
      console.log('');
      
      // Tester l'accès aux stats
      console.log('Test d\'accès aux statistiques...');
      const statsResponse = await fetch('http://localhost:3000/api/direction/stats/agencies', {
        headers: {
          'Authorization': `Bearer ${data.token}`
        }
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        console.log('✅ Accès aux statistiques réussi!');
        console.log('  Nombre d\'agences:', statsData.data?.length || 0);
      } else {
        const error = await statsResponse.json();
        console.log('❌ Erreur d\'accès aux statistiques:', error.error || error.message);
      }
    } else {
      console.log('❌ ÉCHEC: Connexion échouée!\n');
      console.log('Erreur:', data.error || data.message);
      console.log('Status:', response.status);
    }

    console.log('\n========================================');
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testDirectionLogin();
