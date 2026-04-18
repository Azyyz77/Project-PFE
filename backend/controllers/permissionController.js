const { getConnection, sql } = require('../config/database');

/**
 * Obtenir toutes les permissions
 */
const getPermissions = async (req, res) => {
  try {
    const pool = await getConnection();
    
    const result = await pool.request().query(`
      SELECT 
        p.id,
        p.role_id,
        r.nom AS role_nom,
        p.module,
        p.action,
        p.actif
      FROM Permission p
      JOIN Role r ON r.id = p.role_id
      ORDER BY r.nom, p.module, p.action
    `);

    res.json({
      count: result.recordset.length,
      permissions: result.recordset
    });
  } catch (error) {
    console.error('Erreur récupération permissions:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des permissions',
      message: error.message 
    });
  }
};

/**
 * Obtenir les permissions par rôle
 */
const getPermissionsByRole = async (req, res) => {
  try {
    const { roleId } = req.params;
    const pool = await getConnection();
    
    const result = await pool.request()
      .input('role_id', sql.BigInt, roleId)
      .query(`
        SELECT 
          p.id,
          p.role_id,
          r.nom AS role_nom,
          p.module,
          p.action,
          p.actif
        FROM Permission p
        JOIN Role r ON r.id = p.role_id
        WHERE p.role_id = @role_id
        ORDER BY p.module, p.action
      `);

    res.json({
      count: result.recordset.length,
      permissions: result.recordset
    });
  } catch (error) {
    console.error('Erreur récupération permissions par rôle:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des permissions',
      message: error.message 
    });
  }
};

/**
 * Obtenir tous les modules disponibles
 */
const getModules = async (req, res) => {
  try {
    const modules = [
      { code: 'USERS', nom: 'Gestion des utilisateurs' },
      { code: 'VEHICLES', nom: 'Gestion des véhicules' },
      { code: 'APPOINTMENTS', nom: 'Gestion des rendez-vous' },
      { code: 'INTERVENTIONS', nom: 'Gestion des interventions' },
      { code: 'COMPLAINTS', nom: 'Gestion des réclamations' },
      { code: 'CATALOG', nom: 'Gestion du catalogue' },
      { code: 'PACKAGES', nom: 'Gestion des packages' },
      { code: 'PROMOTIONS', nom: 'Gestion des promotions' },
      { code: 'DOCUMENTS', nom: 'Gestion des documents' },
      { code: 'NOTIFICATIONS', nom: 'Gestion des notifications' },
      { code: 'REPORTS', nom: 'Rapports et statistiques' },
      { code: 'SETTINGS', nom: 'Paramètres système' },
      { code: 'PERMISSIONS', nom: 'Gestion des permissions' },
      { code: 'AGENCIES', nom: 'Gestion des agences' },
      { code: 'TIMESLOTS', nom: 'Gestion des plages horaires' }
    ];

    const actions = [
      { code: 'CREATE', nom: 'Créer' },
      { code: 'READ', nom: 'Consulter' },
      { code: 'UPDATE', nom: 'Modifier' },
      { code: 'DELETE', nom: 'Supprimer' },
      { code: 'VALIDATE', nom: 'Valider' },
      { code: 'EXPORT', nom: 'Exporter' }
    ];

    res.json({ modules, actions });
  } catch (error) {
    console.error('Erreur récupération modules:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des modules',
      message: error.message 
    });
  }
};

/**
 * Créer une permission
 */
const createPermission = async (req, res) => {
  try {
    const { role_id, module, action, actif = true } = req.body;

    // Validation
    if (!role_id || !module || !action) {
      return res.status(400).json({
        error: 'Champs requis manquants',
        required: ['role_id', 'module', 'action']
      });
    }

    const pool = await getConnection();

    // Vérifier que le rôle existe
    const roleCheck = await pool.request()
      .input('role_id', sql.BigInt, role_id)
      .query('SELECT id FROM Role WHERE id = @role_id');

    if (roleCheck.recordset.length === 0) {
      return res.status(404).json({ error: 'Rôle non trouvé' });
    }

    // Vérifier que la permission n'existe pas déjà
    const existingCheck = await pool.request()
      .input('role_id', sql.BigInt, role_id)
      .input('module', sql.NVarChar(50), module)
      .input('action', sql.NVarChar(20), action)
      .query(`
        SELECT id FROM Permission 
        WHERE role_id = @role_id 
          AND module = @module 
          AND action = @action
      `);

    if (existingCheck.recordset.length > 0) {
      return res.status(409).json({ 
        error: 'Cette permission existe déjà pour ce rôle' 
      });
    }

    // Créer la permission
    const result = await pool.request()
      .input('role_id', sql.BigInt, role_id)
      .input('module', sql.NVarChar(50), module)
      .input('action', sql.NVarChar(20), action)
      .input('actif', sql.Bit, actif ? 1 : 0)
      .query(`
        INSERT INTO Permission (role_id, module, action, actif)
        OUTPUT INSERTED.id, INSERTED.role_id, INSERTED.module, INSERTED.action, INSERTED.actif
        VALUES (@role_id, @module, @action, @actif)
      `);

    const newPermission = result.recordset[0];

    // Récupérer le nom du rôle
    const roleInfo = await pool.request()
      .input('role_id', sql.BigInt, role_id)
      .query('SELECT nom FROM Role WHERE id = @role_id');

    res.status(201).json({
      message: 'Permission créée avec succès',
      permission: {
        ...newPermission,
        role_nom: roleInfo.recordset[0].nom
      }
    });
  } catch (error) {
    console.error('Erreur création permission:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la création de la permission',
      message: error.message 
    });
  }
};

/**
 * Mettre à jour une permission
 */
const updatePermission = async (req, res) => {
  try {
    const { id } = req.params;
    const { actif } = req.body;

    if (actif === undefined) {
      return res.status(400).json({ 
        error: 'Le champ actif est requis' 
      });
    }

    const pool = await getConnection();

    // Vérifier que la permission existe
    const existingCheck = await pool.request()
      .input('id', sql.BigInt, id)
      .query('SELECT id FROM Permission WHERE id = @id');

    if (existingCheck.recordset.length === 0) {
      return res.status(404).json({ error: 'Permission non trouvée' });
    }

    // Mettre à jour
    await pool.request()
      .input('id', sql.BigInt, id)
      .input('actif', sql.Bit, actif ? 1 : 0)
      .query('UPDATE Permission SET actif = @actif WHERE id = @id');

    // Récupérer la permission mise à jour
    const result = await pool.request()
      .input('id', sql.BigInt, id)
      .query(`
        SELECT 
          p.id,
          p.role_id,
          r.nom AS role_nom,
          p.module,
          p.action,
          p.actif
        FROM Permission p
        JOIN Role r ON r.id = p.role_id
        WHERE p.id = @id
      `);

    res.json({
      message: 'Permission mise à jour avec succès',
      permission: result.recordset[0]
    });
  } catch (error) {
    console.error('Erreur mise à jour permission:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la mise à jour de la permission',
      message: error.message 
    });
  }
};

/**
 * Supprimer une permission
 */
const deletePermission = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getConnection();

    // Vérifier que la permission existe
    const existingCheck = await pool.request()
      .input('id', sql.BigInt, id)
      .query('SELECT id FROM Permission WHERE id = @id');

    if (existingCheck.recordset.length === 0) {
      return res.status(404).json({ error: 'Permission non trouvée' });
    }

    // Supprimer
    await pool.request()
      .input('id', sql.BigInt, id)
      .query('DELETE FROM Permission WHERE id = @id');

    res.json({ message: 'Permission supprimée avec succès' });
  } catch (error) {
    console.error('Erreur suppression permission:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la suppression de la permission',
      message: error.message 
    });
  }
};

/**
 * Vérifier si un utilisateur a une permission
 */
const checkPermission = async (req, res) => {
  try {
    const { userId, module, action } = req.query;

    if (!userId || !module || !action) {
      return res.status(400).json({
        error: 'Paramètres requis manquants',
        required: ['userId', 'module', 'action']
      });
    }

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

    const hasPermission = result.recordset[0].has_permission > 0;

    res.json({ 
      hasPermission,
      userId,
      module,
      action
    });
  } catch (error) {
    console.error('Erreur vérification permission:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la vérification de la permission',
      message: error.message 
    });
  }
};

/**
 * Initialiser les permissions par défaut pour un rôle
 */
const initializeDefaultPermissions = async (req, res) => {
  try {
    const { roleId } = req.params;
    const pool = await getConnection();

    // Vérifier que le rôle existe
    const roleCheck = await pool.request()
      .input('role_id', sql.BigInt, roleId)
      .query('SELECT id, nom FROM Role WHERE id = @role_id');

    if (roleCheck.recordset.length === 0) {
      return res.status(404).json({ error: 'Rôle non trouvé' });
    }

    const roleName = roleCheck.recordset[0].nom;

    // Définir les permissions par défaut selon le rôle
    let defaultPermissions = [];

    switch (roleName) {
      case 'CLIENT':
        defaultPermissions = [
          { module: 'VEHICLES', action: 'CREATE' },
          { module: 'VEHICLES', action: 'READ' },
          { module: 'VEHICLES', action: 'UPDATE' },
          { module: 'APPOINTMENTS', action: 'CREATE' },
          { module: 'APPOINTMENTS', action: 'READ' },
          { module: 'APPOINTMENTS', action: 'UPDATE' },
          { module: 'COMPLAINTS', action: 'CREATE' },
          { module: 'COMPLAINTS', action: 'READ' },
          { module: 'DOCUMENTS', action: 'READ' },
          { module: 'CATALOG', action: 'READ' },
          { module: 'PROMOTIONS', action: 'READ' }
        ];
        break;

      case 'AGENT':
        defaultPermissions = [
          { module: 'VEHICLES', action: 'READ' },
          { module: 'VEHICLES', action: 'VALIDATE' },
          { module: 'APPOINTMENTS', action: 'READ' },
          { module: 'APPOINTMENTS', action: 'UPDATE' },
          { module: 'APPOINTMENTS', action: 'VALIDATE' },
          { module: 'INTERVENTIONS', action: 'CREATE' },
          { module: 'INTERVENTIONS', action: 'READ' },
          { module: 'INTERVENTIONS', action: 'UPDATE' },
          { module: 'COMPLAINTS', action: 'READ' },
          { module: 'COMPLAINTS', action: 'UPDATE' },
          { module: 'DOCUMENTS', action: 'CREATE' },
          { module: 'DOCUMENTS', action: 'READ' },
          { module: 'CATALOG', action: 'READ' },
          { module: 'REPORTS', action: 'READ' }
        ];
        break;

      case 'ADMIN':
        defaultPermissions = [
          { module: 'USERS', action: 'CREATE' },
          { module: 'USERS', action: 'READ' },
          { module: 'USERS', action: 'UPDATE' },
          { module: 'USERS', action: 'DELETE' },
          { module: 'VEHICLES', action: 'READ' },
          { module: 'VEHICLES', action: 'VALIDATE' },
          { module: 'APPOINTMENTS', action: 'READ' },
          { module: 'APPOINTMENTS', action: 'UPDATE' },
          { module: 'APPOINTMENTS', action: 'DELETE' },
          { module: 'INTERVENTIONS', action: 'CREATE' },
          { module: 'INTERVENTIONS', action: 'READ' },
          { module: 'INTERVENTIONS', action: 'UPDATE' },
          { module: 'INTERVENTIONS', action: 'DELETE' },
          { module: 'COMPLAINTS', action: 'READ' },
          { module: 'COMPLAINTS', action: 'UPDATE' },
          { module: 'CATALOG', action: 'CREATE' },
          { module: 'CATALOG', action: 'READ' },
          { module: 'CATALOG', action: 'UPDATE' },
          { module: 'CATALOG', action: 'DELETE' },
          { module: 'PACKAGES', action: 'CREATE' },
          { module: 'PACKAGES', action: 'READ' },
          { module: 'PACKAGES', action: 'UPDATE' },
          { module: 'PACKAGES', action: 'DELETE' },
          { module: 'PROMOTIONS', action: 'CREATE' },
          { module: 'PROMOTIONS', action: 'READ' },
          { module: 'PROMOTIONS', action: 'UPDATE' },
          { module: 'PROMOTIONS', action: 'DELETE' },
          { module: 'DOCUMENTS', action: 'CREATE' },
          { module: 'DOCUMENTS', action: 'READ' },
          { module: 'DOCUMENTS', action: 'UPDATE' },
          { module: 'DOCUMENTS', action: 'DELETE' },
          { module: 'NOTIFICATIONS', action: 'CREATE' },
          { module: 'NOTIFICATIONS', action: 'READ' },
          { module: 'REPORTS', action: 'READ' },
          { module: 'REPORTS', action: 'EXPORT' },
          { module: 'SETTINGS', action: 'READ' },
          { module: 'SETTINGS', action: 'UPDATE' },
          { module: 'PERMISSIONS', action: 'CREATE' },
          { module: 'PERMISSIONS', action: 'READ' },
          { module: 'PERMISSIONS', action: 'UPDATE' },
          { module: 'PERMISSIONS', action: 'DELETE' },
          { module: 'AGENCIES', action: 'CREATE' },
          { module: 'AGENCIES', action: 'READ' },
          { module: 'AGENCIES', action: 'UPDATE' },
          { module: 'AGENCIES', action: 'DELETE' },
          { module: 'TIMESLOTS', action: 'CREATE' },
          { module: 'TIMESLOTS', action: 'READ' },
          { module: 'TIMESLOTS', action: 'UPDATE' },
          { module: 'TIMESLOTS', action: 'DELETE' }
        ];
        break;

      case 'DIRECTION':
        defaultPermissions = [
          { module: 'USERS', action: 'READ' },
          { module: 'VEHICLES', action: 'READ' },
          { module: 'APPOINTMENTS', action: 'READ' },
          { module: 'INTERVENTIONS', action: 'READ' },
          { module: 'COMPLAINTS', action: 'READ' },
          { module: 'CATALOG', action: 'READ' },
          { module: 'PACKAGES', action: 'READ' },
          { module: 'PROMOTIONS', action: 'READ' },
          { module: 'DOCUMENTS', action: 'READ' },
          { module: 'REPORTS', action: 'READ' },
          { module: 'REPORTS', action: 'EXPORT' },
          { module: 'AGENCIES', action: 'READ' }
        ];
        break;

      default:
        return res.status(400).json({ error: 'Rôle non reconnu' });
    }

    // Insérer les permissions
    let created = 0;
    let skipped = 0;

    for (const perm of defaultPermissions) {
      try {
        // Vérifier si existe déjà
        const exists = await pool.request()
          .input('role_id', sql.BigInt, roleId)
          .input('module', sql.NVarChar(50), perm.module)
          .input('action', sql.NVarChar(20), perm.action)
          .query(`
            SELECT id FROM Permission 
            WHERE role_id = @role_id 
              AND module = @module 
              AND action = @action
          `);

        if (exists.recordset.length === 0) {
          await pool.request()
            .input('role_id', sql.BigInt, roleId)
            .input('module', sql.NVarChar(50), perm.module)
            .input('action', sql.NVarChar(20), perm.action)
            .query(`
              INSERT INTO Permission (role_id, module, action, actif)
              VALUES (@role_id, @module, @action, 1)
            `);
          created++;
        } else {
          skipped++;
        }
      } catch (err) {
        console.error(`Erreur création permission ${perm.module}.${perm.action}:`, err);
      }
    }

    res.json({
      message: 'Permissions par défaut initialisées',
      role: roleName,
      created,
      skipped,
      total: defaultPermissions.length
    });
  } catch (error) {
    console.error('Erreur initialisation permissions:', error);
    res.status(500).json({ 
      error: 'Erreur lors de l\'initialisation des permissions',
      message: error.message 
    });
  }
};

module.exports = {
  getPermissions,
  getPermissionsByRole,
  getModules,
  createPermission,
  updatePermission,
  deletePermission,
  checkPermission,
  initializeDefaultPermissions
};
