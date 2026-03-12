const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getConnection, sql } = require('../config/database');

const register = async (req, res) => {
  try {
    const { first_name, last_name, phone, email, password, role } = req.body;

    if (!first_name || !last_name || !phone || !email || !password) {
      return res.status(400).json({
        error: 'Tous les champs sont obligatoires',
        required: ['first_name', 'last_name', 'phone', 'email', 'password']
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Format email invalide' });
    }

    const pool = await getConnection();

    const checkResult = await pool.request()
      .input('email', sql.VarChar, email)
      .query('SELECT id FROM Users WHERE email = @email');

    if (checkResult.recordset.length > 0) {
      return res.status(409).json({ error: 'Cet email est déjà utilisé' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const userRole = role || 'CLIENT';
    const validRoles = ['CLIENT', 'ADMIN', 'AGENT_SAV', 'RESPONSABLE_ATELIER'];
    if (!validRoles.includes(userRole)) {
      return res.status(400).json({ error: 'Rôle invalide', validRoles });
    }

    const insertQuery = `
      INSERT INTO Users (first_name, last_name, phone, email, password_hash, role, is_active, created_at)
      OUTPUT INSERTED.id, INSERTED.first_name, INSERTED.last_name, INSERTED.email,
             INSERTED.phone, INSERTED.role, INSERTED.is_active, INSERTED.created_at
      VALUES (@first_name, @last_name, @phone, @email, @password_hash, @role, 1, GETDATE())
    `;

    const result = await pool.request()
      .input('first_name', sql.VarChar, first_name)
      .input('last_name', sql.VarChar, last_name)
      .input('phone', sql.VarChar, phone)
      .input('email', sql.VarChar, email)
      .input('password_hash', sql.VarChar, password_hash)
      .input('role', sql.VarChar, userRole)
      .query(insertQuery);

    const newUser = result.recordset[0];

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user: {
        id: newUser.id,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        is_active: newUser.is_active,
        created_at: newUser.created_at
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
      .input('email', sql.VarChar, email)
      .query(`
        SELECT id, first_name, last_name, email, phone, password_hash, role, is_active, created_at
        FROM Users WHERE email = @email
      `);

    if (result.recordset.length === 0) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const user = result.recordset[0];

    if (!user.is_active) {
      return res.status(403).json({ error: 'Compte désactivé. Contactez l\'administrateur.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      message: 'Connexion réussie',
      token,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        created_at: user.created_at
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
      .input('id', sql.Int, id)
      .query(`
        SELECT id, first_name, last_name, email, phone, role, is_active, created_at
        FROM Users WHERE id = @id
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
