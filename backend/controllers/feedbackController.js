const sql = require('mssql');
const { getConnection } = require('../config/database');

// Soumettre un feedback pour un rendez-vous
exports.submitFeedback = async (req, res) => {
  try {
    console.log('=== FEEDBACK SUBMISSION ===');
    console.log('Body:', req.body);
    console.log('User:', req.user);
    
    const { rdv_id, note, commentaire } = req.body;
    const client_id = req.user.id;

    if (!rdv_id || !note) {
      console.log('Validation failed: rdv_id=', rdv_id, 'note=', note);
      return res.status(400).json({ message: 'ID du rendez-vous et note sont requis' });
    }

    if (note < 1 || note > 5) {
      return res.status(400).json({ message: 'La note doit être entre 1 et 5' });
    }

    const pool = await getConnection();

    // Vérifier que le RDV appartient au client et est terminé
    const rdvCheck = await pool.request()
      .input('rdv_id', sql.BigInt, rdv_id)
      .input('client_id', sql.BigInt, client_id)
      .query(`
        SELECT id, statut FROM RendezVous
        WHERE id = @rdv_id AND client_id = @client_id
      `);

    console.log('RDV Check:', rdvCheck.recordset);

    if (rdvCheck.recordset.length === 0) {
      return res.status(404).json({ message: 'Rendez-vous non trouvé' });
    }

    if (rdvCheck.recordset[0].statut !== 'TERMINE') {
      return res.status(400).json({ message: 'Le rendez-vous doit être terminé pour laisser un feedback' });
    }

    // Mettre à jour le feedback
    await pool.request()
      .input('rdv_id', sql.BigInt, rdv_id)
      .input('note', sql.TinyInt, note)
      .input('commentaire', sql.NVarChar(500), commentaire || null)
      .query(`
        UPDATE RendezVous
        SET feedback_note = @note, 
            feedback_commentaire = @commentaire,
            date_feedback = GETDATE()
        WHERE id = @rdv_id
      `);

    console.log('Feedback saved successfully');
    res.json({ message: 'Feedback enregistré avec succès' });
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du feedback:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Récupérer les feedbacks (pour admin/agent)
exports.getAllFeedbacks = async (req, res) => {
  try {
    const { agence_id, date_debut, date_fin } = req.query;

    const pool = await getConnection();
    let query = `
      SELECT 
        r.id, r.date_heure, r.feedback_note, r.feedback_commentaire, r.date_feedback,
        c.nom + ' ' + c.prenom as client_nom,
        a.nom as agence_nom,
        ag.nom + ' ' + ag.prenom as agent_nom
      FROM RendezVous r
      JOIN Utilisateur c ON c.id = r.client_id
      JOIN Agence a ON a.id = r.agence_id
      LEFT JOIN Utilisateur ag ON ag.id = r.agent_id
      WHERE r.feedback_note IS NOT NULL
    `;

    const request = pool.request();

    if (agence_id) {
      query += ' AND r.agence_id = @agence_id';
      request.input('agence_id', sql.BigInt, agence_id);
    }

    if (date_debut) {
      query += ' AND r.date_feedback >= @date_debut';
      request.input('date_debut', sql.DateTime2, date_debut);
    }

    if (date_fin) {
      query += ' AND r.date_feedback <= @date_fin';
      request.input('date_fin', sql.DateTime2, date_fin);
    }

    query += ' ORDER BY r.date_feedback DESC';

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (error) {
    console.error('Erreur lors de la récupération des feedbacks:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Statistiques des feedbacks
exports.getFeedbackStats = async (req, res) => {
  try {
    const { agence_id } = req.query;

    const pool = await getConnection();
    const request = pool.request();

    let query = `
      SELECT 
        COUNT(*) as total_feedbacks,
        AVG(CAST(feedback_note AS FLOAT)) as note_moyenne,
        SUM(CASE WHEN feedback_note = 5 THEN 1 ELSE 0 END) as note_5,
        SUM(CASE WHEN feedback_note = 4 THEN 1 ELSE 0 END) as note_4,
        SUM(CASE WHEN feedback_note = 3 THEN 1 ELSE 0 END) as note_3,
        SUM(CASE WHEN feedback_note = 2 THEN 1 ELSE 0 END) as note_2,
        SUM(CASE WHEN feedback_note = 1 THEN 1 ELSE 0 END) as note_1
      FROM RendezVous
      WHERE feedback_note IS NOT NULL
    `;

    if (agence_id) {
      query += ' AND agence_id = @agence_id';
      request.input('agence_id', sql.BigInt, agence_id);
    }

    const result = await request.query(query);
    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
