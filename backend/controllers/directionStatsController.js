const { getConnection, sql } = require('../config/database');

/**
 * Contrôleur pour les statistiques de direction
 * Fournit des statistiques avancées pour la prise de décision stratégique
 */

/**
 * Obtenir les statistiques par agence
 * Utilise la vue VW_StatsAgence
 */
const getAgencyStats = async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool.request().query(`
      SELECT 
        agence_id,
        agence_nom,
        ville,
        total_rdv,
        rdv_termines,
        rdv_annules,
        rdv_no_show,
        duree_moy_min,
        CASE 
          WHEN total_rdv > 0 
          THEN CAST(rdv_termines AS FLOAT) / total_rdv * 100 
          ELSE 0 
        END AS taux_completion,
        CASE 
          WHEN total_rdv > 0 
          THEN CAST(rdv_annules AS FLOAT) / total_rdv * 100 
          ELSE 0 
        END AS taux_annulation
      FROM VW_StatsAgence
      ORDER BY total_rdv DESC
    `);

    res.json({
      success: true,
      data: result.recordset
    });
  } catch (error) {
    console.error('Erreur récupération stats agences:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des statistiques par agence',
      message: error.message
    });
  }
};

/**
 * Obtenir les statistiques globales avec filtres de date
 */
const getGlobalStats = async (req, res) => {
  try {
    const { dateDebut, dateFin } = req.query;
    const pool = await getConnection();

    const request = pool.request();

    // Construire la clause WHERE pour les dates
    let dateFilter = '';
    if (dateDebut && dateFin) {
      request.input('dateDebut', sql.Date, dateDebut);
      request.input('dateFin', sql.Date, dateFin);
      dateFilter = 'WHERE r.date_heure BETWEEN @dateDebut AND @dateFin';
    } else if (dateDebut) {
      request.input('dateDebut', sql.Date, dateDebut);
      dateFilter = 'WHERE r.date_heure >= @dateDebut';
    } else if (dateFin) {
      request.input('dateFin', sql.Date, dateFin);
      dateFilter = 'WHERE r.date_heure <= @dateFin';
    }

    // Statistiques globales
    const globalResult = await request.query(`
      SELECT 
        COUNT(DISTINCT r.id) AS total_rdv,
        COUNT(DISTINCT r.client_id) AS total_clients,
        COUNT(DISTINCT r.vehicule_id) AS total_vehicules,
        COUNT(DISTINCT r.agence_id) AS total_agences,
        SUM(CASE WHEN r.statut = 'TERMINE' THEN 1 ELSE 0 END) AS rdv_termines,
        SUM(CASE WHEN r.statut = 'ANNULE' THEN 1 ELSE 0 END) AS rdv_annules,
        SUM(CASE WHEN r.statut = 'EN_ATTENTE' THEN 1 ELSE 0 END) AS rdv_en_attente,
        SUM(CASE WHEN r.statut = 'CONFIRME' THEN 1 ELSE 0 END) AS rdv_confirmes,
        AVG(DATEDIFF(MINUTE, r.heure_reelle_debut, r.heure_reelle_fin)) AS duree_moyenne_min
      FROM RendezVous r
      ${dateFilter}
    `);

    // Statistiques par statut - créer un nouveau request avec les mêmes paramètres
    const request2 = pool.request();
    if (dateDebut) request2.input('dateDebut', sql.Date, dateDebut);
    if (dateFin) request2.input('dateFin', sql.Date, dateFin);
    
    const statutResult = await request2.query(`
      WITH TotalRdv AS (
        SELECT COUNT(*) AS total FROM RendezVous r ${dateFilter}
      )
      SELECT 
        r.statut,
        COUNT(*) AS count,
        CAST(COUNT(*) AS FLOAT) / (SELECT total FROM TotalRdv) * 100 AS pourcentage
      FROM RendezVous r
      ${dateFilter}
      GROUP BY r.statut
      ORDER BY count DESC
    `);

    // Évolution mensuelle - créer un nouveau request avec les mêmes paramètres
    const request3 = pool.request();
    if (dateDebut) request3.input('dateDebut', sql.Date, dateDebut);
    if (dateFin) request3.input('dateFin', sql.Date, dateFin);
    
    const evolutionResult = await request3.query(`
      SELECT 
        YEAR(r.date_heure) AS annee,
        MONTH(r.date_heure) AS mois,
        COUNT(*) AS total_rdv,
        SUM(CASE WHEN r.statut = 'TERMINE' THEN 1 ELSE 0 END) AS rdv_termines
      FROM RendezVous r
      ${dateFilter}
      GROUP BY YEAR(r.date_heure), MONTH(r.date_heure)
      ORDER BY annee DESC, mois DESC
    `);

    res.json({
      success: true,
      data: {
        global: globalResult.recordset[0],
        par_statut: statutResult.recordset,
        evolution_mensuelle: evolutionResult.recordset
      }
    });
  } catch (error) {
    console.error('Erreur récupération stats globales:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des statistiques globales',
      message: error.message
    });
  }
};

/**
 * Obtenir les statistiques de revenus
 * CORRIGÉ: Utilise les montants réels des factures au lieu des prix du catalogue
 */
const getRevenueStats = async (req, res) => {
  try {
    const { dateDebut, dateFin, agenceId } = req.query;
    const pool = await getConnection();

    const request = pool.request();

    // Construire les filtres
    let filters = [];
    if (dateDebut && dateFin) {
      request.input('dateDebut', sql.Date, dateDebut);
      request.input('dateFin', sql.Date, dateFin);
      filters.push('f.date_emission BETWEEN @dateDebut AND @dateFin');
    }
    if (agenceId) {
      request.input('agenceId', sql.BigInt, agenceId);
      filters.push('c.agence_id = @agenceId');
    }

    const whereClause = filters.length > 0 ? 'WHERE ' + filters.join(' AND ') : '';

    // Vérifier d'abord si les tables existent et ont des données
    const checkResult = await pool.request().query(`
      SELECT 
        (SELECT COUNT(*) FROM Facture) AS nb_factures,
        (SELECT COUNT(*) FROM CommandeReparation) AS nb_commandes
    `);

    console.log('📊 Vérification des données:', checkResult.recordset[0]);

    // Revenus globaux (basés sur les factures réelles)
    const revenueResult = await request.query(`
      SELECT 
        COUNT(f.id) AS total_factures,
        SUM(ISNULL(f.montant_ttc, 0)) AS revenu_total,
        AVG(ISNULL(f.montant_ttc, 0)) AS revenu_moyen,
        MIN(ISNULL(f.montant_ttc, 0)) AS revenu_min,
        MAX(ISNULL(f.montant_ttc, 0)) AS revenu_max,
        SUM(CASE WHEN f.statut = 'PAYEE' THEN ISNULL(f.montant_ttc, 0) ELSE 0 END) AS revenu_paye,
        SUM(CASE WHEN f.statut IN ('EMISE', 'ENVOYEE') THEN ISNULL(f.montant_ttc, 0) ELSE 0 END) AS revenu_impaye
      FROM Facture f
      LEFT JOIN CommandeReparation c ON f.commande_id = c.id
      ${whereClause}
    `);

    // Revenus par agence (basés sur les factures) - créer un nouveau request avec les mêmes paramètres
    const request2 = pool.request();
    if (dateDebut) request2.input('dateDebut', sql.Date, dateDebut);
    if (dateFin) request2.input('dateFin', sql.Date, dateFin);
    if (agenceId) request2.input('agenceId', sql.BigInt, agenceId);
    
    const revenueByAgencyResult = await request2.query(`
      SELECT 
        ag.id AS agence_id,
        ag.nom AS agence_nom,
        COUNT(f.id) AS total_factures,
        SUM(ISNULL(f.montant_ttc, 0)) AS revenu_total,
        AVG(ISNULL(f.montant_ttc, 0)) AS revenu_moyen,
        SUM(CASE WHEN f.statut = 'PAYEE' THEN ISNULL(f.montant_ttc, 0) ELSE 0 END) AS revenu_paye
      FROM Agence ag
      LEFT JOIN CommandeReparation c ON c.agence_id = ag.id
      LEFT JOIN Facture f ON f.commande_id = c.id ${filters.length > 0 ? 'AND ' + filters.join(' AND ') : ''}
      GROUP BY ag.id, ag.nom
      HAVING COUNT(f.id) > 0
      ORDER BY revenu_total DESC
    `);

    // Revenus par type d'intervention - DÉSACTIVÉ car table LigneCommandeReparation n'existe pas
    // Cette fonctionnalité sera ajoutée plus tard quand la table sera créée
    const revenueByTypeResult = { recordset: [] };

    // Évolution mensuelle des revenus (basés sur les factures) - créer un nouveau request avec les mêmes paramètres
    const request3 = pool.request();
    if (dateDebut) request3.input('dateDebut', sql.Date, dateDebut);
    if (dateFin) request3.input('dateFin', sql.Date, dateFin);
    if (agenceId) request3.input('agenceId', sql.BigInt, agenceId);
    
    const monthlyRevenueResult = await request3.query(`
      SELECT 
        YEAR(f.date_emission) AS annee,
        MONTH(f.date_emission) AS mois,
        COUNT(f.id) AS total_factures,
        SUM(ISNULL(f.montant_ttc, 0)) AS revenu_total,
        SUM(CASE WHEN f.statut = 'PAYEE' THEN ISNULL(f.montant_ttc, 0) ELSE 0 END) AS revenu_paye
      FROM Facture f
      LEFT JOIN CommandeReparation c ON f.commande_id = c.id
      ${whereClause}
      GROUP BY YEAR(f.date_emission), MONTH(f.date_emission)
      ORDER BY annee DESC, mois DESC
    `);

    res.json({
      success: true,
      data: {
        global: revenueResult.recordset[0],
        par_agence: revenueByAgencyResult.recordset,
        par_type_intervention: revenueByTypeResult.recordset,
        evolution_mensuelle: monthlyRevenueResult.recordset
      }
    });
  } catch (error) {
    console.error('Erreur récupération stats revenus:', error);
    
    // Message d'erreur plus détaillé
    let errorMessage = 'Erreur lors de la récupération des statistiques de revenus';
    if (error.message.includes('Invalid column name')) {
      errorMessage += ' - Colonne manquante dans la base de données. Veuillez exécuter la migration fix_facture_revenue_columns.sql';
    } else if (error.message.includes('Invalid object name')) {
      errorMessage += ' - Table manquante. Veuillez vérifier que les tables Facture et CommandeReparation existent';
    }
    
    res.status(500).json({
      error: errorMessage,
      message: error.message,
      details: error.toString()
    });
  }
};

/**
 * Obtenir les statistiques de satisfaction client
 */
const getSatisfactionStats = async (req, res) => {
  try {
    const { dateDebut, dateFin, agenceId } = req.query;
    const pool = await getConnection();

    const request = pool.request();

    // Construire les filtres
    let filters = [];
    if (dateDebut && dateFin) {
      request.input('dateDebut', sql.Date, dateDebut);
      request.input('dateFin', sql.Date, dateFin);
      filters.push('f.date_feedback BETWEEN @dateDebut AND @dateFin');
    }
    if (agenceId) {
      request.input('agenceId', sql.BigInt, agenceId);
      filters.push('r.agence_id = @agenceId');
    }

    const whereClause = filters.length > 0 ? 'WHERE ' + filters.join(' AND ') : '';

    // Satisfaction globale
    const satisfactionResult = await request.query(`
      SELECT 
        COUNT(f.id) AS total_feedbacks,
        AVG(CAST(f.note AS FLOAT)) AS note_moyenne,
        SUM(CASE WHEN f.note >= 4 THEN 1 ELSE 0 END) AS feedbacks_positifs,
        SUM(CASE WHEN f.note = 3 THEN 1 ELSE 0 END) AS feedbacks_neutres,
        SUM(CASE WHEN f.note <= 2 THEN 1 ELSE 0 END) AS feedbacks_negatifs,
        CASE 
          WHEN COUNT(f.id) > 0 
          THEN CAST(SUM(CASE WHEN f.note >= 4 THEN 1 ELSE 0 END) AS FLOAT) / COUNT(f.id) * 100 
          ELSE 0 
        END AS taux_satisfaction
      FROM Feedback f
      LEFT JOIN RendezVous r ON f.appointment_id = r.id
      ${whereClause}
    `);

    // Satisfaction par agence - créer un nouveau request avec les mêmes paramètres
    const request2 = pool.request();
    if (dateDebut) request2.input('dateDebut', sql.Date, dateDebut);
    if (dateFin) request2.input('dateFin', sql.Date, dateFin);
    if (agenceId) request2.input('agenceId', sql.BigInt, agenceId);
    
    const satisfactionByAgencyResult = await request2.query(`
      SELECT 
        ag.id AS agence_id,
        ag.nom AS agence_nom,
        COUNT(f.id) AS total_feedbacks,
        AVG(CAST(f.note AS FLOAT)) AS note_moyenne,
        SUM(CASE WHEN f.note >= 4 THEN 1 ELSE 0 END) AS feedbacks_positifs
      FROM Agence ag
      LEFT JOIN RendezVous r ON r.agence_id = ag.id
      LEFT JOIN Feedback f ON f.appointment_id = r.id ${filters.length > 0 ? 'AND ' + filters.join(' AND ') : ''}
      GROUP BY ag.id, ag.nom
      HAVING COUNT(f.id) > 0
      ORDER BY note_moyenne DESC
    `);

    // Distribution des notes - créer un nouveau request avec les mêmes paramètres
    const request3 = pool.request();
    if (dateDebut) request3.input('dateDebut', sql.Date, dateDebut);
    if (dateFin) request3.input('dateFin', sql.Date, dateFin);
    if (agenceId) request3.input('agenceId', sql.BigInt, agenceId);
    
    const distributionResult = await request3.query(`
      WITH TotalFeedback AS (
        SELECT COUNT(*) AS total 
        FROM Feedback f 
        LEFT JOIN RendezVous r ON f.appointment_id = r.id 
        ${whereClause}
      )
      SELECT 
        f.note,
        COUNT(*) AS count,
        CAST(COUNT(*) AS FLOAT) / (SELECT total FROM TotalFeedback) * 100 AS pourcentage
      FROM Feedback f
      LEFT JOIN RendezVous r ON f.appointment_id = r.id
      ${whereClause}
      GROUP BY f.note
      ORDER BY f.note DESC
    `);

    // Réclamations - créer un nouveau request avec les mêmes paramètres
    const request4 = pool.request();
    if (dateDebut) request4.input('dateDebut', sql.Date, dateDebut);
    if (dateFin) request4.input('dateFin', sql.Date, dateFin);
    if (agenceId) request4.input('agenceId', sql.BigInt, agenceId);
    
    const complaintsResult = await request4.query(`
      SELECT 
        COUNT(c.id) AS total_reclamations,
        SUM(CASE WHEN c.statut = 'RESOLU' THEN 1 ELSE 0 END) AS reclamations_resolues,
        SUM(CASE WHEN c.statut = 'EN_COURS' THEN 1 ELSE 0 END) AS reclamations_en_cours,
        SUM(CASE WHEN c.statut = 'NOUVEAU' THEN 1 ELSE 0 END) AS reclamations_nouvelles,
        AVG(DATEDIFF(DAY, c.date_soumission, ISNULL(c.date_cloture, GETDATE()))) AS delai_moyen_resolution_jours
      FROM Reclamation c
      LEFT JOIN RendezVous r ON c.appointment_id = r.id
      ${whereClause.replace('f.date_feedback', 'c.date_soumission')}
    `);

    res.json({
      success: true,
      data: {
        satisfaction: satisfactionResult.recordset[0],
        par_agence: satisfactionByAgencyResult.recordset,
        distribution_notes: distributionResult.recordset,
        reclamations: complaintsResult.recordset[0]
      }
    });
  } catch (error) {
    console.error('Erreur récupération stats satisfaction:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des statistiques de satisfaction',
      message: error.message
    });
  }
};

/**
 * Obtenir les statistiques de performance des agents
 */
const getPerformanceStats = async (req, res) => {
  try {
    const { dateDebut, dateFin, agenceId } = req.query;
    const pool = await getConnection();

    const request = pool.request();

    // Construire les filtres
    let filters = [];
    if (dateDebut && dateFin) {
      request.input('dateDebut', sql.Date, dateDebut);
      request.input('dateFin', sql.Date, dateFin);
      filters.push('r.date_heure BETWEEN @dateDebut AND @dateFin');
    }
    if (agenceId) {
      request.input('agenceId', sql.BigInt, agenceId);
      filters.push('u.agence_id = @agenceId');
    }

    const whereClause = filters.length > 0 ? 'WHERE ' + filters.join(' AND ') : '';

    // Performance par agent
    const agentPerformanceResult = await request.query(`
      SELECT 
        u.id AS agent_id,
        u.prenom + ' ' + u.nom AS agent_nom,
        ag.nom AS agence_nom,
        COUNT(DISTINCT r.id) AS total_rdv,
        SUM(CASE WHEN r.statut = 'TERMINE' THEN 1 ELSE 0 END) AS rdv_termines,
        AVG(DATEDIFF(MINUTE, r.heure_reelle_debut, r.heure_reelle_fin)) AS duree_moyenne_min,
        AVG(CAST(f.note AS FLOAT)) AS note_moyenne,
        COUNT(DISTINCT f.id) AS total_feedbacks
      FROM Utilisateur u
      LEFT JOIN Agence ag ON u.agence_id = ag.id
      LEFT JOIN RendezVous r ON r.agent_id = u.id ${filters.length > 0 ? 'AND ' + filters.join(' AND ') : ''}
      LEFT JOIN Feedback f ON f.appointment_id = r.id
      WHERE u.role = 'AGENT'
      GROUP BY u.id, u.prenom, u.nom, ag.nom
      HAVING COUNT(DISTINCT r.id) > 0
      ORDER BY rdv_termines DESC
    `);

    // Top agents par satisfaction - créer un nouveau request avec les mêmes paramètres
    const request2 = pool.request();
    if (dateDebut) request2.input('dateDebut', sql.Date, dateDebut);
    if (dateFin) request2.input('dateFin', sql.Date, dateFin);
    if (agenceId) request2.input('agenceId', sql.BigInt, agenceId);
    
    const topAgentsResult = await request2.query(`
      SELECT TOP 10
        u.id AS agent_id,
        u.prenom + ' ' + u.nom AS agent_nom,
        ag.nom AS agence_nom,
        AVG(CAST(f.note AS FLOAT)) AS note_moyenne,
        COUNT(f.id) AS total_feedbacks
      FROM Utilisateur u
      LEFT JOIN Agence ag ON u.agence_id = ag.id
      LEFT JOIN RendezVous r ON r.agent_id = u.id ${filters.length > 0 ? 'AND ' + filters.join(' AND ') : ''}
      LEFT JOIN Feedback f ON f.appointment_id = r.id
      WHERE u.role = 'AGENT'
      GROUP BY u.id, u.prenom, u.nom, ag.nom
      HAVING COUNT(f.id) >= 5
      ORDER BY note_moyenne DESC
    `);

    // Charge de travail par agent - créer un nouveau request avec les mêmes paramètres
    const request3 = pool.request();
    if (dateDebut) request3.input('dateDebut', sql.Date, dateDebut);
    if (dateFin) request3.input('dateFin', sql.Date, dateFin);
    if (agenceId) request3.input('agenceId', sql.BigInt, agenceId);
    
    const workloadResult = await request3.query(`
      SELECT 
        u.id AS agent_id,
        u.prenom + ' ' + u.nom AS agent_nom,
        COUNT(DISTINCT r.id) AS total_rdv,
        SUM(DATEDIFF(MINUTE, r.heure_reelle_debut, r.heure_reelle_fin)) AS total_minutes_travail,
        AVG(DATEDIFF(MINUTE, r.heure_reelle_debut, r.heure_reelle_fin)) AS duree_moyenne_min
      FROM Utilisateur u
      LEFT JOIN RendezVous r ON r.agent_id = u.id ${filters.length > 0 ? 'AND ' + filters.join(' AND ') : ''}
      WHERE u.role = 'AGENT'
        AND r.heure_reelle_debut IS NOT NULL 
        AND r.heure_reelle_fin IS NOT NULL
      GROUP BY u.id, u.prenom, u.nom
      ORDER BY total_minutes_travail DESC
    `);

    res.json({
      success: true,
      data: {
        performance_agents: agentPerformanceResult.recordset,
        top_agents: topAgentsResult.recordset,
        charge_travail: workloadResult.recordset
      }
    });
  } catch (error) {
    console.error('Erreur récupération stats performance:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des statistiques de performance',
      message: error.message
    });
  }
};

/**
 * Exporter les statistiques dans différents formats
 */
const exportStats = async (req, res) => {
  try {
    const { format = 'json', type, dateDebut, dateFin } = req.query;

    // Pour l'instant, on supporte uniquement JSON
    // CSV et Excel peuvent être ajoutés plus tard
    if (format !== 'json') {
      return res.status(400).json({
        error: 'Format non supporté',
        message: 'Seul le format JSON est actuellement supporté'
      });
    }

    let data;

    switch (type) {
      case 'agencies':
        const agenciesReq = { query: {} };
        const agenciesRes = { json: (d) => { data = d; } };
        await getAgencyStats(agenciesReq, agenciesRes);
        break;

      case 'global':
        const globalReq = { query: { dateDebut, dateFin } };
        const globalRes = { json: (d) => { data = d; } };
        await getGlobalStats(globalReq, globalRes);
        break;

      case 'revenue':
        const revenueReq = { query: { dateDebut, dateFin } };
        const revenueRes = { json: (d) => { data = d; } };
        await getRevenueStats(revenueReq, revenueRes);
        break;

      case 'satisfaction':
        const satisfactionReq = { query: { dateDebut, dateFin } };
        const satisfactionRes = { json: (d) => { data = d; } };
        await getSatisfactionStats(satisfactionReq, satisfactionRes);
        break;

      case 'performance':
        const performanceReq = { query: { dateDebut, dateFin } };
        const performanceRes = { json: (d) => { data = d; } };
        await getPerformanceStats(performanceReq, performanceRes);
        break;

      default:
        return res.status(400).json({
          error: 'Type invalide',
          message: 'Type doit être: agencies, global, revenue, satisfaction, ou performance'
        });
    }

    // Ajouter les métadonnées d'export
    const exportData = {
      ...data,
      export_info: {
        date_export: new Date().toISOString(),
        type,
        format,
        filters: { dateDebut, dateFin }
      }
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="stats_${type}_${Date.now()}.json"`);
    res.json(exportData);
  } catch (error) {
    console.error('Erreur export stats:', error);
    res.status(500).json({
      error: 'Erreur lors de l\'export des statistiques',
      message: error.message
    });
  }
};

/**
 * Obtenir les statistiques de facturation
 */
const getBillingStats = async (req, res) => {
  try {
    const { dateDebut, dateFin, agenceId } = req.query;
    const pool = await getConnection();

    const request = pool.request();

    // Construire les filtres
    let filters = [];
    if (dateDebut && dateFin) {
      request.input('dateDebut', sql.Date, dateDebut);
      request.input('dateFin', sql.Date, dateFin);
      filters.push('f.date_emission BETWEEN @dateDebut AND @dateFin');
    }
    if (agenceId) {
      request.input('agenceId', sql.BigInt, agenceId);
      filters.push('c.agence_id = @agenceId');
    }

    const whereClause = filters.length > 0 ? 'WHERE ' + filters.join(' AND ') : '';

    // Statistiques globales de facturation
    const billingResult = await request.query(`
      SELECT 
        COUNT(f.id) AS total_factures,
        SUM(CASE WHEN f.statut = 'PAYEE' THEN 1 ELSE 0 END) AS factures_payees,
        SUM(CASE WHEN f.statut IN ('EMISE', 'ENVOYEE') THEN 1 ELSE 0 END) AS factures_impayees,
        SUM(CASE WHEN f.statut = 'ANNULEE' THEN 1 ELSE 0 END) AS factures_annulees,
        SUM(ISNULL(f.montant_ttc, 0)) AS montant_total,
        SUM(CASE WHEN f.statut = 'PAYEE' THEN ISNULL(f.montant_ttc, 0) ELSE 0 END) AS montant_paye,
        SUM(CASE WHEN f.statut IN ('EMISE', 'ENVOYEE') THEN ISNULL(f.montant_ttc, 0) ELSE 0 END) AS montant_impaye,
        AVG(ISNULL(f.montant_ttc, 0)) AS montant_moyen,
        CASE 
          WHEN COUNT(f.id) > 0 
          THEN CAST(SUM(CASE WHEN f.statut = 'PAYEE' THEN 1 ELSE 0 END) AS FLOAT) / COUNT(f.id) * 100 
          ELSE 0 
        END AS taux_paiement
      FROM Facture f
      LEFT JOIN CommandeReparation c ON f.commande_id = c.id
      ${whereClause}
    `);

    // Facturation par agence - créer un nouveau request avec les mêmes paramètres
    const request2 = pool.request();
    if (dateDebut) request2.input('dateDebut', sql.Date, dateDebut);
    if (dateFin) request2.input('dateFin', sql.Date, dateFin);
    if (agenceId) request2.input('agenceId', sql.BigInt, agenceId);
    
    const billingByAgencyResult = await request2.query(`
      SELECT 
        ag.id AS agence_id,
        ag.nom AS agence_nom,
        COUNT(f.id) AS total_factures,
        SUM(ISNULL(f.montant_ttc, 0)) AS montant_total,
        SUM(CASE WHEN f.statut = 'PAYEE' THEN ISNULL(f.montant_ttc, 0) ELSE 0 END) AS montant_paye,
        CASE 
          WHEN COUNT(f.id) > 0 
          THEN CAST(SUM(CASE WHEN f.statut = 'PAYEE' THEN 1 ELSE 0 END) AS FLOAT) / COUNT(f.id) * 100 
          ELSE 0 
        END AS taux_paiement
      FROM Agence ag
      LEFT JOIN CommandeReparation c ON c.agence_id = ag.id
      LEFT JOIN Facture f ON f.commande_id = c.id ${filters.length > 0 ? 'AND ' + filters.join(' AND ') : ''}
      GROUP BY ag.id, ag.nom
      HAVING COUNT(f.id) > 0
      ORDER BY montant_total DESC
    `);

    // Évolution mensuelle de la facturation - créer un nouveau request avec les mêmes paramètres
    const request3 = pool.request();
    if (dateDebut) request3.input('dateDebut', sql.Date, dateDebut);
    if (dateFin) request3.input('dateFin', sql.Date, dateFin);
    if (agenceId) request3.input('agenceId', sql.BigInt, agenceId);
    
    const monthlyBillingResult = await request3.query(`
      SELECT 
        YEAR(f.date_emission) AS annee,
        MONTH(f.date_emission) AS mois,
        COUNT(f.id) AS total_factures,
        SUM(ISNULL(f.montant_ttc, 0)) AS montant_total,
        SUM(CASE WHEN f.statut = 'PAYEE' THEN ISNULL(f.montant_ttc, 0) ELSE 0 END) AS montant_paye
      FROM Facture f
      LEFT JOIN CommandeReparation c ON f.commande_id = c.id
      ${whereClause}
      GROUP BY YEAR(f.date_emission), MONTH(f.date_emission)
      ORDER BY annee DESC, mois DESC
    `);

    // Modes de paiement - créer un nouveau request avec les mêmes paramètres
    const request4 = pool.request();
    if (dateDebut) request4.input('dateDebut', sql.Date, dateDebut);
    if (dateFin) request4.input('dateFin', sql.Date, dateFin);
    if (agenceId) request4.input('agenceId', sql.BigInt, agenceId);
    
    const paymentMethodsResult = await request4.query(`
      SELECT 
        ISNULL(f.mode_paiement, 'Non spécifié') AS mode_paiement,
        COUNT(f.id) AS count,
        SUM(ISNULL(f.montant_ttc, 0)) AS montant_total
      FROM Facture f
      LEFT JOIN CommandeReparation c ON f.commande_id = c.id
      ${whereClause}
        AND f.statut = 'PAYEE'
      GROUP BY f.mode_paiement
      ORDER BY montant_total DESC
    `);

    res.json({
      success: true,
      data: {
        global: billingResult.recordset[0],
        par_agence: billingByAgencyResult.recordset,
        evolution_mensuelle: monthlyBillingResult.recordset,
        modes_paiement: paymentMethodsResult.recordset
      }
    });
  } catch (error) {
    console.error('Erreur récupération stats facturation:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des statistiques de facturation',
      message: error.message
    });
  }
};

module.exports = {
  getAgencyStats,
  getGlobalStats,
  getRevenueStats,
  getSatisfactionStats,
  getPerformanceStats,
  getBillingStats,
  exportStats
};
