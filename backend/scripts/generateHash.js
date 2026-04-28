/**
 * Générer un hash bcrypt pour un mot de passe
 */

const bcrypt = require('bcryptjs');

const password = process.argv[2] || 'agent123';

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Erreur:', err);
    process.exit(1);
  }
  
  console.log('\n========================================');
  console.log('Hash généré pour le mot de passe');
  console.log('========================================');
  console.log('Mot de passe:', password);
  console.log('Hash:', hash);
  console.log('========================================\n');
  console.log('Commande SQL pour agentsav@gmail.com:\n');
  console.log(`UPDATE Utilisateur SET mot_de_passe = '${hash}' WHERE email = 'agentsav@gmail.com';`);
  console.log('\n');
});
