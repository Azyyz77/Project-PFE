const sql = require('mssql');
const { getConnection } = require('../config/database');

// Récupérer tous les problèmes prédéfinis
exports.getAllProblems = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .query(`
        SELECT * FROM ProblemesDiagnostic
        WHERE actif = 1
        ORDER BY categorie, nom
      `);
    
    res.json(result.recordset);
  } catch (error) {
    console.error('Erreur lors de la récupération des problèmes:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Récupérer les problèmes par catégorie
exports.getProblemsByCategory = async (req, res) => {
  try {
    const { categorie } = req.params;

    const pool = await getConnection();
    const result = await pool.request()
      .input('categorie', sql.NVarChar(50), categorie)
      .query(`
        SELECT * FROM ProblemesDiagnostic
        WHERE categorie = @categorie AND actif = 1
        ORDER BY nom
      `);
    
    res.json(result.recordset);
  } catch (error) {
    console.error('Erreur lors de la récupération des problèmes:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Créer un problème prédéfini
exports.createProblem = async (req, res) => {
  try {
    const { nom, description, solution, categorie } = req.body;
    
    if (!nom || !categorie) {
      return res.status(400).json({ message: 'Nom et catégorie sont requis' });
    }

    const pool = await getConnection();
    const result = await pool.request()
      .input('nom', sql.NVarChar(150), nom)
      .input('description', sql.NVarChar(sql.MAX), description || null)
      .input('solution', sql.NVarChar(sql.MAX), solution || null)
      .input('categorie', sql.NVarChar(50), categorie)
      .query(`
        INSERT INTO ProblemesDiagnostic (nom, description, solution, categorie, actif)
        VALUES (@nom, @description, @solution, @categorie, 1);
        SELECT SCOPE_IDENTITY() AS id;
      `);

    res.status(201).json({
      message: 'Problème créé avec succès',
      id: result.recordset[0].id
    });
  } catch (error) {
    console.error('Erreur lors de la création du problème:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Mettre à jour un problème
exports.updateProblem = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, description, solution, categorie, actif } = req.body;

    const pool = await getConnection();
    await pool.request()
      .input('id', sql.BigInt, id)
      .input('nom', sql.NVarChar(150), nom)
      .input('description', sql.NVarChar(sql.MAX), description || null)
      .input('solution', sql.NVarChar(sql.MAX), solution || null)
      .input('categorie', sql.NVarChar(50), categorie)
      .input('actif', sql.Bit, actif !== undefined ? actif : true)
      .query(`
        UPDATE ProblemesDiagnostic
        SET nom = @nom, description = @description, solution = @solution,
            categorie = @categorie, actif = @actif
        WHERE id = @id
      `);

    res.json({ message: 'Problème mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du problème:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Supprimer un problème
exports.deleteProblem = async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await getConnection();
    await pool.request()
      .input('id', sql.BigInt, id)
      .query('DELETE FROM ProblemesDiagnostic WHERE id = @id');

    res.json({ message: 'Problème supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du problème:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Rechercher des problèmes
exports.searchProblems = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: 'Requête de recherche requise' });
    }

    const pool = await getConnection();
    const result = await pool.request()
      .input('query', sql.NVarChar(sql.MAX), `%${query}%`)
      .query(`
        SELECT * FROM ProblemesDiagnostic
        WHERE (nom LIKE @query OR description LIKE @query OR solution LIKE @query)
          AND actif = 1
        ORDER BY categorie, nom
      `);
    
    res.json(result.recordset);
  } catch (error) {
    console.error('Erreur lors de la recherche de problèmes:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
