const { getConnection, sql } = require('../config/database');

/**
 * Controller pour la gestion de toutes les commandes (admin)
 */

// Récupérer toutes les commandes avec filtres
const getAllOrders = async (req, res) => {
  try {
    const { statut, agence_id, date_debut, date_fin } = req.query;
    const pool = await getConnection();

    let query = `
      SELECT 
        r.id,
        r.date_heure,
        r.statut,
        r.description,
        r.duree_estimee,
        r.heure_reelle_debut,
        r.heure_reelle_fin,
        r.date_creation,
        v.immatriculation,
        ma.nom AS marque_nom,
        mo.nom AS modele_nom,
        c.nom AS client_nom,
        c.prenom AS client_prenom,
        c.telephone AS client_telephone,
        ag.nom AS agence_nom,
        ag.ville AS agence_ville,
        a.nom AS agent_nom,
        a.prenom AS agent_prenom,
        (SELECT COUNT(*) FROM InterventionRDV i WHERE i.rdv_id = r.id) AS nombre_interventions,
        (SELECT SUM(ISNULL(i.cout_reel, 0)) FROM InterventionRDV i WHERE i.rdv_id = r.id) AS cout_total
      FROM RendezVous r
      JOIN Vehicule v ON v.id = r.vehicule_id
      JOIN Version ve ON ve.id = v.version_id
      JOIN Modele mo ON mo.id = ve.modele_id
      JOIN Marque ma ON ma.id = mo.marque_id
      JOIN Utilisateur c ON c.id = r.client_id
      JOIN Agence ag ON ag.id = r.agence_id
      LEFT JOIN Utilisateur a ON a.id = r.agent_id
      WHERE 1=1
    `;

    const request = pool.request();

    if (statut) {
      query += ` AND r.statut = @statut`;
      request.input('statut', sql.VarChar, statut);
    }

    if (agence_id) {
      query += ` AND r.agence_id = @agence_id`;
      request.input('agence_id', sql.BigInt, parseInt(agence_id));
    }

    if (date_debut) {
      query += ` AND r.date_heure >= @date_debut`;
      request.input('date_debut', sql.DateTime2, date_debut);
    }

    if (date_fin) {
      query += ` AND r.date_heure <= @date_fin`;
      request.input('date_fin', sql.DateTime2, date_fin);
    }

    query += ` ORDER BY r.date_heure DESC`;

    const result = await request.query(query);

    return res.json({ orders: result.recordset });
  } catch (error) {
    console.error('Erreur récupération commandes:', error);
    return res.status(500).json({ error: 'Erreur lors de la récupération des commandes' });
  }
};

// Statistiques des commandes
const getOrdersStats = async (req, res) => {
  try {
    const pool = await getConnection();

    const stats = await pool.request().query(`
      SELECT 
        COUNT(*) AS total_commandes,
        COUNT(CASE WHEN statut = 'PLANIFIE' THEN 1 END) AS planifiees,
        COUNT(CASE WHEN statut = 'CONFIRME' THEN 1 END) AS confirmees,
        COUNT(CASE WHEN statut = 'EN_COURS' THEN 1 END) AS en_cours,
        COUNT(CASE WHEN statut = 'TERMINE' THEN 1 END) AS terminees,
        COUNT(CASE WHEN statut = 'ANNULE' THEN 1 END) AS annulees,
        (SELECT SUM(ISNULL(i.cout_reel, 0)) FROM InterventionRDV i 
         JOIN RendezVous r ON r.id = i.rdv_id WHERE r.statut = 'TERMINE') AS revenu_total,
        (SELECT COUNT(*) FROM InterventionRDV) AS total_interventions
      FROM RendezVous
    `);

    return res.json({ stats: stats.recordset[0] });
  } catch (error) {
    console.error('Erreur récupération stats commandes:', error);
    return res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
};

module.exports = {
  getAllOrders,
  getOrdersStats
};
