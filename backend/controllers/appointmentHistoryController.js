const { getConnection, sql } = require('../config/database');

/**
 * Controller pour l'historique et les modifications de rendez-vous
 */

// Récupérer l'historique d'un rendez-vous
const getAppointmentHistory = async (req, res) => {
  try {
    const appointmentId = parseInt(req.params.id);
    const pool = await getConnection();

    // Vérifier l'accès
    const rdv = await pool.request()
      .input('id', sql.BigInt, appointmentId)
      .query(`SELECT id, client_id FROM RendezVous WHERE id = @id`);

    if (rdv.recordset.length === 0) {
      return res.status(404).json({ error: 'Rendez-vous non trouvé' });
    }

    // Si client, vérifier qu'il est propriétaire
    if (req.user.role === 'CLIENT' && rdv.recordset[0].client_id !== req.user.id) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    // Récupérer l'historique des modifications
    const history = await pool.request()
      .input('rdv_id', sql.BigInt, appointmentId)
      .query(`
        SELECT 
          r.id,
          r.date_creation,
          r.date_modification,
          r.date_annulation,
          r.raison_annulation,
          r.heure_reelle_debut,
          r.heure_reelle_fin,
          r.statut,
          u_annul.nom AS annule_par_nom,
          u_annul.prenom AS annule_par_prenom,
          agent.nom AS agent_nom,
          agent.prenom AS agent_prenom
        FROM RendezVous r
        LEFT JOIN Utilisateur u_annul ON u_annul.id = r.utilisateur_annulation
        LEFT JOIN Utilisateur agent ON agent.id = r.agent_id
        WHERE r.id = @rdv_id
      `);

    // Récupérer l'historique des interventions
    const interventions = await pool.request()
      .input('rdv_id', sql.BigInt, appointmentId)
      .query(`
        SELECT 
          ir.id,
          ir.statut,
          st.nom AS sous_type_nom,
          ti.nom AS type_nom,
          ir.date_creation
        FROM InterventionRDV ir
        JOIN SousTypeIntervention st ON st.id = ir.sous_type_id
        JOIN TypeIntervention ti ON ti.id = st.type_intervention_id
        WHERE ir.rdv_id = @rdv_id
        ORDER BY ir.date_creation
      `);

    return res.json({
      appointment: history.recordset[0],
      interventions: interventions.recordset
    });
  } catch (error) {
    console.error('Erreur historique RDV:', error);
    return res.status(500).json({ error: 'Erreur lors de la récupération de l\'historique' });
  }
};

// Récupérer les statistiques de durée (réel vs estimé)
const getDurationStats = async (req, res) => {
  try {
    const pool = await getConnection();

    const stats = await pool.request().query(`
      SELECT 
        COUNT(*) AS total_rdv_termines,
        AVG(duree_estimee) AS duree_moyenne_estimee,
        AVG(DATEDIFF(MINUTE, heure_reelle_debut, heure_reelle_fin)) AS duree_moyenne_reelle,
        COUNT(CASE 
          WHEN DATEDIFF(MINUTE, heure_reelle_debut, heure_reelle_fin) > duree_estimee 
          THEN 1 
        END) AS depassements,
        COUNT(CASE 
          WHEN DATEDIFF(MINUTE, heure_reelle_debut, heure_reelle_fin) <= duree_estimee 
          THEN 1 
        END) AS dans_les_temps
      FROM RendezVous
      WHERE statut = 'TERMINE' 
        AND heure_reelle_debut IS NOT NULL 
        AND heure_reelle_fin IS NOT NULL
        AND duree_estimee IS NOT NULL
    `);

    return res.json({ stats: stats.recordset[0] });
  } catch (error) {
    console.error('Erreur stats durée:', error);
    return res.status(500).json({ error: 'Erreur lors du calcul des statistiques' });
  }
};

// Récupérer l'historique des annulations
const getCancellationHistory = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;
    const pool = await getConnection();

    let query = `
      SELECT 
        r.id,
        r.date_heure,
        r.date_annulation,
        r.raison_annulation,
        u_client.nom AS client_nom,
        u_client.prenom AS client_prenom,
        u_annul.nom AS annule_par_nom,
        u_annul.prenom AS annule_par_prenom,
        u_annul.role_id,
        ag.nom AS agence_nom
      FROM RendezVous r
      JOIN Utilisateur u_client ON u_client.id = r.client_id
      LEFT JOIN Utilisateur u_annul ON u_annul.id = r.utilisateur_annulation
      JOIN Agence ag ON ag.id = r.agence_id
      WHERE r.statut = 'ANNULE'
    `;

    const request = pool.request();

    if (fromDate) {
      query += ` AND r.date_annulation >= @fromDate`;
      request.input('fromDate', sql.Date, fromDate);
    }

    if (toDate) {
      query += ` AND r.date_annulation <= @toDate`;
      request.input('toDate', sql.Date, toDate);
    }

    query += ` ORDER BY r.date_annulation DESC`;

    const result = await request.query(query);

    return res.json({
      count: result.recordset.length,
      cancellations: result.recordset
    });
  } catch (error) {
    console.error('Erreur historique annulations:', error);
    return res.status(500).json({ error: 'Erreur lors de la récupération de l\'historique' });
  }
};

module.exports = {
  getAppointmentHistory,
  getDurationStats,
  getCancellationHistory
};
