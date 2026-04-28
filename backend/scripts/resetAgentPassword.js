/**
 * Script pour réinitialiser le mot de passe de l'agent SAV
 */

const bcrypt = require('bcryptjs');
const { getConnection, sql } = require('../config/database');

const NEW_PASSWORD = 'agent123';
const AGENT_EMAIL = 'agentsav@gmail.com';

async function resetPassword() {
  try {
    console.log('\n=== Réinitialisation du mot de passe agent ===\n');
    console.log('Email:', AGENT_EMAIL);
    console.log('Nouveau mot de passe:', NEW_PASSWORD);
    
    // Générer le hash
    const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 10);
    console.log('\nHash généré:', hashedPassword.substring(0, 30) + '...');
    
    // Mettre à jour dans la base de données
    const pool = await getConnection();
    const result = await pool.request()
      .input('email', sql.NVarChar, AGENT_EMAIL)
      .input('password', sql.NVarChar, hashedPassword)
      .query(`
        UPDATE Utilisateur 
        SET mot_de_passe = @password 
        WHERE email = @email
      `);
    
    if (result.rowsAffected[0] > 0) {
      console.log('\n✅ Mot de passe mis à jour avec succès!');
      console.log('\nVous pouvez maintenant vous connecter avec:');
      console.log('  Email:', AGENT_EMAIL);
      console.log('  Mot de passe:', NEW_PASSWORD);
    } else {
      console.log('\n❌ Aucun utilisateur trouvé avec cet email');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    process.exit(1);
  }
}

resetPassword();
