const bcrypt = require('bcryptjs');

const password = 'Direction2024!';

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Erreur:', err);
    return;
  }
  
  console.log('========================================');
  console.log('Hash généré pour le mot de passe');
  console.log('========================================');
  console.log('Mot de passe:', password);
  console.log('Hash:', hash);
  console.log('========================================');
  console.log('');
  console.log('Utilisez ce hash dans la base de données:');
  console.log('');
  console.log(`UPDATE Utilisateur SET mot_de_passe = '${hash}' WHERE email = 'direction@stachery.tn'`);
  console.log('');
});
