const { getConnection, sql } = require('../config/database');

/**
 * Créer un diagnostic pour un RDV
 */
const createDiagnostic = async (req, res) => {
  try {
    const { rdv_id, observations_generales, recommandations, problemes } = req.body;
    const agent_id = req.user.id;

    if (!rdv_id) {
      return res.status(400).json({
        error: 'Le RDV ID est requis'
      });
    }

    const pool = await getConnection();

    // Vérifier que le RDV existe
    const rdvCheck = await pool.request()
      .input('rdv_id', sql.BigInt, rdv_id)
      .query('SELECT id FROM RendezVous WHERE id = @rdv_id');

    if (rdvCheck.recordset.length === 0) {
      return res.status(404).json({ error: 'Rendez-vous non trouvé' });
    }

    // Vérifier qu'il n'existe pas déjà un diagnostic pour ce RDV
    const existingCheck = await pool.request()
      .input('rdv_id', sql.BigInt, rdv_id)
      .query('SELECT id FROM Diagnostic WHERE rdv_id = @rdv_id');

    if (existingCheck.recordset.length > 0) {
      return res.status(400).json({
        error: 'Un diagnostic existe déjà pour ce rendez-vous',
        diagnostic_id: existingCheck.recordset[0].id
      });
    }

    // Créer le diagnostic
    const diagnosticResult = await pool.request()
      .input('rdv_id', sql.BigInt, rdv_id)
      .input('agent_id', sql.BigInt, agent_id)
      .input('observations_generales', sql.NVarChar(sql.MAX), observations_generales || null)
      .input('recommandations', sql.NVarChar(sql.MAX), recommandations || null)
      .query(`
        INSERT INTO Diagnostic (rdv_id, agent_id, observations_generales, recommandations, date_creation)
        OUTPUT INSERTED.*
        VALUES (@rdv_id, @agent_id, @observations_generales, @recommandations, GETDATE())
      `);

    const diagnostic = diagnosticResult.recordset[0];

    // Ajouter les problèmes si fournis
    if (problemes && Array.isArray(problemes) && problemes.length > 0) {
      for (const probleme of problemes) {
        await pool.request()
          .input('diagnostic_id', sql.BigInt, diagnostic.id)
          .input('probleme_id', sql.BigInt, probleme.probleme_id)
          .input('description_specifique', sql.NVarChar(sql.MAX), probleme.description_specifique || null)
          .input('gravite', sql.NVarChar(20), probleme.gravite || null)
          .query(`
            INSERT INTO ProblemesDiagnostic (diagnostic_id, probleme_id, description_specifique, gravite, date_ajout)
            VALUES (@diagnostic_id, @probleme_id, @description_specifique, @gravite, GETDATE())
          `);
      }
    }

    // Récupérer le diagnostic complet avec les problèmes
    const fullDiagnostic = await getDiagnosticWithProblems(pool, diagnostic.id);

    res.status(201).json({
      message: 'Diagnostic créé avec succès',
      diagnostic: fullDiagnostic
    });
  } catch (error) {
    console.error('Erreur création diagnostic:', error);
    res.status(500).json({
      error: 'Erreur lors de la création du diagnostic',
      message: error.message
    });
  }
};

/**
 * Obtenir un diagnostic par RDV ID
 */
const getDiagnosticByRDV = async (req, res) => {
  try {
    const { rdvId } = req.params;
    const pool = await getConnection();

    const result = await pool.request()
      .input('rdv_id', sql.BigInt, rdvId)
      .query('SELECT id FROM Diagnostic WHERE rdv_id = @rdv_id');

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Aucun diagnostic trouvé pour ce rendez-vous' });
    }

    const diagnostic = await getDiagnosticWithProblems(pool, result.recordset[0].id);

    res.json(diagnostic);
  } catch (error) {
    console.error('Erreur récupération diagnostic:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération du diagnostic',
      message: error.message
    });
  }
};

/**
 * Obtenir tous les diagnostics (avec filtres)
 */
const getAllDiagnostics = async (req, res) => {
  try {
    const { agent_id, date_debut, date_fin } = req.query;
    const pool = await getConnection();

    let query = `
      SELECT 
        d.id,
        d.rdv_id,
        d.agent_id,
        d.observations_generales,
        d.recommandations,
        d.date_creation,
        d.date_modification,
        a.nom + ' ' + a.prenom AS agent_nom,
        r.date_heure,
        r.statut AS rdv_statut,
        c.nom + ' ' + c.prenom AS client_nom,
        v.immatriculation,
        m.nom AS marque,
        mo.nom AS modele
      FROM Diagnostic d
      JOIN Utilisateur a ON a.id = d.agent_id
      JOIN RendezVous r ON r.id = d.rdv_id
      JOIN Utilisateur c ON c.id = r.client_id
      LEFT JOIN Vehicule v ON v.id = r.vehicule_id
      LEFT JOIN Version ve ON ve.id = v.version_id
      LEFT JOIN Modele mo ON mo.id = ve.modele_id
      LEFT JOIN Marque m ON m.id = mo.marque_id
      WHERE 1=1
    `;

    const request = pool.request();

    if (agent_id) {
      query += ` AND d.agent_id = @agent_id`;
      request.input('agent_id', sql.BigInt, agent_id);
    }

    if (date_debut) {
      query += ` AND d.date_creation >= @date_debut`;
      request.input('date_debut', sql.DateTime2, date_debut);
    }

    if (date_fin) {
      query += ` AND d.date_creation <= @date_fin`;
      request.input('date_fin', sql.DateTime2, date_fin);
    }

    query += ` ORDER BY d.date_creation DESC`;

    const result = await request.query(query);

    res.json({
      count: result.recordset.length,
      diagnostics: result.recordset
    });
  } catch (error) {
    console.error('Erreur récupération diagnostics:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des diagnostics',
      message: error.message
    });
  }
};

/**
 * Mettre à jour un diagnostic
 */
const updateDiagnostic = async (req, res) => {
  try {
    const { id } = req.params;
    const { observations_generales, recommandations } = req.body;

    const pool = await getConnection();

    // Vérifier que le diagnostic existe
    const checkResult = await pool.request()
      .input('id', sql.BigInt, id)
      .query('SELECT id FROM Diagnostic WHERE id = @id');

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Diagnostic non trouvé' });
    }

    const request = pool.request().input('id', sql.BigInt, id);
    const updates = [];

    if (observations_generales !== undefined) {
      updates.push('observations_generales = @observations_generales');
      request.input('observations_generales', sql.NVarChar(sql.MAX), observations_generales);
    }

    if (recommandations !== undefined) {
      updates.push('recommandations = @recommandations');
      request.input('recommandations', sql.NVarChar(sql.MAX), recommandations);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Aucune modification fournie' });
    }

    updates.push('date_modification = GETDATE()');

    await request.query(`
      UPDATE Diagnostic
      SET ${updates.join(', ')}
      WHERE id = @id
    `);

    const diagnostic = await getDiagnosticWithProblems(pool, id);

    res.json({
      message: 'Diagnostic mis à jour avec succès',
      diagnostic
    });
  } catch (error) {
    console.error('Erreur mise à jour diagnostic:', error);
    res.status(500).json({
      error: 'Erreur lors de la mise à jour du diagnostic',
      message: error.message
    });
  }
};

/**
 * Ajouter un problème à un diagnostic
 */
const addProbleme = async (req, res) => {
  try {
    const { id } = req.params;
    const { probleme_id, description_specifique, gravite } = req.body;

    if (!probleme_id) {
      return res.status(400).json({ error: 'Le problème ID est requis' });
    }

    const pool = await getConnection();

    // Vérifier que le diagnostic existe
    const diagnosticCheck = await pool.request()
      .input('id', sql.BigInt, id)
      .query('SELECT id FROM Diagnostic WHERE id = @id');

    if (diagnosticCheck.recordset.length === 0) {
      return res.status(404).json({ error: 'Diagnostic non trouvé' });
    }

    // Vérifier que le problème existe
    const problemeCheck = await pool.request()
      .input('probleme_id', sql.BigInt, probleme_id)
      .query('SELECT id FROM ProblemePredefini WHERE id = @probleme_id');

    if (problemeCheck.recordset.length === 0) {
      return res.status(404).json({ error: 'Problème non trouvé' });
    }

    // Vérifier que le problème n'est pas déjà ajouté
    const existingCheck = await pool.request()
      .input('diagnostic_id', sql.BigInt, id)
      .input('probleme_id', sql.BigInt, probleme_id)
      .query('SELECT id FROM ProblemesDiagnostic WHERE diagnostic_id = @diagnostic_id AND probleme_id = @probleme_id');

    if (existingCheck.recordset.length > 0) {
      return res.status(400).json({ error: 'Ce problème est déjà ajouté au diagnostic' });
    }

    // Ajouter le problème
    await pool.request()
      .input('diagnostic_id', sql.BigInt, id)
      .input('probleme_id', sql.BigInt, probleme_id)
      .input('description_specifique', sql.NVarChar(sql.MAX), description_specifique || null)
      .input('gravite', sql.NVarChar(20), gravite || null)
      .query(`
        INSERT INTO ProblemesDiagnostic (diagnostic_id, probleme_id, description_specifique, gravite, date_ajout)
        VALUES (@diagnostic_id, @probleme_id, @description_specifique, @gravite, GETDATE())
      `);

    // Mettre à jour la date de modification du diagnostic
    await pool.request()
      .input('id', sql.BigInt, id)
      .query('UPDATE Diagnostic SET date_modification = GETDATE() WHERE id = @id');

    const diagnostic = await getDiagnosticWithProblems(pool, id);

    res.json({
      message: 'Problème ajouté avec succès',
      diagnostic
    });
  } catch (error) {
    console.error('Erreur ajout problème:', error);
    res.status(500).json({
      error: 'Erreur lors de l\'ajout du problème',
      message: error.message
    });
  }
};

/**
 * Retirer un problème d'un diagnostic
 */
const removeProbleme = async (req, res) => {
  try {
    const { id, problemeId } = req.params;
    const pool = await getConnection();

    // Vérifier que le problème existe dans le diagnostic
    const checkResult = await pool.request()
      .input('diagnostic_id', sql.BigInt, id)
      .input('probleme_id', sql.BigInt, problemeId)
      .query('SELECT id FROM ProblemesDiagnostic WHERE diagnostic_id = @diagnostic_id AND probleme_id = @probleme_id');

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Problème non trouvé dans ce diagnostic' });
    }

    // Supprimer le problème
    await pool.request()
      .input('diagnostic_id', sql.BigInt, id)
      .input('probleme_id', sql.BigInt, problemeId)
      .query('DELETE FROM ProblemesDiagnostic WHERE diagnostic_id = @diagnostic_id AND probleme_id = @probleme_id');

    // Mettre à jour la date de modification du diagnostic
    await pool.request()
      .input('id', sql.BigInt, id)
      .query('UPDATE Diagnostic SET date_modification = GETDATE() WHERE id = @id');

    const diagnostic = await getDiagnosticWithProblems(pool, id);

    res.json({
      message: 'Problème retiré avec succès',
      diagnostic
    });
  } catch (error) {
    console.error('Erreur retrait problème:', error);
    res.status(500).json({
      error: 'Erreur lors du retrait du problème',
      message: error.message
    });
  }
};

/**
 * Fonction helper pour récupérer un diagnostic avec ses problèmes
 */
async function getDiagnosticWithProblems(pool, diagnosticId) {
  // Récupérer le diagnostic
  const diagnosticResult = await pool.request()
    .input('id', sql.BigInt, diagnosticId)
    .query(`
      SELECT 
        d.*,
        a.nom + ' ' + a.prenom AS agent_nom,
        r.date_heure,
        r.statut AS rdv_statut,
        c.nom + ' ' + c.prenom AS client_nom,
        v.immatriculation,
        m.nom AS marque,
        mo.nom AS modele
      FROM Diagnostic d
      JOIN Utilisateur a ON a.id = d.agent_id
      JOIN RendezVous r ON r.id = d.rdv_id
      JOIN Utilisateur c ON c.id = r.client_id
      LEFT JOIN Vehicule v ON v.id = r.vehicule_id
      LEFT JOIN Version ve ON ve.id = v.version_id
      LEFT JOIN Modele mo ON mo.id = ve.modele_id
      LEFT JOIN Marque m ON m.id = mo.marque_id
      WHERE d.id = @id
    `);

  const diagnostic = diagnosticResult.recordset[0];

  // Récupérer les problèmes
  const problemesResult = await pool.request()
    .input('diagnostic_id', sql.BigInt, diagnosticId)
    .query(`
      SELECT 
        pd.id,
        pd.probleme_id,
        pd.description_specifique,
        pd.gravite,
        pd.date_ajout,
        pp.nom AS probleme_nom,
        pp.description AS probleme_description,
        pp.solution AS probleme_solution,
        pp.categorie AS probleme_categorie
      FROM ProblemesDiagnostic pd
      JOIN ProblemePredefini pp ON pp.id = pd.probleme_id
      WHERE pd.diagnostic_id = @diagnostic_id
      ORDER BY pd.date_ajout
    `);

  diagnostic.problemes = problemesResult.recordset;

  return diagnostic;
}

module.exports = {
  createDiagnostic,
  getDiagnosticByRDV,
  getAllDiagnostics,
  updateDiagnostic,
  addProbleme,
  removeProbleme
};
