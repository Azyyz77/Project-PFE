const { getConnection, sql } = require('../config/database');

/**
 * Obtenir l'historique complet d'un véhicule
 * Version simplifiée - affiche uniquement les infos du véhicule
 */
const getVehicleHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const pool = await getConnection();

    // Vérifier que le véhicule appartient à l'utilisateur (sauf si ADMIN/AGENT)
    if (req.user.role === 'CLIENT') {
      const vehicleCheck = await pool.request()
        .input('vehicleId', sql.BigInt, id)
        .input('userId', sql.BigInt, userId)
        .query('SELECT id FROM Vehicule WHERE id = @vehicleId AND client_id = @userId');

      if (vehicleCheck.recordset.length === 0) {
        return res.status(403).json({
          error: 'Accès refusé',
          message: 'Ce véhicule ne vous appartient pas'
        });
      }
    }

    // Récupérer les infos du véhicule avec la version
    const historyQuery = `
      SELECT 
        v.id as vehicule_id,
        v.immatriculation,
        ISNULL(m.nom, 'N/A') as marque,
        ISNULL(mo.nom, 'N/A') as modele,
        v.annee,
        0 as kilometrage,
        v.date_ajout as date_achat,
        v.date_ajout as date_creation,
        0 as total_rdv,
        0 as rdv_termines,
        0 as rdv_annules,
        0 as total_interventions,
        0 as cout_total_interventions,
        NULL as derniere_intervention,
        NULL as prochain_rdv
      FROM Vehicule v
      LEFT JOIN Version ve ON ve.id = v.version_id
      LEFT JOIN Modele mo ON mo.id = ve.modele_id
      LEFT JOIN Marque m ON m.id = mo.marque_id
      WHERE v.id = @vehicleId
    `;

    const result = await pool.request()
      .input('vehicleId', sql.BigInt, id)
      .query(historyQuery);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        error: 'Véhicule non trouvé'
      });
    }

    res.json({
      history: result.recordset[0]
    });
  } catch (error) {
    console.error('Erreur récupération historique véhicule:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération de l\'historique',
      message: error.message
    });
  }
};

/**
 * Obtenir les interventions d'un véhicule
 * Version simplifiée - retourne une liste vide pour l'instant
 */
const getVehicleInterventions = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const pool = await getConnection();

    // Vérifier l'accès
    if (req.user.role === 'CLIENT') {
      const vehicleCheck = await pool.request()
        .input('vehicleId', sql.BigInt, id)
        .input('userId', sql.BigInt, userId)
        .query('SELECT id FROM Vehicule WHERE id = @vehicleId AND client_id = @userId');

      if (vehicleCheck.recordset.length === 0) {
        return res.status(403).json({
          error: 'Accès refusé'
        });
      }
    }

    // Pour l'instant, retourner une liste vide
    // TODO: Implémenter quand la table Intervention sera créée
    res.json({
      interventions: [],
      total: 0,
      limit: 50,
      offset: 0
    });
  } catch (error) {
    console.error('Erreur récupération interventions:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des interventions',
      message: error.message
    });
  }
};

/**
 * Obtenir les rendez-vous d'un véhicule
 */
const getVehicleAppointments = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    const userId = req.user.id;

    const pool = await getConnection();

    // Vérifier l'accès
    if (req.user.role === 'CLIENT') {
      const vehicleCheck = await pool.request()
        .input('vehicleId', sql.BigInt, id)
        .input('userId', sql.BigInt, userId)
        .query('SELECT id FROM Vehicule WHERE id = @vehicleId AND client_id = @userId');

      if (vehicleCheck.recordset.length === 0) {
        return res.status(403).json({
          error: 'Accès refusé'
        });
      }
    }

    const result = await pool.request()
      .input('vehicleId', sql.BigInt, id)
      .input('limit', sql.Int, parseInt(limit))
      .input('offset', sql.Int, parseInt(offset))
      .query(`
        SELECT 
          r.id,
          r.date_heure,
          CAST(r.date_heure AS DATE) as date_rdv,
          FORMAT(r.date_heure, 'HH:mm') as heure_debut,
          CASE 
            WHEN r.heure_reelle_fin IS NOT NULL THEN FORMAT(r.heure_reelle_fin, 'HH:mm')
            ELSE ''
          END as heure_fin,
          r.statut,
          r.description as motif,
          r.description as notes,
          '' as type_intervention,
          a.nom as agence_nom,
          a.adresse as agence_adresse,
          CASE 
            WHEN u.nom IS NOT NULL THEN u.nom + ' ' + ISNULL(u.prenom, '')
            ELSE ''
          END as agent_nom
        FROM RendezVous r
        LEFT JOIN Agence a ON a.id = r.agence_id
        LEFT JOIN Utilisateur u ON u.id = r.agent_id
        WHERE r.vehicule_id = @vehicleId
        ORDER BY r.date_heure DESC
        OFFSET @offset ROWS
        FETCH NEXT @limit ROWS ONLY
      `);

    // Compter le total
    const countResult = await pool.request()
      .input('vehicleId', sql.BigInt, id)
      .query('SELECT COUNT(*) as total FROM RendezVous WHERE vehicule_id = @vehicleId');

    res.json({
      appointments: result.recordset,
      total: countResult.recordset[0].total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Erreur récupération rendez-vous:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des rendez-vous',
      message: error.message
    });
  }
};

/**
 * Exporter l'historique (PDF/Excel)
 */
const exportHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const { format = 'json' } = req.query;
    const userId = req.user.id;

    const pool = await getConnection();

    // Vérifier l'accès
    if (req.user.role === 'CLIENT') {
      const vehicleCheck = await pool.request()
        .input('vehicleId', sql.BigInt, id)
        .input('userId', sql.BigInt, userId)
        .query('SELECT id FROM Vehicule WHERE id = @vehicleId AND client_id = @userId');

      if (vehicleCheck.recordset.length === 0) {
        return res.status(403).json({
          error: 'Accès refusé'
        });
      }
    }

    // Récupérer les données du véhicule
    const vehicleData = await pool.request()
      .input('vehicleId', sql.BigInt, id)
      .query(`
        SELECT v.*, m.nom as marque, mo.nom as modele
        FROM Vehicule v
        LEFT JOIN Version ve ON ve.id = v.version_id
        LEFT JOIN Modele mo ON mo.id = ve.modele_id
        LEFT JOIN Marque m ON m.id = mo.marque_id
        WHERE v.id = @vehicleId
      `);

    // Récupérer les rendez-vous
    const appointments = await pool.request()
      .input('vehicleId', sql.BigInt, id)
      .query(`
        SELECT 
          r.id,
          r.date_heure,
          CAST(r.date_heure AS DATE) as date,
          FORMAT(r.date_heure, 'HH:mm') as heure,
          r.statut,
          r.description,
          '' as type_intervention,
          a.nom as agence_nom,
          CASE 
            WHEN u.nom IS NOT NULL THEN u.nom + ' ' + ISNULL(u.prenom, '')
            ELSE ''
          END as agent_nom
        FROM RendezVous r
        LEFT JOIN Agence a ON a.id = r.agence_id
        LEFT JOIN Utilisateur u ON u.id = r.agent_id
        WHERE r.vehicule_id = @vehicleId
        ORDER BY r.date_heure DESC
      `);

    const exportData = {
      vehicule: vehicleData.recordset[0],
      interventions: [], // Vide pour l'instant
      rendez_vous: appointments.recordset,
      date_export: new Date().toISOString()
    };

    if (format === 'json') {
      res.json(exportData);
    } else {
      res.status(501).json({
        error: 'Format non supporté',
        message: 'Seul le format JSON est actuellement supporté.'
      });
    }
  } catch (error) {
    console.error('Erreur export historique:', error);
    res.status(500).json({
      error: 'Erreur lors de l\'export',
      message: error.message
    });
  }
};

module.exports = {
  getVehicleHistory,
  getVehicleInterventions,
  getVehicleAppointments,
  exportHistory
};
