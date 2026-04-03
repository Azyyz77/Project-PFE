const { getConnection, sql } = require('../config/database');
const { sendWhatsAppMessage } = require('../services/whatsappClient');

/**
 * Controller pour la gestion avancée des rendez-vous
 * Implémente les méthodes manquantes du diagramme de classe
 */

// Modifier un rendez-vous existant
const updateAppointment = async (req, res) => {
  try {
    const appointmentId = parseInt(req.params.id);
    const userId = req.user.id;
    const userRole = req.user.role;
    const { date_heure, agence_id, description, sous_type_ids } = req.body;

    const pool = await getConnection();

    // Vérifier que le RDV existe
    const rdvResult = await pool.request()
      .input('id', sql.BigInt, appointmentId)
      .query(`
        SELECT id, client_id, statut, date_heure
        FROM RendezVous
        WHERE id = @id
      `);

    if (rdvResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Rendez-vous non trouvé' });
    }

    const rdv = rdvResult.recordset[0];

    // Vérifier les permissions
    const isOwner = rdv.client_id === userId;
    const isStaff = ['AGENT', 'ADMIN', 'DIRECTION'].includes(userRole);

    if (!isOwner && !isStaff) {
      return res.status(403).json({ error: 'Non autorisé à modifier ce rendez-vous' });
    }

    // Ne pas permettre la modification des RDV terminés ou annulés
    if (['TERMINE', 'ANNULE', 'NO_SHOW'].includes(rdv.statut)) {
      return res.status(400).json({ 
        error: 'Impossible de modifier un rendez-vous terminé ou annulé' 
      });
    }

    // Vérifier que la nouvelle date n'est pas dans le passé
    if (date_heure) {
      const newDate = new Date(date_heure);
      if (newDate < new Date()) {
        return res.status(400).json({ 
          error: 'La nouvelle date ne peut pas être dans le passé' 
        });
      }
    }

    // Mettre à jour le rendez-vous
    const updateQuery = `
      UPDATE RendezVous
      SET 
        date_heure = COALESCE(@date_heure, date_heure),
        agence_id = COALESCE(@agence_id, agence_id),
        description = COALESCE(@description, description),
        date_modification = GETDATE()
      WHERE id = @id
    `;

    await pool.request()
      .input('id', sql.BigInt, appointmentId)
      .input('date_heure', sql.DateTime2, date_heure || null)
      .input('agence_id', sql.BigInt, agence_id || null)
      .input('description', sql.NVarChar(sql.MAX), description || null)
      .query(updateQuery);

    // Mettre à jour les interventions si fourni
    if (sous_type_ids && Array.isArray(sous_type_ids)) {
      // Supprimer les anciennes interventions
      await pool.request()
        .input('rdv_id', sql.BigInt, appointmentId)
        .query('DELETE FROM InterventionRDV WHERE rdv_id = @rdv_id');

      // Ajouter les nouvelles
      for (const sousTypeId of sous_type_ids) {
        await pool.request()
          .input('rdv_id', sql.BigInt, appointmentId)
          .input('sous_type_id', sql.BigInt, sousTypeId)
          .query(`
            INSERT INTO InterventionRDV (rdv_id, sous_type_id, statut, date_creation)
            VALUES (@rdv_id, @sous_type_id, 'EN_ATTENTE', GETDATE())
          `);
      }
    }

    // Envoyer notification WhatsApp
    try {
      const clientResult = await pool.request()
        .input('client_id', sql.BigInt, rdv.client_id)
        .query('SELECT telephone FROM Utilisateur WHERE id = @client_id');

      if (clientResult.recordset[0]?.telephone) {
        const message = `Votre rendez-vous a été modifié.\n\nNouvelle date: ${new Date(date_heure || rdv.date_heure).toLocaleString('fr-FR')}\n\nMerci.`;
        await sendWhatsAppMessage(clientResult.recordset[0].telephone, message);
      }
    } catch (error) {
      console.warn('Erreur notification WhatsApp:', error);
    }

    return res.json({ 
      message: 'Rendez-vous modifié avec succès',
      appointmentId 
    });
  } catch (error) {
    console.error('Erreur modification rendez-vous:', error);
    return res.status(500).json({ error: 'Erreur lors de la modification du rendez-vous' });
  }
};

// Démarrer un rendez-vous (passage à EN_COURS)
const startAppointment = async (req, res) => {
  try {
    const appointmentId = parseInt(req.params.id);
    const agentId = req.user.id;
    const userRole = req.user.role;

    // Seuls les agents peuvent démarrer un RDV
    if (!['AGENT', 'ADMIN', 'DIRECTION'].includes(userRole)) {
      return res.status(403).json({ error: 'Seuls les agents peuvent démarrer un rendez-vous' });
    }

    const pool = await getConnection();

    // Vérifier que le RDV existe et est planifié/confirmé
    const rdvResult = await pool.request()
      .input('id', sql.BigInt, appointmentId)
      .query(`
        SELECT id, statut, agent_id
        FROM RendezVous
        WHERE id = @id
      `);

    if (rdvResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Rendez-vous non trouvé' });
    }

    const rdv = rdvResult.recordset[0];

    if (!['PLANIFIE', 'CONFIRME'].includes(rdv.statut)) {
      return res.status(400).json({ 
        error: 'Le rendez-vous doit être planifié ou confirmé pour être démarré' 
      });
    }

    // Démarrer le RDV
    await pool.request()
      .input('id', sql.BigInt, appointmentId)
      .input('agent_id', sql.BigInt, agentId)
      .query(`
        UPDATE RendezVous
        SET 
          statut = 'EN_COURS',
          agent_id = @agent_id,
          heure_reelle_debut = GETDATE(),
          date_modification = GETDATE()
        WHERE id = @id
      `);

    // Mettre à jour les interventions
    await pool.request()
      .input('rdv_id', sql.BigInt, appointmentId)
      .query(`
        UPDATE InterventionRDV
        SET 
          statut = 'EN_COURS',
          date_debut = GETDATE()
        WHERE rdv_id = @rdv_id AND statut = 'EN_ATTENTE'
      `);

    return res.json({ 
      message: 'Rendez-vous démarré avec succès',
      appointmentId,
      startedAt: new Date()
    });
  } catch (error) {
    console.error('Erreur démarrage rendez-vous:', error);
    return res.status(500).json({ error: 'Erreur lors du démarrage du rendez-vous' });
  }
};

// Terminer un rendez-vous (passage à TERMINE)
const completeAppointment = async (req, res) => {
  try {
    const appointmentId = parseInt(req.params.id);
    const agentId = req.user.id;
    const userRole = req.user.role;
    const { commentaire, cout_reel } = req.body;

    // Seuls les agents peuvent terminer un RDV
    if (!['AGENT', 'ADMIN', 'DIRECTION'].includes(userRole)) {
      return res.status(403).json({ error: 'Seuls les agents peuvent terminer un rendez-vous' });
    }

    const pool = await getConnection();

    // Vérifier que le RDV existe et est en cours
    const rdvResult = await pool.request()
      .input('id', sql.BigInt, appointmentId)
      .query(`
        SELECT id, statut, heure_reelle_debut
        FROM RendezVous
        WHERE id = @id
      `);

    if (rdvResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Rendez-vous non trouvé' });
    }

    const rdv = rdvResult.recordset[0];

    if (rdv.statut !== 'EN_COURS') {
      return res.status(400).json({ 
        error: 'Le rendez-vous doit être en cours pour être terminé' 
      });
    }

    // Terminer le RDV
    await pool.request()
      .input('id', sql.BigInt, appointmentId)
      .query(`
        UPDATE RendezVous
        SET 
          statut = 'TERMINE',
          heure_reelle_fin = GETDATE(),
          date_modification = GETDATE()
        WHERE id = @id
      `);

    // Terminer les interventions
    await pool.request()
      .input('rdv_id', sql.BigInt, appointmentId)
      .input('commentaire', sql.NVarChar(sql.MAX), commentaire || null)
      .input('cout_reel', sql.Decimal(10, 3), cout_reel || null)
      .query(`
        UPDATE InterventionRDV
        SET 
          statut = 'TERMINEE',
          date_fin = GETDATE(),
          commentaire = COALESCE(@commentaire, commentaire),
          cout_reel = COALESCE(@cout_reel, cout_reel),
          duree_reelle = DATEDIFF(MINUTE, date_debut, GETDATE())
        WHERE rdv_id = @rdv_id AND statut = 'EN_COURS'
      `);

    // Calculer la durée réelle
    const dureeResult = await pool.request()
      .input('id', sql.BigInt, appointmentId)
      .query(`
        SELECT 
          DATEDIFF(MINUTE, heure_reelle_debut, heure_reelle_fin) AS duree_reelle_minutes
        FROM RendezVous
        WHERE id = @id
      `);

    const dureeReelle = dureeResult.recordset[0]?.duree_reelle_minutes || 0;

    // Envoyer notification WhatsApp
    try {
      const clientResult = await pool.request()
        .input('id', sql.BigInt, appointmentId)
        .query(`
          SELECT u.telephone, u.prenom
          FROM RendezVous r
          JOIN Utilisateur u ON u.id = r.client_id
          WHERE r.id = @id
        `);

      if (clientResult.recordset[0]?.telephone) {
        const { telephone, prenom } = clientResult.recordset[0];
        const message = `Bonjour ${prenom},\n\nVotre véhicule est prêt! 🚗✨\n\nVous pouvez venir le récupérer.\n\nMerci de votre confiance.`;
        await sendWhatsAppMessage(telephone, message);
      }
    } catch (error) {
      console.warn('Erreur notification WhatsApp:', error);
    }

    return res.json({ 
      message: 'Rendez-vous terminé avec succès',
      appointmentId,
      completedAt: new Date(),
      dureeReelle: `${dureeReelle} minutes`
    });
  } catch (error) {
    console.error('Erreur fin rendez-vous:', error);
    return res.status(500).json({ error: 'Erreur lors de la fin du rendez-vous' });
  }
};

// Confirmer un rendez-vous (passage à CONFIRME)
const confirmAppointment = async (req, res) => {
  try {
    const appointmentId = parseInt(req.params.id);
    const userRole = req.user.role;

    // Seuls les agents peuvent confirmer un RDV
    if (!['AGENT', 'ADMIN', 'DIRECTION'].includes(userRole)) {
      return res.status(403).json({ error: 'Seuls les agents peuvent confirmer un rendez-vous' });
    }

    const pool = await getConnection();

    // Vérifier que le RDV existe et est planifié
    const rdvResult = await pool.request()
      .input('id', sql.BigInt, appointmentId)
      .query(`
        SELECT id, statut, client_id
        FROM RendezVous
        WHERE id = @id
      `);

    if (rdvResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Rendez-vous non trouvé' });
    }

    const rdv = rdvResult.recordset[0];

    if (rdv.statut !== 'PLANIFIE') {
      return res.status(400).json({ 
        error: 'Seuls les rendez-vous planifiés peuvent être confirmés' 
      });
    }

    // Confirmer le RDV
    await pool.request()
      .input('id', sql.BigInt, appointmentId)
      .query(`
        UPDATE RendezVous
        SET 
          statut = 'CONFIRME',
          date_modification = GETDATE()
        WHERE id = @id
      `);

    // Envoyer notification WhatsApp
    try {
      const clientResult = await pool.request()
        .input('client_id', sql.BigInt, rdv.client_id)
        .query('SELECT telephone, prenom FROM Utilisateur WHERE id = @client_id');

      if (clientResult.recordset[0]?.telephone) {
        const { telephone, prenom } = clientResult.recordset[0];
        const message = `Bonjour ${prenom},\n\nVotre rendez-vous a été confirmé! ✅\n\nNous vous attendons.\n\nMerci.`;
        await sendWhatsAppMessage(telephone, message);
      }
    } catch (error) {
      console.warn('Erreur notification WhatsApp:', error);
    }

    return res.json({ 
      message: 'Rendez-vous confirmé avec succès',
      appointmentId
    });
  } catch (error) {
    console.error('Erreur confirmation rendez-vous:', error);
    return res.status(500).json({ error: 'Erreur lors de la confirmation du rendez-vous' });
  }
};

module.exports = {
  updateAppointment,
  startAppointment,
  completeAppointment,
  confirmAppointment
};
