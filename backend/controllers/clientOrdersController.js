const { getConnection, sql } = require('../config/database');

/**
 * Controller pour la gestion des commandes de réparation côté client
 * Les "commandes" sont en fait les rendez-vous avec leurs interventions
 */

// Récupérer toutes les commandes (rendez-vous) du client
const getMyOrders = async (req, res) => {
  try {
    const clientId = req.user.id;
    const pool = await getConnection();

    const result = await pool.request()
      .input('client_id', sql.BigInt, clientId)
      .query(`
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
          ve.nom AS version_nom,
          ag.nom AS agence_nom,
          ag.ville AS agence_ville,
          ag.telephone AS agence_telephone,
          a.nom AS agent_nom,
          a.prenom AS agent_prenom,
          (
            SELECT COUNT(*) 
            FROM InterventionRDV i 
            WHERE i.rdv_id = r.id
          ) AS nombre_interventions,
          (
            SELECT SUM(ISNULL(i.cout_reel, 0))
            FROM InterventionRDV i
            WHERE i.rdv_id = r.id
          ) AS cout_total
        FROM RendezVous r
        JOIN Vehicule v ON v.id = r.vehicule_id
        JOIN Version ve ON ve.id = v.version_id
        JOIN Modele mo ON mo.id = ve.modele_id
        JOIN Marque ma ON ma.id = mo.marque_id
        JOIN Agence ag ON ag.id = r.agence_id
        LEFT JOIN Utilisateur a ON a.id = r.agent_id
        WHERE r.client_id = @client_id
        ORDER BY r.date_heure DESC
      `);

    return res.json({ orders: result.recordset });
  } catch (error) {
    console.error('Erreur récupération commandes:', error);
    return res.status(500).json({ error: 'Erreur lors de la récupération des commandes' });
  }
};

// Récupérer les détails d'une commande spécifique
const getOrderDetails = async (req, res) => {
  try {
    const clientId = req.user.id;
    const orderId = parseInt(req.params.id);
    const pool = await getConnection();

    // Récupérer les infos du rendez-vous
    const orderResult = await pool.request()
      .input('id', sql.BigInt, orderId)
      .input('client_id', sql.BigInt, clientId)
      .query(`
        SELECT 
          r.id,
          r.date_heure,
          r.statut,
          r.description,
          r.duree_estimee,
          r.heure_reelle_debut,
          r.heure_reelle_fin,
          r.date_creation,
          r.date_modification,
          v.immatriculation,
          v.numero_chassis,
          v.couleur,
          v.annee,
          ma.nom AS marque_nom,
          mo.nom AS modele_nom,
          ve.nom AS version_nom,
          ag.nom AS agence_nom,
          ag.ville AS agence_ville,
          ag.adresse AS agence_adresse,
          ag.telephone AS agence_telephone,
          a.nom AS agent_nom,
          a.prenom AS agent_prenom,
          a.telephone AS agent_telephone
        FROM RendezVous r
        JOIN Vehicule v ON v.id = r.vehicule_id
        JOIN Version ve ON ve.id = v.version_id
        JOIN Modele mo ON mo.id = ve.modele_id
        JOIN Marque ma ON ma.id = mo.marque_id
        JOIN Agence ag ON ag.id = r.agence_id
        LEFT JOIN Utilisateur a ON a.id = r.agent_id
        WHERE r.id = @id AND r.client_id = @client_id
      `);

    if (orderResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    // Récupérer les interventions
    const interventionsResult = await pool.request()
      .input('rdv_id', sql.BigInt, orderId)
      .query(`
        SELECT 
          i.id,
          i.statut,
          i.duree_reelle,
          i.commentaire,
          i.date_debut,
          i.date_fin,
          i.cout_reel,
          st.nom AS sous_type_nom,
          st.duree_estimee,
          t.nom AS type_nom
        FROM InterventionRDV i
        JOIN SousTypeIntervention st ON st.id = i.sous_type_id
        JOIN TypeIntervention t ON t.id = st.type_intervention_id
        WHERE i.rdv_id = @rdv_id
        ORDER BY i.date_creation
      `);

    // Récupérer les pièces jointes si elles existent
    let attachments = [];
    try {
      const attachmentsResult = await pool.request()
        .input('rdv_id', sql.BigInt, orderId)
        .query(`
          SELECT 
            id,
            nom_fichier,
            nom_original,
            type_fichier,
            taille_ko,
            url_stockage,
            description,
            date_ajout
          FROM PiecesJointes
          WHERE rdv_id = @rdv_id
          ORDER BY date_ajout DESC
        `);
      attachments = attachmentsResult.recordset;
    } catch (error) {
      // Table PiecesJointes n'existe peut-être pas encore
      console.warn('Table PiecesJointes non disponible');
    }

    return res.json({
      order: orderResult.recordset[0],
      interventions: interventionsResult.recordset,
      attachments: attachments
    });
  } catch (error) {
    console.error('Erreur récupération détails commande:', error);
    return res.status(500).json({ error: 'Erreur lors de la récupération des détails' });
  }
};

// Statistiques des commandes du client
const getOrdersStats = async (req, res) => {
  try {
    const clientId = req.user.id;
    const pool = await getConnection();

    const stats = await pool.request()
      .input('client_id', sql.BigInt, clientId)
      .query(`
        SELECT 
          COUNT(*) AS total_commandes,
          COUNT(CASE WHEN statut = 'PLANIFIE' THEN 1 END) AS planifiees,
          COUNT(CASE WHEN statut = 'CONFIRME' THEN 1 END) AS confirmees,
          COUNT(CASE WHEN statut = 'EN_COURS' THEN 1 END) AS en_cours,
          COUNT(CASE WHEN statut = 'TERMINE' THEN 1 END) AS terminees,
          COUNT(CASE WHEN statut = 'ANNULE' THEN 1 END) AS annulees,
          (
            SELECT SUM(ISNULL(i.cout_reel, 0))
            FROM RendezVous r2
            JOIN InterventionRDV i ON i.rdv_id = r2.id
            WHERE r2.client_id = @client_id AND r2.statut = 'TERMINE'
          ) AS cout_total
        FROM RendezVous
        WHERE client_id = @client_id
      `);

    return res.json({ stats: stats.recordset[0] });
  } catch (error) {
    console.error('Erreur récupération stats commandes:', error);
    return res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
};

module.exports = {
  getMyOrders,
  getOrderDetails,
  getOrdersStats
};
