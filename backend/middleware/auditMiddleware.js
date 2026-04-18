/**
 * MIDDLEWARE: Audit Logging
 * Intercepte et enregistre toutes les modifications importantes dans le système
 */

const { getConnection, sql } = require('../config/database');

/**
 * Configuration des entités à auditer
 * Map les routes vers les types d'entités
 */
const ENTITY_MAPPING = {
  '/api/appointments': 'RendezVous',
  '/api/vehicles': 'Vehicule',
  '/api/users': 'Utilisateur',
  '/api/admin/users': 'Utilisateur',
  '/api/complaints': 'Reclamation',
  '/api/admin/agencies': 'Agence',
  '/api/admin/catalog': 'Catalogue',
  '/api/admin/intervention-types': 'TypeIntervention',
  '/api/admin/packages': 'Package',
  '/api/admin/promotions': 'Promotion',
  '/api/admin/timeslots': 'CreneauHoraire',
  '/api/admin/colors': 'Couleur',
  '/api/admin/documents': 'Document',
  '/api/admin/permissions': 'Permission',
  '/api/admin/orders': 'Commande',
  '/api/client/orders': 'Commande',
  '/api/feedback': 'Feedback',
};

/**
 * Actions à ne pas auditer (lecture seule)
 */
const SKIP_METHODS = ['GET', 'HEAD', 'OPTIONS'];

/**
 * Routes à exclure de l'audit
 */
const SKIP_ROUTES = [
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/refresh',
  '/api/admin/audit', // Ne pas auditer les requêtes d'audit elles-mêmes
];

/**
 * Détermine le type d'entité basé sur l'URL
 */
function getEntityType(url) {
  for (const [route, entity] of Object.entries(ENTITY_MAPPING)) {
    if (url.startsWith(route)) {
      return entity;
    }
  }
  return 'Unknown';
}

/**
 * Extrait l'ID de l'entité depuis l'URL ou le body
 */
function getEntityId(req) {
  // Essayer d'extraire depuis les params de route
  if (req.params.id) return req.params.id;
  if (req.params.vehicleId) return req.params.vehicleId;
  if (req.params.appointmentId) return req.params.appointmentId;
  
  // Essayer d'extraire depuis le body
  if (req.body && req.body.id) return req.body.id;
  
  return null;
}

/**
 * Détermine l'action basée sur la méthode HTTP et le contexte
 */
function getAction(method, hasId) {
  switch (method) {
    case 'POST':
      return 'CREATE';
    case 'PUT':
    case 'PATCH':
      return 'UPDATE';
    case 'DELETE':
      return 'DELETE';
    default:
      return 'UNKNOWN';
  }
}

/**
 * Nettoie les données sensibles avant de les logger
 */
function sanitizeData(data) {
  if (!data) return null;
  
  const sanitized = { ...data };
  
  // Supprimer les champs sensibles
  const sensitiveFields = ['password', 'mot_de_passe', 'token', 'refresh_token', 'otp_code'];
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '***REDACTED***';
    }
  });
  
  return sanitized;
}

/**
 * Enregistre une entrée d'audit dans la base de données
 */
async function logAudit({
  utilisateurId,
  utilisateurNom,
  utilisateurRole,
  action,
  entiteType,
  entiteId,
  ancienValeur,
  nouveauValeur,
  description,
  ipAddress,
  userAgent,
  endpoint,
  methodeHttp,
  statut = 'SUCCESS',
  erreurMessage = null
}) {
  try {
    const pool = await getConnection();
    
    await pool.request()
      .input('utilisateur_id', sql.BigInt, utilisateurId)
      .input('utilisateur_nom', sql.NVarChar, utilisateurNom)
      .input('utilisateur_role', sql.NVarChar, utilisateurRole)
      .input('action', sql.NVarChar, action)
      .input('entite_type', sql.NVarChar, entiteType)
      .input('entite_id', sql.NVarChar, entiteId)
      .input('ancien_valeur', sql.NVarChar, ancienValeur ? JSON.stringify(sanitizeData(ancienValeur)) : null)
      .input('nouveau_valeur', sql.NVarChar, nouveauValeur ? JSON.stringify(sanitizeData(nouveauValeur)) : null)
      .input('description', sql.NVarChar, description)
      .input('ip_address', sql.NVarChar, ipAddress)
      .input('user_agent', sql.NVarChar, userAgent)
      .input('endpoint', sql.NVarChar, endpoint)
      .input('methode_http', sql.NVarChar, methodeHttp)
      .input('statut', sql.NVarChar, statut)
      .input('erreur_message', sql.NVarChar, erreurMessage)
      .query(`
        INSERT INTO AuditLog (
          utilisateur_id, utilisateur_nom, utilisateur_role,
          action, entite_type, entite_id,
          ancien_valeur, nouveau_valeur, description,
          ip_address, user_agent, endpoint, methode_http,
          statut, erreur_message, date_action
        ) VALUES (
          @utilisateur_id, @utilisateur_nom, @utilisateur_role,
          @action, @entite_type, @entite_id,
          @ancien_valeur, @nouveau_valeur, @description,
          @ip_address, @user_agent, @endpoint, @methode_http,
          @statut, @erreur_message, GETDATE()
        )
      `);
  } catch (error) {
    // Ne pas faire échouer la requête si l'audit échoue
    console.error('[AuditMiddleware] Erreur lors de l\'enregistrement:', error.message);
  }
}

/**
 * Middleware d'audit - Enregistre après la réponse
 */
function auditMiddleware(req, res, next) {
  // Ignorer les méthodes de lecture
  if (SKIP_METHODS.includes(req.method)) {
    return next();
  }
  
  // Ignorer les routes exclues
  if (SKIP_ROUTES.some(route => req.path.startsWith(route))) {
    return next();
  }
  
  // Ignorer si pas d'utilisateur authentifié
  if (!req.user || !req.user.id) {
    return next();
  }
  
  // Capturer les données de la requête
  const entiteType = getEntityType(req.path);
  const entiteId = getEntityId(req);
  const action = getAction(req.method, !!entiteId);
  const ipAddress = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('user-agent');
  
  // Sauvegarder le body original (pour UPDATE/DELETE)
  const requestBody = { ...req.body };
  
  // Intercepter la réponse
  const originalJson = res.json;
  res.json = function(data) {
    // Enregistrer l'audit de manière asynchrone
    setImmediate(() => {
      const description = generateDescription(action, entiteType, entiteId, req.user);
      
      logAudit({
        utilisateurId: req.user.id,
        utilisateurNom: req.user.nom || req.user.email,
        utilisateurRole: req.user.role,
        action,
        entiteType,
        entiteId: entiteId ? String(entiteId) : null,
        ancienValeur: action === 'UPDATE' || action === 'DELETE' ? requestBody : null,
        nouveauValeur: action === 'CREATE' || action === 'UPDATE' ? data : null,
        description,
        ipAddress,
        userAgent,
        endpoint: req.path,
        methodeHttp: req.method,
        statut: res.statusCode < 400 ? 'SUCCESS' : 'FAILED',
        erreurMessage: res.statusCode >= 400 ? data.error || data.message : null
      });
    });
    
    // Appeler la méthode json originale
    return originalJson.call(this, data);
  };
  
  next();
}

/**
 * Génère une description lisible de l'action
 */
function generateDescription(action, entiteType, entiteId, user) {
  const userName = user.nom || user.email;
  const entityName = entiteType;
  const entityIdStr = entiteId ? ` #${entiteId}` : '';
  
  switch (action) {
    case 'CREATE':
      return `${userName} a créé ${entityName}${entityIdStr}`;
    case 'UPDATE':
      return `${userName} a modifié ${entityName}${entityIdStr}`;
    case 'DELETE':
      return `${userName} a supprimé ${entityName}${entityIdStr}`;
    default:
      return `${userName} a effectué une action sur ${entityName}${entityIdStr}`;
  }
}

/**
 * Fonction utilitaire pour logger manuellement une action d'audit
 * Utilisable dans les contrôleurs pour des actions spécifiques
 */
async function logManualAudit(req, {
  action,
  entiteType,
  entiteId,
  ancienValeur,
  nouveauValeur,
  description
}) {
  if (!req.user) return;
  
  await logAudit({
    utilisateurId: req.user.id,
    utilisateurNom: req.user.nom || req.user.email,
    utilisateurRole: req.user.role,
    action,
    entiteType,
    entiteId: entiteId ? String(entiteId) : null,
    ancienValeur,
    nouveauValeur,
    description,
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent'),
    endpoint: req.path,
    methodeHttp: req.method,
    statut: 'SUCCESS'
  });
}

module.exports = {
  auditMiddleware,
  logManualAudit,
  logAudit
};
