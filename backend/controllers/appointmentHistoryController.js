const { getConnection, sql } = require('../config/database');

/**
 * GET /api/appointments/:id/history
 * Récupérer l'historique d'un rendez-vous
 */
exports.getAppointmentHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getConnection();
    
    const result = await pool.request()
      .input('rdvId', sql.BigInt, id)
      .query(`
        SELECT 
          h.id,
          h.rdv_id,
          h.ancien_statut,
          h.nouveau_statut,
          h.remarque,
          h.date_changement,
          h.utilisateur_id,
          u.nom + ' ' + u.prenom AS utilisateur_nom,
          ISNULL(u.role, 'CLIENT') AS role_nom
        FROM HistoriqueRDV h
        LEFT JOIN Utilisateur u ON h.utilisateur_id = u.id
        WHERE h.rdv_id = @rdvId
        ORDER BY h.date_changement DESC
      `);
    
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    console.error('Erreur getAppointmentHistory:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/appointments/:id/history
 * Ajouter une entrée dans l'historique (automatique lors des changements de statut)
 */
exports.addHistoryEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { ancien_statut, nouveau_statut, remarque } = req.body;
    const userId = req.user.id;
    
    // Validation
    if (!nouveau_statut) {
      return res.status(400).json({ 
        success: false, 
        error: 'Le nouveau statut est requis' 
      });
    }
    
    const pool = await getConnection();
    
    const result = await pool.request()
      .input('rdvId', sql.BigInt, id)
      .input('ancienStatut', sql.VarChar, ancien_statut)
      .input('nouveauStatut', sql.VarChar, nouveau_statut)
      .input('utilisateurId', sql.BigInt, userId)
      .input('remarque', sql.NVarChar, remarque)
      .query(`
        INSERT INTO HistoriqueRDV (
          rdv_id, ancien_statut, nouveau_statut, 
          utilisateur_id, remarque, date_changement
        )
        OUTPUT INSERTED.*
        VALUES (
          @rdvId, @ancienStatut, @nouveauStatut,
          @utilisateurId, @remarque, GETDATE()
        )
      `);
    
    res.status(201).json({ 
      success: true, 
      message: 'Entrée historique ajoutée',
      data: result.recordset[0]
    });
  } catch (error) {
    console.error('Erreur addHistoryEntry:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/appointments/history/recent
 * Récupérer l'historique récent (tous les RDV)
 */
exports.getRecentHistory = async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const pool = await getConnection();
    
    const result = await pool.request()
      .input('limit', sql.Int, parseInt(limit))
      .query(`
        SELECT TOP (@limit)
          h.id,
          h.rdv_id,
          h.ancien_statut,
          h.nouveau_statut,
          h.remarque,
          h.date_changement,
          h.utilisateur_id,
          u.nom + ' ' + u.prenom AS utilisateur_nom,
          ISNULL(u.role, 'CLIENT') AS role_nom,
          rdv.date_heure AS rdv_date,
          c.nom + ' ' + c.prenom AS client_nom
        FROM HistoriqueRDV h
        LEFT JOIN Utilisateur u ON h.utilisateur_id = u.id
        LEFT JOIN RendezVous rdv ON h.rdv_id = rdv.id
        LEFT JOIN Utilisateur c ON rdv.client_id = c.id
        ORDER BY h.date_changement DESC
      `);
    
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    console.error('Erreur getRecentHistory:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/appointments/history/stats
 * Statistiques sur l'historique des rendez-vous
 */
exports.getHistoryStats = async (req, res) => {
  try {
    const pool = await getConnection();
    
    const result = await pool.request().query(`
      SELECT 
        COUNT(*) AS total_changements,
        COUNT(DISTINCT rdv_id) AS rdv_avec_historique,
        COUNT(DISTINCT utilisateur_id) AS utilisateurs_actifs,
        nouveau_statut,
        COUNT(*) AS nombre_par_statut
      FROM HistoriqueRDV
      GROUP BY nouveau_statut
      ORDER BY nombre_par_statut DESC
    `);
    
    const summary = await pool.request().query(`
      SELECT 
        COUNT(*) AS total_changements,
        COUNT(DISTINCT rdv_id) AS rdv_avec_historique,
        COUNT(DISTINCT utilisateur_id) AS utilisateurs_actifs,
        MIN(date_changement) AS premier_changement,
        MAX(date_changement) AS dernier_changement
      FROM HistoriqueRDV
    `);
    
    res.json({ 
      success: true, 
      data: {
        summary: summary.recordset[0],
        by_status: result.recordset
      }
    });
  } catch (error) {
    console.error('Erreur getHistoryStats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/appointments/history/user/:userId
 * Historique des actions d'un utilisateur spécifique
 */
exports.getUserHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 100 } = req.query;
    
    const pool = await getConnection();
    
    const result = await pool.request()
      .input('userId', sql.BigInt, userId)
      .input('limit', sql.Int, parseInt(limit))
      .query(`
        SELECT TOP (@limit)
          h.id,
          h.rdv_id,
          h.ancien_statut,
          h.nouveau_statut,
          h.remarque,
          h.date_changement,
          rdv.date_heure AS rdv_date,
          c.nom + ' ' + c.prenom AS client_nom
        FROM HistoriqueRDV h
        LEFT JOIN RendezVous rdv ON h.rdv_id = rdv.id
        LEFT JOIN Utilisateur c ON rdv.client_id = c.id
        WHERE h.utilisateur_id = @userId
        ORDER BY h.date_changement DESC
      `);
    
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    console.error('Erreur getUserHistory:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * DELETE /api/appointments/:id/history/:historyId
 * Supprimer une entrée d'historique (Admin uniquement)
 */
exports.deleteHistoryEntry = async (req, res) => {
  try {
    const { id, historyId } = req.params;
    const pool = await getConnection();
    
    const result = await pool.request()
      .input('id', sql.BigInt, historyId)
      .input('rdvId', sql.BigInt, id)
      .query(`
        DELETE FROM HistoriqueRDV 
        WHERE id = @id AND rdv_id = @rdvId
      `);
    
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Entrée historique non trouvée' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Entrée historique supprimée'
    });
  } catch (error) {
    console.error('Erreur deleteHistoryEntry:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Fonction utilitaire pour créer automatiquement une entrée d'historique
 * À appeler depuis appointmentController lors des changements de statut
 */
exports.createHistoryEntryAuto = async (rdvId, ancienStatut, nouveauStatut, userId, remarque = null) => {
  try {
    const pool = await getConnection();
    
    await pool.request()
      .input('rdvId', sql.BigInt, rdvId)
      .input('ancienStatut', sql.VarChar, ancienStatut)
      .input('nouveauStatut', sql.VarChar, nouveauStatut)
      .input('utilisateurId', sql.BigInt, userId)
      .input('remarque', sql.NVarChar, remarque)
      .query(`
        INSERT INTO HistoriqueRDV (
          rdv_id, ancien_statut, nouveau_statut, 
          utilisateur_id, remarque, date_changement
        )
        VALUES (
          @rdvId, @ancienStatut, @nouveauStatut,
          @utilisateurId, @remarque, GETDATE()
        )
      `);
    
    return { success: true };
  } catch (error) {
    console.error('Erreur createHistoryEntryAuto:', error);
    return { success: false, error: error.message };
  }
};

/**
 * GET /api/appointments/stats/duration
 * Statistiques de durée des rendez-vous (Agent/Admin/Direction)
 */
exports.getDurationStats = async (req, res) => {
  try {
    const pool = await getConnection();
    
    const result = await pool.request().query(`
      SELECT 
        COUNT(*) AS total_rdv,
        AVG(DATEDIFF(MINUTE, heure_reelle_debut, heure_reelle_fin)) AS duree_moyenne_minutes,
        MIN(DATEDIFF(MINUTE, heure_reelle_debut, heure_reelle_fin)) AS duree_min_minutes,
        MAX(DATEDIFF(MINUTE, heure_reelle_debut, heure_reelle_fin)) AS duree_max_minutes,
        AVG(duree_estimee) AS duree_estimee_moyenne
      FROM RendezVous
      WHERE heure_reelle_debut IS NOT NULL 
        AND heure_reelle_fin IS NOT NULL
        AND statut = 'TERMINE'
    `);
    
    const byType = await pool.request().query(`
      SELECT 
        ti.nom AS type_intervention,
        COUNT(*) AS nombre_rdv,
        AVG(DATEDIFF(MINUTE, rdv.heure_reelle_debut, rdv.heure_reelle_fin)) AS duree_moyenne_minutes
      FROM RendezVous rdv
      INNER JOIN InterventionRDV ir ON rdv.id = ir.rendez_vous_id
      INNER JOIN TypeIntervention ti ON ir.type_intervention_id = ti.id
      WHERE rdv.heure_reelle_debut IS NOT NULL 
        AND rdv.heure_reelle_fin IS NOT NULL
        AND rdv.statut = 'TERMINE'
      GROUP BY ti.nom
      ORDER BY duree_moyenne_minutes DESC
    `);
    
    res.json({ 
      success: true, 
      data: {
        global: result.recordset[0],
        by_type: byType.recordset
      }
    });
  } catch (error) {
    console.error('Erreur getDurationStats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/appointments/cancellations/history
 * Historique des annulations (Agent/Admin/Direction)
 */
exports.getCancellationHistory = async (req, res) => {
  try {
    const { limit = 50, agence_id } = req.query;
    const pool = await getConnection();
    
    let query = `
      SELECT TOP (@limit)
        rdv.id,
        rdv.date_heure,
        rdv.statut,
        rdv.raison_annulation,
        rdv.date_annulation,
        c.nom + ' ' + c.prenom AS client_nom,
        c.telephone AS client_telephone,
        a.nom AS agence_nom,
        u.nom + ' ' + u.prenom AS annule_par
      FROM RendezVous rdv
      LEFT JOIN Utilisateur c ON rdv.client_id = c.id
      LEFT JOIN Agence a ON rdv.agence_id = a.id
      LEFT JOIN Utilisateur u ON rdv.utilisateur_annulation = u.id
      WHERE rdv.statut = 'ANNULE'
    `;
    
    if (agence_id) {
      query += ` AND rdv.agence_id = @agenceId`;
    }
    
    query += ` ORDER BY rdv.date_annulation DESC`;
    
    const request = pool.request().input('limit', sql.Int, parseInt(limit));
    
    if (agence_id) {
      request.input('agenceId', sql.BigInt, agence_id);
    }
    
    const result = await request.query(query);
    
    // Statistiques d'annulation
    const stats = await pool.request().query(`
      SELECT 
        COUNT(*) AS total_annulations,
        COUNT(CASE WHEN DATEDIFF(DAY, date_creation, date_annulation) <= 1 THEN 1 END) AS annulations_24h,
        COUNT(CASE WHEN DATEDIFF(DAY, date_creation, date_annulation) <= 7 THEN 1 END) AS annulations_7j,
        AVG(DATEDIFF(DAY, date_creation, date_annulation)) AS delai_moyen_annulation_jours
      FROM RendezVous
      WHERE statut = 'ANNULE' AND date_annulation IS NOT NULL
    `);
    
    res.json({ 
      success: true, 
      data: {
        cancellations: result.recordset,
        stats: stats.recordset[0]
      }
    });
  } catch (error) {
    console.error('Erreur getCancellationHistory:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
