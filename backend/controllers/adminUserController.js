const { getConnection, sql } = require('../config/database');
const bcrypt = require('bcrypt');

/**
 * Controller pour la gestion des utilisateurs par l'admin
 */

// Récupérer tous les utilisateurs avec filtres
const getAllUsers = async (req, res) => {
  try {
    const { role, actif, search } = req.query;
    const pool = await getConnection();

    let query = `
      SELECT 
        u.id,
        u.nom,
        u.prenom,
        u.email,
        u.telephone,
        u.actif,
        u.date_creation,
        ISNULL(u.role, 'CLIENT') AS role_nom
      FROM Utilisateur u
      WHERE 1=1
    `;

    const request = pool.request();

    // Filtrer par rôle
    if (role) {
      query += ` AND u.role = @role`;
      request.input('role', sql.VarChar, role);
    }

    // Filtrer par statut actif
    if (actif !== undefined) {
      query += ` AND u.actif = @actif`;
      request.input('actif', sql.Bit, actif === 'true' || actif === '1');
    }

    // Recherche par nom, prénom ou email
    if (search) {
      query += ` AND (u.nom LIKE @search OR u.prenom LIKE @search OR u.email LIKE @search)`;
      request.input('search', sql.VarChar, `%${search}%`);
    }

    query += ` ORDER BY u.date_creation DESC`;

    const result = await request.query(query);

    return res.json({ users: result.recordset });
  } catch (error) {
    console.error('Erreur récupération utilisateurs:', error);
    return res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
  }
};

// Récupérer les statistiques des utilisateurs
const getUserStats = async (req, res) => {
  try {
    const pool = await getConnection();

    const stats = await pool.request().query(`
      SELECT 
        COUNT(*) AS total_users,
        COUNT(CASE WHEN actif = 1 THEN 1 END) AS active_users,
        COUNT(CASE WHEN actif = 0 THEN 1 END) AS inactive_users,
        (SELECT COUNT(*) FROM Utilisateur u WHERE u.role = 'CLIENT') AS total_clients,
        (SELECT COUNT(*) FROM Utilisateur u WHERE u.role = 'AGENT') AS total_agents,
        (SELECT COUNT(*) FROM Utilisateur u WHERE u.role = 'ADMIN') AS total_admins
      FROM Utilisateur
    `);

    return res.json({ stats: stats.recordset[0] });
  } catch (error) {
    console.error('Erreur récupération stats utilisateurs:', error);
    return res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
};

// Créer un nouvel utilisateur
const createUser = async (req, res) => {
  try {
    const { nom, prenom, email, telephone, password, role_nom } = req.body;

    // Validation
    if (!nom || !prenom || !email || !password || !role_nom) {
      return res.status(400).json({ error: 'Tous les champs obligatoires doivent être remplis' });
    }

    const pool = await getConnection();

    // Vérifier si l'email existe déjà
    const existingUser = await pool.request()
      .input('email', sql.VarChar, email)
      .query('SELECT id FROM Utilisateur WHERE email = @email');

    if (existingUser.recordset.length > 0) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }

    const normalizedRole = String(role_nom || '').toUpperCase();
    const validRoles = ['CLIENT', 'AGENT', 'ADMIN', 'DIRECTION'];
    if (!validRoles.includes(normalizedRole)) {
      return res.status(400).json({ error: 'Rôle invalide', validRoles });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const result = await pool.request()
      .input('nom', sql.VarChar, nom)
      .input('prenom', sql.VarChar, prenom)
      .input('email', sql.VarChar, email)
      .input('telephone', sql.VarChar, telephone || null)
      .input('mot_de_passe', sql.VarChar, hashedPassword)
      .input('role', sql.VarChar, normalizedRole)
      .input('actif', sql.Bit, true)
      .query(`
        INSERT INTO Utilisateur (nom, prenom, email, telephone, mot_de_passe, role, actif, date_creation)
        OUTPUT INSERTED.id
        VALUES (@nom, @prenom, @email, @telephone, @mot_de_passe, @role, @actif, GETDATE())
      `);

    const userId = result.recordset[0].id;

    return res.status(201).json({ 
      message: 'Utilisateur créé avec succès',
      userId 
    });
  } catch (error) {
    console.error('Erreur création utilisateur:', error);
    return res.status(500).json({ error: 'Erreur lors de la création de l\'utilisateur' });
  }
};

// Mettre à jour un utilisateur
const updateUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { nom, prenom, email, telephone, role_nom, actif } = req.body;

    const pool = await getConnection();

    // Vérifier si l'utilisateur existe
    const userCheck = await pool.request()
      .input('id', sql.BigInt, userId)
      .query('SELECT id FROM Utilisateur WHERE id = @id');

    if (userCheck.recordset.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Construire la requête de mise à jour dynamiquement
    const updates = [];
    const request = pool.request().input('id', sql.BigInt, userId);

    if (nom !== undefined) {
      updates.push('nom = @nom');
      request.input('nom', sql.VarChar, nom);
    }
    if (prenom !== undefined) {
      updates.push('prenom = @prenom');
      request.input('prenom', sql.VarChar, prenom);
    }
    if (email !== undefined) {
      updates.push('email = @email');
      request.input('email', sql.VarChar, email);
    }
    if (telephone !== undefined) {
      updates.push('telephone = @telephone');
      request.input('telephone', sql.VarChar, telephone);
    }
    if (actif !== undefined) {
      updates.push('actif = @actif');
      request.input('actif', sql.Bit, actif);
    }
    if (role_nom !== undefined) {
      const normalizedRole = String(role_nom || '').toUpperCase();
      const validRoles = ['CLIENT', 'AGENT', 'ADMIN', 'DIRECTION'];
      if (!validRoles.includes(normalizedRole)) {
        return res.status(400).json({ error: 'Rôle invalide', validRoles });
      }
      updates.push('role = @role');
      request.input('role', sql.VarChar, normalizedRole);
    }

    // Si aucune mise à jour n'est fournie
    if (updates.length === 0) {
      return res.status(400).json({ error: 'Aucune donnée à mettre à jour' });
    }

    const updateQuery = `UPDATE Utilisateur SET ${updates.join(', ')} WHERE id = @id`;

    await request.query(updateQuery);

    return res.json({ message: 'Utilisateur mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur mise à jour utilisateur:', error);
    return res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'utilisateur' });
  }
};

// Supprimer un utilisateur (soft delete)
const deleteUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const pool = await getConnection();

    // Vérifier si l'utilisateur existe
    const userCheck = await pool.request()
      .input('id', sql.BigInt, userId)
      .query('SELECT id FROM Utilisateur WHERE id = @id');

    if (userCheck.recordset.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Désactiver l'utilisateur au lieu de le supprimer
    await pool.request()
      .input('id', sql.BigInt, userId)
      .query('UPDATE Utilisateur SET actif = 0 WHERE id = @id');

    return res.json({ message: 'Utilisateur désactivé avec succès' });
  } catch (error) {
    console.error('Erreur suppression utilisateur:', error);
    return res.status(500).json({ error: 'Erreur lors de la suppression de l\'utilisateur' });
  }
};

// Réinitialiser le mot de passe d'un utilisateur
const resetUserPassword = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
    }

    const pool = await getConnection();

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.request()
      .input('id', sql.BigInt, userId)
      .input('mot_de_passe', sql.VarChar, hashedPassword)
      .query('UPDATE Utilisateur SET mot_de_passe = @mot_de_passe WHERE id = @id');

    return res.json({ message: 'Mot de passe réinitialisé avec succès' });
  } catch (error) {
    console.error('Erreur réinitialisation mot de passe:', error);
    return res.status(500).json({ error: 'Erreur lors de la réinitialisation du mot de passe' });
  }
};

// Récupérer tous les rôles disponibles
const getRoles = async (req, res) => {
  try {
    const roles = [
      { id: 1, nom: 'CLIENT', description: 'Client' },
      { id: 2, nom: 'AGENT', description: 'Agent SAV' },
      { id: 3, nom: 'ADMIN', description: 'Administrateur' },
      { id: 4, nom: 'DIRECTION', description: 'Direction' }
    ];

    return res.json({ roles });
  } catch (error) {
    console.error('Erreur récupération rôles:', error);
    return res.status(500).json({ error: 'Erreur lors de la récupération des rôles' });
  }
};

module.exports = {
  getAllUsers,
  getUserStats,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
  getRoles
};
