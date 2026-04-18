const { getConnection, sql } = require('../config/database');

/**
 * Middleware pour vérifier qu'un utilisateur a une permission spécifique
 * 
 * @param {string} module - Le module (ex: 'USERS', 'VEHICLES')
 * @param {string} action - L'action (ex: 'CREATE', 'READ', 'UPDATE', 'DELETE')
 * @returns {Function} Middleware Express
 * 
 * @example
 * router.post('/users', authMiddleware, requirePermission('USERS', 'CREATE'), createUser);
 */
const requirePermission = (module, action) => {
  return async (req, res, next) => {
    try {
      // Vérifier que l'utilisateur est authentifié
      if (!req.user || !req.user.id) {
        return res.status(401).json({ 
          error: 'Non authentifié',
          message: 'Vous devez être connecté pour accéder à cette ressource'
        });
      }

      const userId = req.user.id;
      const userRole = req.user.role;

      // Les ADMIN ont tous les droits par défaut
      if (userRole === 'ADMIN') {
        return next();
      }

      const pool = await getConnection();

      // Vérifier la permission dans la base de données
      const result = await pool.request()
        .input('user_id', sql.BigInt, userId)
        .input('module', sql.NVarChar(50), module)
        .input('action', sql.NVarChar(20), action)
        .query(`
          SELECT COUNT(*) AS has_permission
          FROM Permission p
          JOIN Utilisateur u ON u.role_id = p.role_id
          WHERE u.id = @user_id
            AND p.module = @module
            AND p.action = @action
            AND p.actif = 1
        `);

      const hasPermission = result.recordset[0].has_permission > 0;

      if (!hasPermission) {
        console.warn(`[Permission Denied] User ${userId} (${userRole}) tried to ${action} on ${module}`);
        return res.status(403).json({ 
          error: 'Permission refusée',
          message: `Vous n'avez pas la permission d'effectuer cette action (${module}.${action})`,
          required_permission: {
            module,
            action
          }
        });
      }

      // Permission accordée
      next();
    } catch (error) {
      console.error('Erreur vérification permission:', error);
      return res.status(500).json({ 
        error: 'Erreur lors de la vérification des permissions',
        message: error.message 
      });
    }
  };
};

/**
 * Middleware pour vérifier plusieurs permissions (OR logic)
 * L'utilisateur doit avoir AU MOINS UNE des permissions listées
 * 
 * @param {Array<{module: string, action: string}>} permissions - Liste des permissions
 * @returns {Function} Middleware Express
 * 
 * @example
 * router.get('/reports', authMiddleware, requireAnyPermission([
 *   { module: 'REPORTS', action: 'READ' },
 *   { module: 'REPORTS', action: 'EXPORT' }
 * ]), getReports);
 */
const requireAnyPermission = (permissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ 
          error: 'Non authentifié',
          message: 'Vous devez être connecté pour accéder à cette ressource'
        });
      }

      const userId = req.user.id;
      const userRole = req.user.role;

      // Les ADMIN ont tous les droits
      if (userRole === 'ADMIN') {
        return next();
      }

      const pool = await getConnection();

      // Construire la requête pour vérifier toutes les permissions
      const conditions = permissions.map((_, index) => 
        `(p.module = @module${index} AND p.action = @action${index})`
      ).join(' OR ');

      const request = pool.request().input('user_id', sql.BigInt, userId);
      
      permissions.forEach((perm, index) => {
        request.input(`module${index}`, sql.NVarChar(50), perm.module);
        request.input(`action${index}`, sql.NVarChar(20), perm.action);
      });

      const result = await request.query(`
        SELECT COUNT(*) AS has_permission
        FROM Permission p
        JOIN Utilisateur u ON u.role_id = p.role_id
        WHERE u.id = @user_id
          AND (${conditions})
          AND p.actif = 1
      `);

      const hasPermission = result.recordset[0].has_permission > 0;

      if (!hasPermission) {
        console.warn(`[Permission Denied] User ${userId} (${userRole}) needs one of:`, permissions);
        return res.status(403).json({ 
          error: 'Permission refusée',
          message: 'Vous n\'avez pas les permissions nécessaires pour cette action',
          required_permissions: permissions
        });
      }

      next();
    } catch (error) {
      console.error('Erreur vérification permissions:', error);
      return res.status(500).json({ 
        error: 'Erreur lors de la vérification des permissions',
        message: error.message 
      });
    }
  };
};

/**
 * Middleware pour vérifier plusieurs permissions (AND logic)
 * L'utilisateur doit avoir TOUTES les permissions listées
 * 
 * @param {Array<{module: string, action: string}>} permissions - Liste des permissions
 * @returns {Function} Middleware Express
 * 
 * @example
 * router.post('/critical-action', authMiddleware, requireAllPermissions([
 *   { module: 'USERS', action: 'DELETE' },
 *   { module: 'SETTINGS', action: 'UPDATE' }
 * ]), criticalAction);
 */
const requireAllPermissions = (permissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ 
          error: 'Non authentifié',
          message: 'Vous devez être connecté pour accéder à cette ressource'
        });
      }

      const userId = req.user.id;
      const userRole = req.user.role;

      // Les ADMIN ont tous les droits
      if (userRole === 'ADMIN') {
        return next();
      }

      const pool = await getConnection();

      // Vérifier chaque permission individuellement
      for (const perm of permissions) {
        const result = await pool.request()
          .input('user_id', sql.BigInt, userId)
          .input('module', sql.NVarChar(50), perm.module)
          .input('action', sql.NVarChar(20), perm.action)
          .query(`
            SELECT COUNT(*) AS has_permission
            FROM Permission p
            JOIN Utilisateur u ON u.role_id = p.role_id
            WHERE u.id = @user_id
              AND p.module = @module
              AND p.action = @action
              AND p.actif = 1
          `);

        const hasPermission = result.recordset[0].has_permission > 0;

        if (!hasPermission) {
          console.warn(`[Permission Denied] User ${userId} (${userRole}) missing: ${perm.module}.${perm.action}`);
          return res.status(403).json({ 
            error: 'Permission refusée',
            message: `Permission manquante: ${perm.module}.${perm.action}`,
            required_permissions: permissions,
            missing_permission: perm
          });
        }
      }

      // Toutes les permissions sont présentes
      next();
    } catch (error) {
      console.error('Erreur vérification permissions:', error);
      return res.status(500).json({ 
        error: 'Erreur lors de la vérification des permissions',
        message: error.message 
      });
    }
  };
};

/**
 * Fonction helper pour vérifier une permission sans middleware
 * Utile pour les vérifications conditionnelles dans les contrôleurs
 * 
 * @param {number} userId - ID de l'utilisateur
 * @param {string} module - Le module
 * @param {string} action - L'action
 * @returns {Promise<boolean>} true si l'utilisateur a la permission
 */
const checkUserPermission = async (userId, module, action) => {
  try {
    const pool = await getConnection();

    const result = await pool.request()
      .input('user_id', sql.BigInt, userId)
      .input('module', sql.NVarChar(50), module)
      .input('action', sql.NVarChar(20), action)
      .query(`
        SELECT COUNT(*) AS has_permission
        FROM Permission p
        JOIN Utilisateur u ON u.role_id = p.role_id
        WHERE u.id = @user_id
          AND p.module = @module
          AND p.action = @action
          AND p.actif = 1
      `);

    return result.recordset[0].has_permission > 0;
  } catch (error) {
    console.error('Erreur vérification permission:', error);
    return false;
  }
};

module.exports = {
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  checkUserPermission
};
