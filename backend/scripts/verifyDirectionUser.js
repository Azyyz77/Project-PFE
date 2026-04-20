const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { getConnection } = require('../config/database');
const bcrypt = require('bcryptjs');

async function verifyDirectionUser() {
  try {
    console.log('========================================');
    console.log('Vérification utilisateur DIRECTION');
    console.log('========================================\n');

    const pool = await getConnection();
    
    // Récupérer l'utilisateur DIRECTION
    const result = await pool.request().query(`
      SELECT 
        u.id,
        u.email,
        u.prenom,
        u.nom,
        u.mot_de_passe,
        r.nom AS role_nom,
        u.actif
      FROM Utilisateur u
      LEFT JOIN Role r ON u.role_id = r.id
      WHERE u.email = 'direction@stachery.tn'
    `);

    if (result.recordset.length === 0) {
      console.log('❌ ERREUR: Utilisateur direction@stachery.tn non trouvé!\n');
      console.log('Exécutez le script SQL: backend/migrations/create_direction_test_user.sql\n');
      return;
    }

    const user = result.recordset[0];
    
    console.log('✅ Utilisateur trouvé:');
    console.log('  ID:       ', user.id);
    console.log('  Email:    ', user.email);
    console.log('  Nom:      ', user.prenom, user.nom);
    console.log('  Rôle:     ', user.role_nom);
    console.log('  Actif:    ', user.actif ? 'Oui' : 'Non');
    console.log('  Hash:     ', user.mot_de_passe);
    console.log('');

    // Tester le mot de passe
    const testPassword = 'Direction2024!';
    const isMatch = await bcrypt.compare(testPassword, user.mot_de_passe);

    if (isMatch) {
      console.log('✅ SUCCÈS: Le mot de passe "Direction2024!" fonctionne!\n');
      console.log('Vous pouvez vous connecter avec:');
      console.log('  Email:        direction@stachery.tn');
      console.log('  Mot de passe: Direction2024!');
    } else {
      console.log('❌ ÉCHEC: Le mot de passe ne correspond pas!\n');
      console.log('Exécutez: backend/migrations/update_direction_password.sql');
    }

    console.log('\n========================================');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

verifyDirectionUser();
