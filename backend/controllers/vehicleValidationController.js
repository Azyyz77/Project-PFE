const { getConnection, sql } = require('../config/database');
const { sendWhatsAppMessage } = require('../services/whatsappClient');

/**
 * Obtenir tous les véhicules en attente de validation
 */
const getPendingVehicles = async (req, res) => {
  try {
    const pool = await getConnection();
    
    const result = await pool.request().query(`
      SELECT 
        v.id,
        v.immatriculation,
        v.numero_chassis,
        v.couleur,
        v.annee,
        v.date_ajout,
        v.statut_validation,
        v.image_vehicule,
        v.image_carte_grise,
        c.id AS client_id,
        c.nom + ' ' + c.prenom AS client_nom,
        c.telephone AS client_telephone,
        c.email AS client_email,
        ma.nom AS marque,
        mo.nom AS modele,
        ve.nom AS version_nom,
        ve.motorisation,
        ve.transmission
      FROM Vehicule v
      JOIN Utilisateur c ON c.id = v.client_id
      JOIN Version ve ON ve.id = v.version_id
      JOIN Modele mo ON mo.id = ve.modele_id
      JOIN Marque ma ON ma.id = mo.marque_id
      WHERE v.statut_validation = 'EN_ATTENTE'
      ORDER BY v.date_ajout ASC
    `);

    res.json({
      count: result.recordset.length,
      vehicles: result.recordset
    });
  } catch (error) {
    console.error('Erreur récupération véhicules en attente:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des véhicules',
      message: error.message 
    });
  }
};

/**
 * Obtenir tous les véhicules (avec filtres)
 */
const getAllVehicles = async (req, res) => {
  try {
    const { statut, client_id } = req.query;
    const pool = await getConnection();
    
    let query = `
      SELECT 
        v.id,
        v.immatriculation,
        v.numero_chassis,
        v.couleur,
        v.annee,
        v.date_ajout,
        v.statut_validation,
        v.date_validation,
        v.image_vehicule,
        v.image_carte_grise,
        c.id AS client_id,
        c.nom + ' ' + c.prenom AS client_nom,
        c.telephone AS client_telephone,
        c.email AS client_email,
        ma.nom AS marque,
        mo.nom AS modele,
        ve.nom AS version_nom,
        ve.motorisation,
        ve.transmission,
        agent.nom + ' ' + agent.prenom AS agent_validation_nom
      FROM Vehicule v
      JOIN Utilisateur c ON c.id = v.client_id
      JOIN Version ve ON ve.id = v.version_id
      JOIN Modele mo ON mo.id = ve.modele_id
      JOIN Marque ma ON ma.id = mo.marque_id
      LEFT JOIN Utilisateur agent ON agent.id = v.agent_validation_id
      WHERE 1=1
    `;

    const request = pool.request();

    if (statut) {
      query += ` AND v.statut_validation = @statut`;
      request.input('statut', sql.VarChar(20), statut);
    }

    if (client_id) {
      query += ` AND v.client_id = @client_id`;
      request.input('client_id', sql.BigInt, client_id);
    }

    query += ` ORDER BY v.date_ajout DESC`;

    const result = await request.query(query);

    res.json({
      count: result.recordset.length,
      vehicles: result.recordset
    });
  } catch (error) {
    console.error('Erreur récupération véhicules:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des véhicules',
      message: error.message 
    });
  }
};

/**
 * Valider un véhicule
 */
const validateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const agentId = req.user.id;
    const { commentaire } = req.body;

    const pool = await getConnection();

    // Vérifier que le véhicule existe et est en attente
    const vehicleCheck = await pool.request()
      .input('id', sql.BigInt, id)
      .query(`
        SELECT v.id, v.client_id, v.statut_validation, v.immatriculation,
               c.nom + ' ' + c.prenom AS client_nom,
               c.telephone, c.email
        FROM Vehicule v
        JOIN Utilisateur c ON c.id = v.client_id
        WHERE v.id = @id
      `);

    if (vehicleCheck.recordset.length === 0) {
      return res.status(404).json({ error: 'Véhicule non trouvé' });
    }

    const vehicle = vehicleCheck.recordset[0];

    if (vehicle.statut_validation !== 'EN_ATTENTE') {
      return res.status(400).json({ 
        error: 'Ce véhicule a déjà été traité',
        statut_actuel: vehicle.statut_validation
      });
    }

    // Mettre à jour le véhicule
    await pool.request()
      .input('id', sql.BigInt, id)
      .input('agent_id', sql.BigInt, agentId)
      .query(`
        UPDATE Vehicule
        SET statut_validation = 'VALIDE',
            date_validation = GETDATE(),
            agent_validation_id = @agent_id
        WHERE id = @id
      `);

    // Créer une notification pour le client
    await pool.request()
      .input('client_id', sql.BigInt, vehicle.client_id)
      .input('vehicule_id', sql.BigInt, id)
      .query(`
        INSERT INTO Notification (utilisateur_id, titre, message, lu, type, entite_type, entite_id, date_envoi)
        VALUES (
          @client_id,
          N'Véhicule validé',
          N'Votre véhicule ${vehicle.immatriculation} a été validé par un agent SAV. Vous pouvez maintenant prendre des rendez-vous.',
          0,
          'PUSH',
          'VEHICULE',
          @vehicule_id,
          GETDATE()
        )
      `);

    // Envoyer notification WhatsApp
    if (vehicle.telephone) {
      try {
        await sendWhatsAppMessage(
          vehicle.telephone,
          `STA Chery Tunisia\n\n✅ Votre véhicule ${vehicle.immatriculation} a été validé!\n\nVous pouvez maintenant prendre des rendez-vous pour l'entretien de votre véhicule.\n\nMerci de votre confiance.`
        );
      } catch (whatsappError) {
        console.warn('Erreur envoi WhatsApp:', whatsappError);
      }
    }

    res.json({ 
      message: 'Véhicule validé avec succès',
      vehicle: {
        id,
        statut_validation: 'VALIDE',
        date_validation: new Date(),
        agent_validation_id: agentId
      }
    });
  } catch (error) {
    console.error('Erreur validation véhicule:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la validation du véhicule',
      message: error.message 
    });
  }
};

/**
 * Refuser un véhicule
 */
const rejectVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const agentId = req.user.id;
    const { raison } = req.body;

    if (!raison || raison.trim().length === 0) {
      return res.status(400).json({ 
        error: 'La raison du refus est obligatoire' 
      });
    }

    const pool = await getConnection();

    // Vérifier que le véhicule existe et est en attente
    const vehicleCheck = await pool.request()
      .input('id', sql.BigInt, id)
      .query(`
        SELECT v.id, v.client_id, v.statut_validation, v.immatriculation,
               c.nom + ' ' + c.prenom AS client_nom,
               c.telephone, c.email
        FROM Vehicule v
        JOIN Utilisateur c ON c.id = v.client_id
        WHERE v.id = @id
      `);

    if (vehicleCheck.recordset.length === 0) {
      return res.status(404).json({ error: 'Véhicule non trouvé' });
    }

    const vehicle = vehicleCheck.recordset[0];

    if (vehicle.statut_validation !== 'EN_ATTENTE') {
      return res.status(400).json({ 
        error: 'Ce véhicule a déjà été traité',
        statut_actuel: vehicle.statut_validation
      });
    }

    // Mettre à jour le véhicule
    await pool.request()
      .input('id', sql.BigInt, id)
      .input('agent_id', sql.BigInt, agentId)
      .query(`
        UPDATE Vehicule
        SET statut_validation = 'REFUSE',
            date_validation = GETDATE(),
            agent_validation_id = @agent_id
        WHERE id = @id
      `);

    // Créer une notification pour le client
    await pool.request()
      .input('client_id', sql.BigInt, vehicle.client_id)
      .input('vehicule_id', sql.BigInt, id)
      .input('raison', sql.NVarChar(sql.MAX), raison)
      .query(`
        INSERT INTO Notification (utilisateur_id, titre, message, lu, type, entite_type, entite_id, date_envoi)
        VALUES (
          @client_id,
          N'Véhicule refusé',
          N'Votre véhicule ${vehicle.immatriculation} n''a pas pu être validé. Raison: ' + @raison + N'\n\nVeuillez contacter le service client pour plus d''informations.',
          0,
          'PUSH',
          'VEHICULE',
          @vehicule_id,
          GETDATE()
        )
      `);

    // Envoyer notification WhatsApp
    if (vehicle.telephone) {
      try {
        await sendWhatsAppMessage(
          vehicle.telephone,
          `STA Chery Tunisia\n\n❌ Votre véhicule ${vehicle.immatriculation} n'a pas pu être validé.\n\nRaison: ${raison}\n\nVeuillez contacter notre service client pour plus d'informations.\nTél: +216 XX XXX XXX`
        );
      } catch (whatsappError) {
        console.warn('Erreur envoi WhatsApp:', whatsappError);
      }
    }

    res.json({ 
      message: 'Véhicule refusé',
      vehicle: {
        id,
        statut_validation: 'REFUSE',
        date_validation: new Date(),
        agent_validation_id: agentId,
        raison
      }
    });
  } catch (error) {
    console.error('Erreur refus véhicule:', error);
    res.status(500).json({ 
      error: 'Erreur lors du refus du véhicule',
      message: error.message 
    });
  }
};

/**
 * Obtenir les statistiques de validation
 */
const getValidationStats = async (req, res) => {
  try {
    const pool = await getConnection();
    
    const result = await pool.request().query(`
      SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN statut_validation = 'EN_ATTENTE' THEN 1 ELSE 0 END) AS en_attente,
        SUM(CASE WHEN statut_validation = 'VALIDE' THEN 1 ELSE 0 END) AS valides,
        SUM(CASE WHEN statut_validation = 'REFUSE' THEN 1 ELSE 0 END) AS refuses,
        AVG(CASE 
          WHEN statut_validation IN ('VALIDE', 'REFUSE') AND date_validation IS NOT NULL
          THEN DATEDIFF(HOUR, date_ajout, date_validation)
          ELSE NULL
        END) AS delai_moyen_heures
      FROM Vehicule
    `);

    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Erreur statistiques validation:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des statistiques',
      message: error.message 
    });
  }
};

module.exports = {
  getPendingVehicles,
  getAllVehicles,
  validateVehicle,
  rejectVehicle,
  getValidationStats
};
