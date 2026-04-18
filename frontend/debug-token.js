// Script pour déboguer le contenu du token JWT
// Exécuter avec: node debug-token.js

function decodeJWT(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const decoded = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    return decoded;
  } catch (error) {
    return null;
  }
}

// Récupérer le token depuis les cookies du navigateur ou le localStorage
// et le coller ici pour le déboguer
const token = "COLLER_LE_TOKEN_ICI";

if (token && token !== "COLLER_LE_TOKEN_ICI") {
  const decoded = decodeJWT(token);
  console.log('Contenu du token JWT:');
  console.log(JSON.stringify(decoded, null, 2));
  
  console.log('\nVérifications:');
  console.log('- ID utilisateur:', decoded.id);
  console.log('- Email:', decoded.email);
  console.log('- Rôle:', decoded.role);
  console.log('- Téléphone vérifié:', decoded.telephone_verifie);
  console.log('- Expiration:', new Date(decoded.exp * 1000));
} else {
  console.log('Veuillez coller un token JWT valide dans le script');
  console.log('Vous pouvez le récupérer depuis:');
  console.log('1. Les cookies du navigateur (token)');
  console.log('2. Le localStorage (token)');
  console.log('3. Les DevTools > Application > Storage');
}