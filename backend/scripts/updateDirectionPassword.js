const bcrypt = require('bcryptjs');
const { getConnection, sql } = require('../config/database');

const updatePassword = async () => {
  try {
    const email = 'direction@stachery.tn';
    const password = 'Direction2024!';
    
    console.log('========================================');
    console.log('Mise à jour du mot de passe DIRECTION');
    console.log('========================================');
    console.log('');
    
    // Générer le hash
    console.log('Génération du hash bcrypt...');
    const hash = await bcrypt.hash(password, 10);
    console.log('✓ Hash généré:', hash);
    console.log('');
    
    // Connexion à la base de données
    console.log('Connexion à la base de données...');
    const pool = await getConnection();
    console.log('✓ Connecté');
    console.log('');
    
    // Mettre à jour le mot de passe
    console.log('Mise à jour du mot de passe...');
    const result = await pool.request()
      .input('email', sql.NVarChar(255), email)
      .input('mot_de_passe', sql.NVarChar(255), hash)
      .query(`
        UPDATE Utilisateur 
        SET mot_de_passe = @mot_de_passe
        WHERE email = @email
      `);
    
    console.log('✓ Mot de passe mis à jour');
    console.log('  Lignes affectées:', result.rowsAffected[0]);
    console.log('');
    
    // Vérifier la mise à jour
    const checkResult = await pool.request()
      .input('email', sql.NVarChar(255), email)
      .query(`
        SELECT id, email, role_id, actif, 
               LEFT(mot_de_passe, 10) + '...' AS mot_de_passe_preview
        FROM Utilisateur 
        WHERE email = @email
      `);
    
    if (checkResult.recordset.length > 0) {
      const user = checkResult.recordset[0];
      console.log('========================================');
      console.log('UTILISATEUR MIS À JOUR');
      console.log('========================================');
      console.log('ID:       ', user.id);
      console.log('Email:    ', user.email);
      console.log('Role ID:  ', user.role_id);
      console.log('Actif:    ', user.actif);
      console.log('Hash:     ', user.mot_de_passe_preview);
      console.log('========================================');
      console.log('');
      console.log('INFORMATIONS DE CONNEXION:');
      console.log('Email:        direction@stachery.tn');
      console.log('Mot de passe: Direction2024!');
      console.log('========================================');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
};

updatePassword();
