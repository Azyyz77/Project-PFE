const { getConnection, sql } = require('../config/database');

/**
 * Mapping des types de statuts vers les noms de tables
 */
const STATUS_TABLES = {
  rdv: 'StatutRDV',
  intervention: 'StatutIntervention',
  reclamation: 'StatutReclamation'
};

/**
 * Obtenir tous les statuts d'un type donné
 */
const getStatuses = async (req, res) => {
  try {
    const { type } = req.params;

    // Valider le type
    if (!STATUS_TABLES[type]) {
      return res.status(400).json({
        error: 'Type de statut invalide',
        validTypes: Object.keys(STATUS_TABLES)
      });
    }

    const tableName = STATUS_TABLES[type];
    const pool = await getConnection();

    const result = await pool.request().query(`
      SELECT code, libelle
      FROM ${tableName}
      ORDER BY libelle
    `);

    res.json({
      type,
      count: result.recordset.length,
      statuses: result.recordset
    });
  } catch (error) {
    console.error(`Erreur récupération statuts ${req.params.type}:`, error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des statuts',
      message: error.message
    });
  }
};

/**
 * Obtenir tous les statuts de tous les types
 */
const getAllStatuses = async (req, res) => {
  try {
    const pool = await getConnection();
    const allStatuses = {};

    for (const [type, tableName] of Object.entries(STATUS_TABLES)) {
      const result = await pool.request().query(`
        SELECT code, libelle
        FROM ${tableName}
        ORDER BY libelle
      `);
      allStatuses[type] = result.recordset;
    }

    res.json({
      rdv: allStatuses.rdv,
      intervention: allStatuses.intervention,
      reclamation: allStatuses.reclamation
    });
  } catch (error) {
    console.error('Erreur récupération tous les statuts:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des statuts',
      message: error.message
    });
  }
};

/**
 * Créer un nouveau statut
 */
const createStatus = async (req, res) => {
  try {
    const { type } = req.params;
    const { code, libelle } = req.body;

    // Valider le type
    if (!STATUS_TABLES[type]) {
      return res.status(400).json({
        error: 'Type de statut invalide',
        validTypes: Object.keys(STATUS_TABLES)
      });
    }

    // Valider les champs requis
    if (!code || !libelle) {
      return res.status(400).json({
        error: 'Champs requis manquants',
        required: ['code', 'libelle']
      });
    }

    // Valider le format du code (majuscules, underscores uniquement)
    if (!/^[A-Z_]+$/.test(code)) {
      return res.status(400).json({
        error: 'Format de code invalide',
        message: 'Le code doit contenir uniquement des majuscules et underscores (ex: EN_COURS)'
      });
    }

    const tableName = STATUS_TABLES[type];
    const pool = await getConnection();

    // Vérifier si le code existe déjà
    const existingCheck = await pool.request()
      .input('code', sql.VarChar(20), code)
      .query(`SELECT code FROM ${tableName} WHERE code = @code`);

    if (existingCheck.recordset.length > 0) {
      return res.status(409).json({
        error: 'Ce code de statut existe déjà',
        code
      });
    }

    // Créer le statut
    await pool.request()
      .input('code', sql.VarChar(20), code)
      .input('libelle', sql.NVarChar(50), libelle)
      .query(`
        INSERT INTO ${tableName} (code, libelle)
        VALUES (@code, @libelle)
      `);

    res.status(201).json({
      message: 'Statut créé avec succès',
      status: { code, libelle }
    });
  } catch (error) {
    console.error(`Erreur création statut ${req.params.type}:`, error);
    res.status(500).json({
      error: 'Erreur lors de la création du statut',
      message: error.message
    });
  }
};

/**
 * Mettre à jour un statut
 */
const updateStatus = async (req, res) => {
  try {
    const { type, code } = req.params;
    const { libelle } = req.body;

    // Valider le type
    if (!STATUS_TABLES[type]) {
      return res.status(400).json({
        error: 'Type de statut invalide',
        validTypes: Object.keys(STATUS_TABLES)
      });
    }

    // Valider le libellé
    if (!libelle) {
      return res.status(400).json({
        error: 'Le libellé est requis'
      });
    }

    const tableName = STATUS_TABLES[type];
    const pool = await getConnection();

    // Vérifier que le statut existe
    const existingCheck = await pool.request()
      .input('code', sql.VarChar(20), code)
      .query(`SELECT code FROM ${tableName} WHERE code = @code`);

    if (existingCheck.recordset.length === 0) {
      return res.status(404).json({
        error: 'Statut non trouvé',
        code
      });
    }

    // Mettre à jour
    await pool.request()
      .input('code', sql.VarChar(20), code)
      .input('libelle', sql.NVarChar(50), libelle)
      .query(`
        UPDATE ${tableName}
        SET libelle = @libelle
        WHERE code = @code
      `);

    res.json({
      message: 'Statut mis à jour avec succès',
      status: { code, libelle }
    });
  } catch (error) {
    console.error(`Erreur mise à jour statut ${req.params.type}:`, error);
    res.status(500).json({
      error: 'Erreur lors de la mise à jour du statut',
      message: error.message
    });
  }
};

/**
 * Supprimer un statut
 */
const deleteStatus = async (req, res) => {
  try {
    const { type, code } = req.params;

    // Valider le type
    if (!STATUS_TABLES[type]) {
      return res.status(400).json({
        error: 'Type de statut invalide',
        validTypes: Object.keys(STATUS_TABLES)
      });
    }

    const tableName = STATUS_TABLES[type];
    const pool = await getConnection();

    // Vérifier que le statut existe
    const existingCheck = await pool.request()
      .input('code', sql.VarChar(20), code)
      .query(`SELECT code FROM ${tableName} WHERE code = @code`);

    if (existingCheck.recordset.length === 0) {
      return res.status(404).json({
        error: 'Statut non trouvé',
        code
      });
    }

    // Vérifier si le statut est utilisé
    let usageCheck;
    if (type === 'rdv') {
      usageCheck = await pool.request()
        .input('code', sql.VarChar(20), code)
        .query('SELECT COUNT(*) as count FROM RendezVous WHERE statut = @code');
    } else if (type === 'intervention') {
      usageCheck = await pool.request()
        .input('code', sql.VarChar(20), code)
        .query('SELECT COUNT(*) as count FROM InterventionRDV WHERE statut = @code');
    } else if (type === 'reclamation') {
      usageCheck = await pool.request()
        .input('code', sql.VarChar(20), code)
        .query('SELECT COUNT(*) as count FROM Reclamation WHERE statut = @code');
    }

    if (usageCheck.recordset[0].count > 0) {
      return res.status(409).json({
        error: 'Impossible de supprimer ce statut',
        message: `Ce statut est utilisé par ${usageCheck.recordset[0].count} enregistrement(s)`,
        usageCount: usageCheck.recordset[0].count
      });
    }

    // Supprimer
    await pool.request()
      .input('code', sql.VarChar(20), code)
      .query(`DELETE FROM ${tableName} WHERE code = @code`);

    res.json({
      message: 'Statut supprimé avec succès',
      code
    });
  } catch (error) {
    console.error(`Erreur suppression statut ${req.params.type}:`, error);
    res.status(500).json({
      error: 'Erreur lors de la suppression du statut',
      message: error.message
    });
  }
};

/**
 * Obtenir les statistiques d'utilisation des statuts
 */
const getStatusUsageStats = async (req, res) => {
  try {
    const { type } = req.params;

    // Valider le type
    if (!STATUS_TABLES[type]) {
      return res.status(400).json({
        error: 'Type de statut invalide',
        validTypes: Object.keys(STATUS_TABLES)
      });
    }

    const pool = await getConnection();
    let stats;

    if (type === 'rdv') {
      stats = await pool.request().query(`
        SELECT 
          s.code,
          s.libelle,
          COUNT(r.id) as usage_count,
          CAST(COUNT(r.id) * 100.0 / NULLIF((SELECT COUNT(*) FROM RendezVous), 0) AS DECIMAL(5,2)) as percentage
        FROM StatutRDV s
        LEFT JOIN RendezVous r ON r.statut = s.code
        GROUP BY s.code, s.libelle
        ORDER BY usage_count DESC
      `);
    } else if (type === 'intervention') {
      stats = await pool.request().query(`
        SELECT 
          s.code,
          s.libelle,
          COUNT(i.id) as usage_count,
          CAST(COUNT(i.id) * 100.0 / NULLIF((SELECT COUNT(*) FROM InterventionRDV), 0) AS DECIMAL(5,2)) as percentage
        FROM StatutIntervention s
        LEFT JOIN InterventionRDV i ON i.statut = s.code
        GROUP BY s.code, s.libelle
        ORDER BY usage_count DESC
      `);
    } else if (type === 'reclamation') {
      stats = await pool.request().query(`
        SELECT 
          s.code,
          s.libelle,
          COUNT(r.id) as usage_count,
          CAST(COUNT(r.id) * 100.0 / NULLIF((SELECT COUNT(*) FROM Reclamation), 0) AS DECIMAL(5,2)) as percentage
        FROM StatutReclamation s
        LEFT JOIN Reclamation r ON r.statut = s.code
        GROUP BY s.code, s.libelle
        ORDER BY usage_count DESC
      `);
    }

    res.json({
      type,
      stats: stats.recordset
    });
  } catch (error) {
    console.error(`Erreur statistiques statuts ${req.params.type}:`, error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des statistiques',
      message: error.message
    });
  }
};

module.exports = {
  getStatuses,
  getAllStatuses,
  createStatus,
  updateStatus,
  deleteStatus,
  getStatusUsageStats
};
