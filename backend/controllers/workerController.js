/**
 * Contrôleur pour la gestion des ouvriers et affectations
 */

const { getConnection, sql } = require('../config/database');

/**
 * Obtenir tous les ouvriers d'une agence
 */
exports.getWorkersByAgency = async (req, res) => {
  try {
    const { agenceId } = req.params;
    const { actif, specialite } = req.query;

    const pool = await getConnection();
    let query = `
      SELECT 
        o.*,
        a.nom AS agence_nom,
        (SELECT COUNT(*) FROM AffectationOuvrier WHERE ouvrier_id = o.id AND statut = 'EN_COURS') AS affectations_en_cours
      FROM Ouvrier o
      INNER JOIN Agence a ON o.agence_id = a.id
      WHERE o.agence_id = @agenceId
    `;

    const request = pool.request().input('agenceId', sql.BigInt, agenceId);

    if (actif !== undefined) {
      query += ' AND o.actif = @actif';
      request.input('actif', sql.Bit, actif === 'true' ? 1 : 0);
    }

    if (specialite) {
      query += ' AND o.specialite = @specialite';
      request.input('specialite', sql.NVarChar, specialite);
    }

    query += ' ORDER BY o.nom, o.prenom';

    const result = await request.query(query);

    res.json({
      success: true,
      workers: result.recordset
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des ouvriers:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: error.message
    });
  }
};

/**
 * Obtenir tous les ouvriers (pour les admins)
 */
exports.getAllWorkers = async (req, res) => {
  try {
    const { actif, specialite, agence_id } = req.query;

    const pool = await getConnection();
    let query = `
      SELECT 
        o.*,
        a.nom AS agence_nom,
        (SELECT COUNT(*) FROM AffectationOuvrier WHERE ouvrier_id = o.id AND statut = 'EN_COURS') AS affectations_en_cours
      FROM Ouvrier o
      INNER JOIN Agence a ON o.agence_id = a.id
      WHERE 1=1
    `;

    const request = pool.request();

    if (actif !== undefined) {
      query += ' AND o.actif = @actif';
      request.input('actif', sql.Bit, actif === 'true' ? 1 : 0);
    }

    if (specialite) {
      query += ' AND o.specialite = @specialite';
      request.input('specialite', sql.NVarChar, specialite);
    }

    if (agence_id) {
      query += ' AND o.agence_id = @agence_id';
      request.input('agence_id', sql.BigInt, agence_id);
    }

    query += ' ORDER BY a.nom, o.nom, o.prenom';

    const result = await request.query(query);

    res.json({
      success: true,
      workers: result.recordset
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de tous les ouvriers:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: error.message
    });
  }
};

/**
 * Créer un nouvel ouvrier
 */
exports.createWorker = async (req, res) => {
  try {
    const {
      nom,
      prenom,
      telephone,
      email,
      specialite,
      niveau_competence,
      agence_id,
      date_embauche,
      notes
    } = req.body;

    // Validation
    if (!nom || !prenom || !agence_id) {
      return res.status(400).json({
        error: 'Données manquantes',
        message: 'Nom, prénom et agence sont requis'
      });
    }

    const pool = await getConnection();
    const result = await pool.request()
      .input('nom', sql.NVarChar, nom)
      .input('prenom', sql.NVarChar, prenom)
      .input('telephone', sql.NVarChar, telephone || null)
      .input('email', sql.NVarChar, email || null)
      .input('specialite', sql.NVarChar, specialite || null)
      .input('niveau_competence', sql.NVarChar, niveau_competence || 'Intermédiaire')
      .input('agence_id', sql.BigInt, agence_id)
      .input('date_embauche', sql.Date, date_embauche || null)
      .input('notes', sql.NVarChar, notes || null)
      .query(`
        INSERT INTO Ouvrier (
          nom, prenom, telephone, email, specialite, 
          niveau_competence, agence_id, date_embauche, notes
        )
        OUTPUT INSERTED.*
        VALUES (
          @nom, @prenom, @telephone, @email, @specialite,
          @niveau_competence, @agence_id, @date_embauche, @notes
        )
      `);

    res.status(201).json({
      success: true,
      message: 'Ouvrier créé avec succès',
      worker: result.recordset[0]
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'ouvrier:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: error.message
    });
  }
};

/**
 * Affecter un ouvrier à un rendez-vous
 */
exports.assignWorkerToAppointment = async (req, res) => {
  try {
    const {
      rendez_vous_id,
      ouvrier_id,
      priorite,
      temps_estime_minutes,
      notes_agent
    } = req.body;

    const agent_id = req.user.id;

    // Validation
    if (!rendez_vous_id || !ouvrier_id) {
      return res.status(400).json({
        error: 'Données manquantes',
        message: 'Rendez-vous et ouvrier sont requis'
      });
    }

    const pool = await getConnection();

    // Vérifier que le rendez-vous existe
    const rdvCheck = await pool.request()
      .input('rdv_id', sql.BigInt, rendez_vous_id)
      .query('SELECT id, statut FROM RendezVous WHERE id = @rdv_id');

    if (rdvCheck.recordset.length === 0) {
      return res.status(404).json({
        error: 'Rendez-vous introuvable'
      });
    }

    // Vérifier que l'ouvrier existe et est actif
    const workerCheck = await pool.request()
      .input('ouvrier_id', sql.BigInt, ouvrier_id)
      .query('SELECT id, nom, prenom, actif FROM Ouvrier WHERE id = @ouvrier_id');

    if (workerCheck.recordset.length === 0) {
      return res.status(404).json({
        error: 'Ouvrier introuvable'
      });
    }

    if (!workerCheck.recordset[0].actif) {
      return res.status(400).json({
        error: 'Ouvrier inactif',
        message: 'Cet ouvrier n\'est plus actif'
      });
    }

    // Créer l'affectation
    const result = await pool.request()
      .input('rendez_vous_id', sql.BigInt, rendez_vous_id)
      .input('ouvrier_id', sql.BigInt, ouvrier_id)
      .input('agent_id', sql.BigInt, agent_id)
      .input('priorite', sql.NVarChar, priorite || 'NORMALE')
      .input('temps_estime_minutes', sql.Int, temps_estime_minutes || null)
      .input('notes_agent', sql.NVarChar, notes_agent || null)
      .query(`
        INSERT INTO AffectationOuvrier (
          rendez_vous_id, ouvrier_id, agent_id, priorite,
          temps_estime_minutes, notes_agent
        )
        OUTPUT INSERTED.*
        VALUES (
          @rendez_vous_id, @ouvrier_id, @agent_id, @priorite,
          @temps_estime_minutes, @notes_agent
        )
      `);

    res.status(201).json({
      success: true,
      message: 'Ouvrier affecté avec succès',
      assignment: result.recordset[0]
    });
  } catch (error) {
    console.error('Erreur lors de l\'affectation:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: error.message
    });
  }
};

/**
 * Obtenir les affectations d'un ouvrier
 */
exports.getWorkerAssignments = async (req, res) => {
  try {
    const { ouvrierId } = req.params;
    const { statut, date_debut, date_fin } = req.query;

    const pool = await getConnection();
    let query = `
      SELECT * FROM VueAffectationsDetaillees
      WHERE ouvrier_id = @ouvrierId
    `;

    const request = pool.request().input('ouvrierId', sql.BigInt, ouvrierId);

    if (statut) {
      query += ' AND statut = @statut';
      request.input('statut', sql.NVarChar, statut);
    }

    if (date_debut) {
      query += ' AND date_affectation >= @date_debut';
      request.input('date_debut', sql.DateTime, date_debut);
    }

    if (date_fin) {
      query += ' AND date_affectation <= @date_fin';
      request.input('date_fin', sql.DateTime, date_fin);
    }

    query += ' ORDER BY date_affectation DESC';

    const result = await request.query(query);

    res.json({
      success: true,
      assignments: result.recordset
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des affectations:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: error.message
    });
  }
};

/**
 * Obtenir toutes les affectations d'une agence
 */
exports.getAgencyAssignments = async (req, res) => {
  try {
    const { agenceId } = req.params;
    const { statut, ouvrier_id } = req.query;

    const pool = await getConnection();
    let query = `
      SELECT * FROM VueAffectationsDetaillees
      WHERE agence_id = @agenceId
    `;

    const request = pool.request().input('agenceId', sql.BigInt, agenceId);

    if (statut) {
      query += ' AND statut = @statut';
      request.input('statut', sql.NVarChar, statut);
    }

    if (ouvrier_id) {
      query += ' AND ouvrier_id = @ouvrier_id';
      request.input('ouvrier_id', sql.BigInt, ouvrier_id);
    }

    query += ' ORDER BY date_affectation DESC';

    const result = await request.query(query);

    res.json({
      success: true,
      assignments: result.recordset
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des affectations de l\'agence:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: error.message
    });
  }
};

/**
 * Obtenir toutes les affectations (pour les admins)
 */
exports.getAllAssignments = async (req, res) => {
  try {
    const { statut, ouvrier_id, agence_id } = req.query;

    const pool = await getConnection();
    let query = `
      SELECT * FROM VueAffectationsDetaillees
      WHERE 1=1
    `;

    const request = pool.request();

    if (statut) {
      query += ' AND statut = @statut';
      request.input('statut', sql.NVarChar, statut);
    }

    if (ouvrier_id) {
      query += ' AND ouvrier_id = @ouvrier_id';
      request.input('ouvrier_id', sql.BigInt, ouvrier_id);
    }

    if (agence_id) {
      query += ' AND agence_id = @agence_id';
      request.input('agence_id', sql.BigInt, agence_id);
    }

    query += ' ORDER BY date_affectation DESC';

    const result = await request.query(query);

    res.json({
      success: true,
      assignments: result.recordset
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de toutes les affectations:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: error.message
    });
  }
};

/**
 * Mettre à jour le statut d'une affectation
 */
exports.updateAssignmentStatus = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { statut, notes_ouvrier, temps_reel_minutes, evaluation } = req.body;

    const pool = await getConnection();
    
    let query = 'UPDATE AffectationOuvrier SET updated_at = GETDATE()';
    const request = pool.request().input('assignmentId', sql.BigInt, assignmentId);

    if (statut) {
      query += ', statut = @statut';
      request.input('statut', sql.NVarChar, statut);

      // Si statut passe à EN_COURS, enregistrer date_debut
      if (statut === 'EN_COURS') {
        query += ', date_debut = GETDATE()';
      }

      // Si statut passe à TERMINE, enregistrer date_fin
      if (statut === 'TERMINE') {
        query += ', date_fin = GETDATE()';
      }
    }

    if (notes_ouvrier) {
      query += ', notes_ouvrier = @notes_ouvrier';
      request.input('notes_ouvrier', sql.NVarChar, notes_ouvrier);
    }

    if (temps_reel_minutes) {
      query += ', temps_reel_minutes = @temps_reel_minutes';
      request.input('temps_reel_minutes', sql.Int, temps_reel_minutes);
    }

    if (evaluation) {
      query += ', evaluation = @evaluation';
      request.input('evaluation', sql.Int, evaluation);
    }

    query += ' OUTPUT INSERTED.* WHERE id = @assignmentId';

    const result = await request.query(query);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        error: 'Affectation introuvable'
      });
    }

    res.json({
      success: true,
      message: 'Affectation mise à jour',
      assignment: result.recordset[0]
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: error.message
    });
  }
};

/**
 * Obtenir les statistiques des ouvriers
 */
exports.getWorkerStatistics = async (req, res) => {
  try {
    const { agenceId } = req.params;

    const pool = await getConnection();
    const result = await pool.request()
      .input('agenceId', sql.BigInt, agenceId)
      .query(`
        SELECT 
          o.id,
          o.nom,
          o.prenom,
          o.specialite,
          COUNT(a.id) AS total_affectations,
          SUM(CASE WHEN a.statut = 'TERMINE' THEN 1 ELSE 0 END) AS affectations_terminees,
          SUM(CASE WHEN a.statut = 'EN_COURS' THEN 1 ELSE 0 END) AS affectations_en_cours,
          AVG(CASE WHEN a.evaluation IS NOT NULL THEN a.evaluation ELSE NULL END) AS evaluation_moyenne,
          AVG(CASE WHEN a.temps_reel_minutes IS NOT NULL THEN a.temps_reel_minutes ELSE NULL END) AS temps_moyen_minutes
        FROM Ouvrier o
        LEFT JOIN AffectationOuvrier a ON o.id = a.ouvrier_id
        WHERE o.agence_id = @agenceId AND o.actif = 1
        GROUP BY o.id, o.nom, o.prenom, o.specialite
        ORDER BY total_affectations DESC
      `);

    res.json({
      success: true,
      statistics: result.recordset
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: error.message
    });
  }
};

/**
 * Obtenir les ouvriers disponibles pour une date/heure
 */
exports.getAvailableWorkers = async (req, res) => {
  try {
    const { agenceId } = req.params;
    const { date, heure } = req.query;

    if (!date || !heure) {
      return res.status(400).json({
        error: 'Date et heure requises'
      });
    }

    const pool = await getConnection();
    const result = await pool.request()
      .input('agenceId', sql.BigInt, agenceId)
      .input('date', sql.Date, date)
      .input('heure', sql.Time, heure)
      .query(`
        SELECT 
          o.*,
          (SELECT COUNT(*) FROM AffectationOuvrier a 
           INNER JOIN RendezVous r ON a.rendez_vous_id = r.id
           WHERE a.ouvrier_id = o.id 
           AND a.statut IN ('EN_ATTENTE', 'EN_COURS')
           AND CAST(r.date_heure AS DATE) = @date
          ) AS affectations_jour
        FROM Ouvrier o
        WHERE o.agence_id = @agenceId 
        AND o.actif = 1
        AND NOT EXISTS (
          SELECT 1 FROM DisponibiliteOuvrier d
          WHERE d.ouvrier_id = o.id
          AND d.date = @date
          AND d.disponible = 0
          AND @heure BETWEEN d.heure_debut AND d.heure_fin
        )
        ORDER BY affectations_jour ASC, o.nom, o.prenom
      `);

    res.json({
      success: true,
      workers: result.recordset
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des ouvriers disponibles:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: error.message
    });
  }
};

module.exports = exports;
