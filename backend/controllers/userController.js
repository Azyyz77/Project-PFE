const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getConnection, sql } = require('../config/database');

const register = async (req, res) => {
  try {
    const { prenom, nom, telephone, email, password, type_utilisateur } = req.body;

    if (!prenom || !nom || !telephone || !email || !password) {
      return res.status(400).json({
        error: 'Tous les champs sont obligatoires',
        required: ['prenom', 'nom', 'telephone', 'email', 'password']
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Format email invalide' });
    }

    const typeUtilisateur = type_utilisateur || 'CLIENT';
    const validTypes = ['CLIENT', 'AGENT', 'ADMIN', 'DIRECTION'];
    if (!validTypes.includes(typeUtilisateur)) {
      return res.status(400).json({ error: 'Type utilisateur invalide', validTypes });
    }

    const pool = await getConnection();

    const checkResult = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT id FROM Utilisateur WHERE email = @email');

    if (checkResult.recordset.length > 0) {
      return res.status(409).json({ error: 'Cet email est déjà utilisé' });
    }

    const roleResult = await pool.request()
      .input('rolenom', sql.NVarChar, typeUtilisateur)
      .query('SELECT id FROM Role WHERE nom = @rolenom');

    if (roleResult.recordset.length === 0) {
      return res.status(500).json({ error: 'Rôle introuvable en base' });
    }
    const role_id = roleResult.recordset[0].id;

    const mot_de_passe = await bcrypt.hash(password, 10);

    const insertQuery = `
      INSERT INTO Utilisateur (type_utilisateur, nom, prenom, telephone, email, mot_de_passe, actif, date_creation, role_id)
      OUTPUT INSERTED.id, INSERTED.nom, INSERTED.prenom, INSERTED.email,
             INSERTED.telephone, INSERTED.type_utilisateur, INSERTED.actif, INSERTED.date_creation
      VALUES (@type_utilisateur, @nom, @prenom, @telephone, @email, @mot_de_passe, 1, GETDATE(), @role_id)
    `;

    const result = await pool.request()
      .input('type_utilisateur', sql.NVarChar, typeUtilisateur)
      .input('nom', sql.NVarChar, nom)
      .input('prenom', sql.NVarChar, prenom)
      .input('telephone', sql.NVarChar, telephone)
      .input('email', sql.NVarChar, email)
      .input('mot_de_passe', sql.NVarChar, mot_de_passe)
      .input('role_id', sql.BigInt, role_id)
      .query(insertQuery);

    const newUser = result.recordset[0];

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user: {
        id: newUser.id,
        prenom: newUser.prenom,
        nom: newUser.nom,
        email: newUser.email,
        telephone: newUser.telephone,
        type_utilisateur: newUser.type_utilisateur,
        actif: newUser.actif,
        date_creation: newUser.date_creation
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({ error: 'Erreur lors de l\'inscription', message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    const pool = await getConnection();

    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query(`
        SELECT u.id, u.prenom, u.nom, u.email, u.telephone, u.mot_de_passe,
               u.type_utilisateur, u.actif, u.date_creation, r.nom AS role_nom
        FROM Utilisateur u
        JOIN Role r ON r.id = u.role_id
        WHERE u.email = @email
      `);

    if (result.recordset.length === 0) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const user = result.recordset[0];

    if (!user.actif) {
      return res.status(403).json({ error: 'Compte désactivé. Contactez l\'administrateur.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.mot_de_passe);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role_nom },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      message: 'Connexion réussie',
      token,
      user: {
        id: user.id,
        prenom: user.prenom,
        nom: user.nom,
        email: user.email,
        telephone: user.telephone,
        type_utilisateur: user.type_utilisateur,
        date_creation: user.date_creation
      }
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ error: 'Erreur lors de la connexion', message: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await getConnection();

    const result = await pool.request()
      .input('id', sql.BigInt, id)
      .query(`
        SELECT u.id, u.prenom, u.nom, u.email, u.telephone, u.type_utilisateur, u.actif, u.date_creation,
               r.nom AS role_nom
        FROM Utilisateur u
        JOIN Role r ON r.id = u.role_id
        WHERE u.id = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({ user: result.recordset[0] });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'utilisateur', message: error.message });
  }
};

module.exports = { register, login, getUserById };
