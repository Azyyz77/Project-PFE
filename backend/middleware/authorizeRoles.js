/**
 * Role-based authorization middleware
 * Usage: router.post('/', authorizeRoles('client', 'admin'), controller.action)
 * 
 * Supports checking against either:
 * - JWT role field (from JWTpayload, usually from Role table)
 * - Request user type (fallback if role is missing)
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Non authentifié',
        message: 'Authentification requise'
      });
    }

    // Get the user's role (could be from JWT or from database)
    // Priority: JWT role_nom > fallback to type_utilisateur
    let userRole = req.user.role || '';
    
    if (!userRole && req.user.type_utilisateur) {
      userRole = req.user.type_utilisateur;
    }

    userRole = userRole ? userRole.toUpperCase() : '';
    const normalizedAllowedRoles = allowedRoles.map(role => role.toUpperCase());

    if (!userRole) {
      console.warn(`[AuthorizeRoles] User ${req.user.id} has no role defined in JWT or user object`);
      return res.status(403).json({
        error: 'Accès non autorisé',
        message: 'Aucun rôle défini pour votre compte'
      });
    }

    if (!normalizedAllowedRoles.includes(userRole)) {
      console.warn(`[AuthorizeRoles] User ${req.user.id} with role ${userRole} not in allowed roles ${normalizedAllowedRoles.join(', ')}`);
      return res.status(403).json({
        error: 'Accès non autorisé',
        message: `Seuls les rôles [${normalizedAllowedRoles.join(', ')}] peuvent accéder à cette ressource. Votre rôle: ${userRole}`
      });
    }

    next();
  };
};

module.exports = authorizeRoles;
