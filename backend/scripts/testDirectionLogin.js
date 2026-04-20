const bcrypt = require('bcryptjs');

// Hash stocké dans la base de données
const storedHash = '$2a$10$tPs3FdkA.zZReByUrxGTNO0oY.fXmvuMeUxtCPo8sqNa8y2FVfirG';

// Mot de passe à tester
const password = 'Direction2024!';

console.log('========================================');
console.log('Test de connexion DIRECTION');
console.log('========================================');
console.log('');
console.log('Email:        direction@stachery.tn');
console.log('Mot de passe:', password);
console.log('Hash stocké: ', storedHash);
console.log('');

bcrypt.compare(password, storedHash, (err, result) => {
  if (err) {
    console.error('❌ Erreur:', err);
    return;
  }
  
  if (result) {
    console.log('✅ SUCCÈS: Le mot de passe correspond!');
    console.log('');
    console.log('Vous pouvez maintenant vous connecter avec:');
    console.log('  Email:        direction@stachery.tn');
    console.log('  Mot de passe: Direction2024!');
  } else {
    console.log('❌ ÉCHEC: Le mot de passe ne correspond pas!');
  }
  
  console.log('');
  console.log('========================================');
});
