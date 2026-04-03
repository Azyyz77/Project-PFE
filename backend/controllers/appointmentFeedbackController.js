const { getConnection, sql } = require('../config/database');

/**
 * Controller pour la gestion des feedbacks de rendez-vous
 */

// Soumettre un feedback pour un rendez-vous terminé
const submitFeedback = async (req, res) => {
  try {
    const clientId = req.user.id;
    const appointmentId = parseInt(req.params.id);
    const { note, commentaire } = req.body;

    // Validation
    if (!note || note < 1 || note > 5) {
      return res.status(400).json({ error: 'La note doit être entre 1 et 5' });
    }

    const pool = await getConnection();

    // Vérifier que le RDV appartient au client et est terminé
    const rdv = await pool.request()
      .input('id', sql.BigInt, appointmentId)
      .input('client_id', sql.BigInt, clientId)
      .query(`
        SELECT id, statut, client_id
        FROM RendezVous
        WHERE id = @id AND client_id = @client_id
      `);

    if (rdv.recordset.length === 0) {
      return res.status(404).json({ error: 'Rendez-vous non trouvé' });
    }

    if (rdv.recordset[0].statut !== 'TERMINE') {
      return res.status(400).json({ error: 'Le rendez-vous doit être terminé pour laisser un feedback' });
    }

    // Enregistrer le feedback
    await pool.request()
      .input('id', sql.BigInt, appointmentId)
      .input('note', sql.TinyInt, note)
      .input('commentaire', sql.NVarChar(500), commentaire || null)
      .query(`
        UPDATE RendezVous
        SET 
          feedback_note = @note,
          feedback_commentaire = @commentaire,
          date_feedback = GETDATE()
        WHERE id = @id
      `);

    return res.json({ 
      message: 'Merci pour votre feedback',
      feedback: { note, commentaire }
    });
  } catch (error) {
    console.error('Erreur soumission feedback:', error);
    return res.status(500).json({ error: 'Erreur lors de la soumission du feedback' });
  }
};

// Récupérer les feedbacks (pour les agents/admin)
const getFeedbacks = async (req, res) => {
  try {
    const { fromDate, toDate, minNote, maxNote } = req.query;
    const pool = await getConnection();

    let query = `
      SELECT 
        r.id,
        r.date_heure,
        r.feedback_note,
        r.feedback_commentaire,
        r.date_feedback,
        u.nom AS client_nom,
        u.prenom AS client_prenom,
        ag.nom AS agence_nom,
        v.immatriculation,
        ma.nom AS marque_nom,
        mo.nom AS modele_nom
      FROM RendezVous r
      JOIN Utilisateur u ON u.id = r.client_id
      JOIN Agence ag ON ag.id = r.agence_id
      JOIN Vehicule v ON v.id = r.vehicule_id
      JOIN Version ve ON ve.id = v.version_id
      JOIN Modele mo ON mo.id = ve.modele_id
      JOIN Marque ma ON ma.id = mo.marque_id
      WHERE r.feedback_note IS NOT NULL
    `;

    const request = pool.request();

    if (fromDate) {
      query += ` AND r.date_feedback >= @fromDate`;
      request.input('fromDate', sql.Date, fromDate);
    }

    if (toDate) {
      query += ` AND r.date_feedback <= @toDate`;
      request.input('toDate', sql.Date, toDate);
    }

    if (minNote) {
      query += ` AND r.feedback_note >= @minNote`;
      request.input('minNote', sql.TinyInt, parseInt(minNote));
    }

    if (maxNote) {
      query += ` AND r.feedback_note <= @maxNote`;
      request.input('maxNote', sql.TinyInt, parseInt(maxNote));
    }

    query += ` ORDER BY r.date_feedback DESC`;

    const result = await request.query(query);

    return res.json({
      count: result.recordset.length,
      feedbacks: result.recordset
    });
  } catch (error) {
    console.error('Erreur récupération feedbacks:', error);
    return res.status(500).json({ error: 'Erreur lors de la récupération des feedbacks' });
  }
};

// Statistiques des feedbacks
const getFeedbackStats = async (req, res) => {
  try {
    const pool = await getConnection();

    const stats = await pool.request().query(`
      SELECT 
        COUNT(*) AS total_feedbacks,
        AVG(CAST(feedback_note AS FLOAT)) AS note_moyenne,
        COUNT(CASE WHEN feedback_note = 5 THEN 1 END) AS note_5,
        COUNT(CASE WHEN feedback_note = 4 THEN 1 END) AS note_4,
        COUNT(CASE WHEN feedback_note = 3 THEN 1 END) AS note_3,
        COUNT(CASE WHEN feedback_note = 2 THEN 1 END) AS note_2,
        COUNT(CASE WHEN feedback_note = 1 THEN 1 END) AS note_1
      FROM RendezVous
      WHERE feedback_note IS NOT NULL
    `);

    return res.json({ stats: stats.recordset[0] });
  } catch (error) {
    console.error('Erreur stats feedbacks:', error);
    return res.status(500).json({ error: 'Erreur lors du calcul des statistiques' });
  }
};

module.exports = {
  submitFeedback,
  getFeedbacks,
  getFeedbackStats
};
