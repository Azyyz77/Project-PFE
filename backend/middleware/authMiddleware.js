const jwt = require('jsonwebtoken');
const { getConnection, sql } = require('../config/database');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    console.log(`[AuthMiddleware] ${req.method} ${req.path} - Auth header:`, authHeader ? 'Present' : 'Missing');

    if (!authHeader) {
      return res.status(401).json({
        error: 'Token non fourni',
        message: 'Veuillez inclure le header Authorization avec le format: Bearer <token>'
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        error: 'Format de token invalide',
        message: 'Le format doit être: Bearer <token>'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };

    console.log(`[AuthMiddleware] User authenticated:`, req.user.id, req.user.role);

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expiré',
        message: 'Veuillez vous reconnecter'
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token invalide',
        message: 'Le token fourni est invalide'
      });
    }
    console.error('Erreur d\'authentification:', error);
    res.status(500).json({
      error: 'Erreur lors de la vérification du token',
      message: error.message
    });
  }
};

// Middleware pour vérifier que le rôle de l'utilisateur est cohérent avec la base de données
// THIS IS OPTIONAL - adds validation & logging but doesn't block access
const validateUserRole = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      // User should be authenticated already, but if not, just continue
      return next();
    }

    const pool = await getConnection();
    const result = await pool.request()
      .input('id', sql.BigInt, req.user.id)
      .query(`
        SELECT u.id, u.actif, u.role_id,
               r.nom AS role_nom
        FROM Utilisateur u
        LEFT JOIN Role r ON r.id = u.role_id
        WHERE u.id = @id
      `);

    if (result.recordset.length > 0) {
      const user = result.recordset[0];

      // Use role_nom from the Role table join as the authoritative role
      if (user.role_nom && user.role_nom !== req.user.role) {
        console.warn(`Role mismatch for user ${user.id}: token has ${req.user.role}, DB has ${user.role_nom}`);
        // Update the token role with the DB version
        req.user.role = user.role_nom;
      }

      // Stocker les informations complètes de l'utilisateur dans la requête
      req.userDB = user;

      // Check if user is active - but log warning instead of blocking
      if (!user.actif) {
        console.warn(`Access attempt from inactive user ${user.id}`);
      }
    }

    next();
  } catch (error) {
    console.error('Erreur lors de la validation du rôle (non-blocking):', error);
    // Don't block the request, just log and continue
    next();
  }
};

// Middleware pour vérifier si l'utilisateur a un rôle spécifique
const hasRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Accès refusé',
        message: `Ce rôle n'est pas autorisé. Rôles requis: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};

module.exports = {
  authMiddleware,
  validateUserRole,
  hasRole
};
