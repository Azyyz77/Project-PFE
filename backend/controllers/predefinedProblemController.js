const { getConnection, sql } = require('../config/database');

/**
 * Obtenir tous les problèmes prédéfinis
 */
const getProblems = async (req, res) => {
  try {
    const { categorie, actif } = req.query;
    const pool = await getConnection();

    let query = `
      SELECT 
        id,
        nom,
        description,
        solution,
        categorie,
        actif,
        date_creation
      FROM ProblemePredefini
      WHERE 1=1
    `;

    const request = pool.request();

    if (categorie) {
      query += ` AND categorie = @categorie`;
      request.input('categorie', sql.NVarChar(50), categorie);
    }

    if (actif !== undefined) {
      query += ` AND actif = @actif`;
      request.input('actif', sql.Bit, actif === 'true' || actif === '1');
    }

    query += ` ORDER BY categorie, nom`;

    const result = await request.query(query);

    res.json({
      count: result.recordset.length,
      problems: result.recordset
    });
  } catch (error) {
    console.error('Erreur récupération problèmes:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des problèmes',
      message: error.message
    });
  }
};

/**
 * Obtenir les catégories de problèmes
 */
const getCategories = async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool.request().query(`
      SELECT 
        categorie,
        COUNT(*) as count
      FROM ProblemePredefini
      WHERE actif = 1
      GROUP BY categorie
      ORDER BY categorie
    `);

    res.json(result.recordset);
  } catch (error) {
    console.error('Erreur récupération catégories:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des catégories',
      message: error.message
    });
  }
};

/**
 * Obtenir un problème par ID
 */
const getProblemById = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getConnection();

    const result = await pool.request()
      .input('id', sql.BigInt, id)
      .query(`
        SELECT 
          id,
          nom,
          description,
          solution,
          categorie,
          actif,
          date_creation
        FROM ProblemePredefini
        WHERE id = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Problème non trouvé' });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Erreur récupération problème:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération du problème',
      message: error.message
    });
  }
};

/**
 * Créer un nouveau problème
 */
const createProblem = async (req, res) => {
  try {
    const { nom, description, solution, categorie } = req.body;

    if (!nom || !categorie) {
      return res.status(400).json({
        error: 'Champs requis manquants',
        required: ['nom', 'categorie']
      });
    }

    const pool = await getConnection();

    const result = await pool.request()
      .input('nom', sql.NVarChar(150), nom)
      .input('description', sql.NVarChar(sql.MAX), description || null)
      .input('solution', sql.NVarChar(sql.MAX), solution || null)
      .input('categorie', sql.NVarChar(50), categorie)
      .query(`
        INSERT INTO ProblemePredefini (nom, description, solution, categorie, actif, date_creation)
        OUTPUT INSERTED.*
        VALUES (@nom, @description, @solution, @categorie, 1, GETDATE())
      `);

    res.status(201).json({
      message: 'Problème créé avec succès',
      problem: result.recordset[0]
    });
  } catch (error) {
    console.error('Erreur création problème:', error);
    res.status(500).json({
      error: 'Erreur lors de la création du problème',
      message: error.message
    });
  }
};

/**
 * Mettre à jour un problème
 */
const updateProblem = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, description, solution, categorie, actif } = req.body;

    const pool = await getConnection();

    // Vérifier que le problème existe
    const checkResult = await pool.request()
      .input('id', sql.BigInt, id)
      .query('SELECT id FROM ProblemePredefini WHERE id = @id');

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Problème non trouvé' });
    }

    const request = pool.request().input('id', sql.BigInt, id);
    const updates = [];

    if (nom !== undefined) {
      updates.push('nom = @nom');
      request.input('nom', sql.NVarChar(150), nom);
    }
    if (description !== undefined) {
      updates.push('description = @description');
      request.input('description', sql.NVarChar(sql.MAX), description);
    }
    if (solution !== undefined) {
      updates.push('solution = @solution');
      request.input('solution', sql.NVarChar(sql.MAX), solution);
    }
    if (categorie !== undefined) {
      updates.push('categorie = @categorie');
      request.input('categorie', sql.NVarChar(50), categorie);
    }
    if (actif !== undefined) {
      updates.push('actif = @actif');
      request.input('actif', sql.Bit, actif);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Aucune modification fournie' });
    }

    const result = await request.query(`
      UPDATE ProblemePredefini
      SET ${updates.join(', ')}
      OUTPUT INSERTED.*
      WHERE id = @id
    `);

    res.json({
      message: 'Problème mis à jour avec succès',
      problem: result.recordset[0]
    });
  } catch (error) {
    console.error('Erreur mise à jour problème:', error);
    res.status(500).json({
      error: 'Erreur lors de la mise à jour du problème',
      message: error.message
    });
  }
};

/**
 * Supprimer un problème (soft delete)
 */
const deleteProblem = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getConnection();

    // Vérifier que le problème existe
    const checkResult = await pool.request()
      .input('id', sql.BigInt, id)
      .query('SELECT id FROM ProblemePredefini WHERE id = @id');

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Problème non trouvé' });
    }

    // Soft delete (désactiver au lieu de supprimer)
    await pool.request()
      .input('id', sql.BigInt, id)
      .query('UPDATE ProblemePredefini SET actif = 0 WHERE id = @id');

    res.json({ message: 'Problème désactivé avec succès' });
  } catch (error) {
    console.error('Erreur suppression problème:', error);
    res.status(500).json({
      error: 'Erreur lors de la suppression du problème',
      message: error.message
    });
  }
};

/**
 * Obtenir les statistiques d'utilisation des problèmes
 */
const getProblemStats = async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool.request().query(`
      SELECT 
        pp.id,
        pp.nom,
        pp.categorie,
        COUNT(pd.id) as utilisation_count
      FROM ProblemePredefini pp
      LEFT JOIN ProblemesDiagnostic pd ON pd.probleme_id = pp.id
      WHERE pp.actif = 1
      GROUP BY pp.id, pp.nom, pp.categorie
      ORDER BY utilisation_count DESC, pp.nom
    `);

    res.json(result.recordset);
  } catch (error) {
    console.error('Erreur statistiques problèmes:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des statistiques',
      message: error.message
    });
  }
};

module.exports = {
  getProblems,
  getCategories,
  getProblemById,
  createProblem,
  updateProblem,
  deleteProblem,
  getProblemStats
};
