const { getConnection, sql } = require('../config/database');

/**
 * Controller pour les rapports et statistiques (admin)
 */

// Rapport global du système
const getGlobalReport = async (req, res) => {
  try {
    const pool = await getConnection();

    // Statistiques utilisateurs
    const usersStats = await pool.request().query(`
      SELECT 
        COUNT(*) AS total_users,
        COUNT(CASE WHEN actif = 1 THEN 1 END) AS active_users,
        (SELECT COUNT(*) FROM Utilisateur u WHERE u.role = 'CLIENT') AS total_clients,
        (SELECT COUNT(*) FROM Utilisateur u WHERE u.role = 'AGENT') AS total_agents
      FROM Utilisateur
    `);

    // Statistiques véhicules
    const vehiclesStats = await pool.request().query(`
      SELECT 
        COUNT(*) AS total_vehicles,
        COUNT(CASE WHEN statut_validation = 'VALIDE' THEN 1 END) AS validated,
        COUNT(CASE WHEN statut_validation = 'EN_ATTENTE' THEN 1 END) AS pending
      FROM Vehicule
    `);

    // Statistiques rendez-vous
    const appointmentsStats = await pool.request().query(`
      SELECT 
        COUNT(*) AS total_appointments,
        COUNT(CASE WHEN statut = 'TERMINE' THEN 1 END) AS completed,
        COUNT(CASE WHEN statut = 'EN_COURS' THEN 1 END) AS in_progress,
        COUNT(CASE WHEN statut = 'ANNULE' THEN 1 END) AS cancelled
      FROM RendezVous
    `);

    // Statistiques réclamations
    const complaintsStats = await pool.request().query(`
      SELECT 
        COUNT(*) AS total_complaints,
        COUNT(CASE WHEN statut = 'OUVERTE' THEN 1 END) AS [open],
        COUNT(CASE WHEN statut = 'RESOLUE' THEN 1 END) AS resolved
      FROM Reclamation
    `);

    // Revenus
    const revenueStats = await pool.request().query(`
      SELECT 
        SUM(ISNULL(i.cout_reel, 0)) AS total_revenue,
        COUNT(DISTINCT r.id) AS paid_appointments
      FROM InterventionRDV i
      JOIN RendezVous r ON r.id = i.rdv_id
      WHERE r.statut = 'TERMINE' AND i.cout_reel IS NOT NULL
    `);

    return res.json({
      users: usersStats.recordset[0],
      vehicles: vehiclesStats.recordset[0],
      appointments: appointmentsStats.recordset[0],
      complaints: complaintsStats.recordset[0],
      revenue: revenueStats.recordset[0]
    });
  } catch (error) {
    console.error('Erreur rapport global:', error);
    return res.status(500).json({ error: 'Erreur lors de la génération du rapport' });
  }
};

// Rapport par agence
const getAgencyReport = async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool.request().query(`
      SELECT 
        ag.id,
        ag.nom,
        ag.ville,
        COUNT(DISTINCT r.id) AS total_appointments,
        COUNT(DISTINCT CASE WHEN r.statut = 'TERMINE' THEN r.id END) AS completed_appointments,
        COUNT(DISTINCT r.agent_id) AS total_agents,
        SUM(ISNULL(i.cout_reel, 0)) AS total_revenue
      FROM Agence ag
      LEFT JOIN RendezVous r ON r.agence_id = ag.id
      LEFT JOIN InterventionRDV i ON i.rdv_id = r.id AND r.statut = 'TERMINE'
      GROUP BY ag.id, ag.nom, ag.ville
      ORDER BY total_revenue DESC
    `);

    return res.json({ agencies: result.recordset });
  } catch (error) {
    console.error('Erreur rapport agences:', error);
    return res.status(500).json({ error: 'Erreur lors de la génération du rapport' });
  }
};

// Rapport par période
const getPeriodReport = async (req, res) => {
  try {
    const { date_debut, date_fin } = req.query;
    
    if (!date_debut || !date_fin) {
      return res.status(400).json({ error: 'Les dates de début et fin sont requises' });
    }

    const pool = await getConnection();

    const result = await pool.request()
      .input('date_debut', sql.DateTime2, date_debut)
      .input('date_fin', sql.DateTime2, date_fin)
      .query(`
        SELECT 
          COUNT(DISTINCT r.id) AS total_appointments,
          COUNT(DISTINCT CASE WHEN r.statut = 'TERMINE' THEN r.id END) AS completed,
          COUNT(DISTINCT CASE WHEN r.statut = 'ANNULE' THEN r.id END) AS cancelled,
          COUNT(DISTINCT r.client_id) AS unique_clients,
          COUNT(DISTINCT i.id) AS total_interventions,
          SUM(ISNULL(i.cout_reel, 0)) AS total_revenue,
          AVG(ISNULL(i.cout_reel, 0)) AS avg_revenue_per_intervention
        FROM RendezVous r
        LEFT JOIN InterventionRDV i ON i.rdv_id = r.id
        WHERE r.date_heure BETWEEN @date_debut AND @date_fin
      `);

    return res.json({ report: result.recordset[0] });
  } catch (error) {
    console.error('Erreur rapport période:', error);
    return res.status(500).json({ error: 'Erreur lors de la génération du rapport' });
  }
};

// Top interventions
const getTopInterventions = async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool.request().query(`
      SELECT TOP 10
        st.nom AS intervention_nom,
        t.nom AS type_nom,
        COUNT(i.id) AS nombre_fois,
        AVG(ISNULL(i.cout_reel, 0)) AS cout_moyen,
        SUM(ISNULL(i.cout_reel, 0)) AS revenu_total
      FROM InterventionRDV i
      JOIN SousTypeIntervention st ON st.id = i.sous_type_id
      JOIN TypeIntervention t ON t.id = st.type_intervention_id
      GROUP BY st.nom, t.nom
      ORDER BY nombre_fois DESC
    `);

    return res.json({ interventions: result.recordset });
  } catch (error) {
    console.error('Erreur top interventions:', error);
    return res.status(500).json({ error: 'Erreur lors de la génération du rapport' });
  }
};

module.exports = {
  getGlobalReport,
  getAgencyReport,
  getPeriodReport,
  getTopInterventions
};
