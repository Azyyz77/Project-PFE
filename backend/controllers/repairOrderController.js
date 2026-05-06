const { getConnection, sql } = require('../config/database');

/**
 * Controller pour la gestion des commandes de réparation
 */

// Créer une commande de réparation depuis un rendez-vous
const createFromAppointment = async (req, res) => {
  try {
    const rdvId = parseInt(req.params.rdvId);
    const agentId = req.user.id;

    if (!rdvId || isNaN(rdvId)) {
      return res.status(400).json({ error: 'ID de rendez-vous invalide' });
    }

    const pool = await getConnection();

    // Vérifier que le RDV existe et récupérer ses informations
    const rdvResult = await pool.request()
      .input('rdv_id', sql.BigInt, rdvId)
      .query(`
        SELECT 
          r.id,
          r.client_id,
          r.vehicule_id,
          r.agence_id,
          r.statut,
          r.date_heure,
          u.nom AS client_nom,
          u.prenom AS client_prenom,
          v.immatriculation,
          v.numero_chassis,
          mo.nom AS modele_nom,
          ma.nom AS marque_nom
        FROM RendezVous r
        JOIN Utilisateur u ON u.id = r.client_id
        JOIN Vehicule v ON v.id = r.vehicule_id
        JOIN Version ve ON ve.id = v.version_id
        JOIN Modele mo ON mo.id = ve.modele_id
        JOIN Marque ma ON ma.id = mo.marque_id
        WHERE r.id = @rdv_id
      `);

    if (rdvResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Rendez-vous non trouvé' });
    }

    const rdv = rdvResult.recordset[0];

    // Vérifier qu'une commande n'existe pas déjà pour ce RDV
    const existingOrder = await pool.request()
      .input('rdv_id', sql.BigInt, rdvId)
      .query(`
        SELECT id FROM CommandeReparation WHERE rdv_id = @rdv_id
      `);

    if (existingOrder.recordset.length > 0) {
      return res.status(409).json({ 
        error: 'Une commande existe déjà pour ce rendez-vous',
        commande_id: existingOrder.recordset[0].id
      });
    }

    // Créer la commande de réparation
    // Note: Le trigger INSTEAD OF INSERT gère l'insertion
    const createResult = await pool.request()
      .input('rdv_id', sql.BigInt, rdvId)
      .input('client_id', sql.BigInt, rdv.client_id)
      .input('vehicule_id', sql.BigInt, rdv.vehicule_id)
      .input('agence_id', sql.BigInt, rdv.agence_id)
      .query(`
        INSERT INTO CommandeReparation (
          rdv_id, client_id, vehicule_id, agence_id, statut
        )
        VALUES (
          @rdv_id, @client_id, @vehicule_id, @agence_id, 'BROUILLON'
        );
      `);

    // Récupérer l'ID de la commande créée (le trigger a géré l'insertion)
    const idResult = await pool.request()
      .input('rdv_id', sql.BigInt, rdvId)
      .query(`
        SELECT TOP 1 id 
        FROM CommandeReparation 
        WHERE rdv_id = @rdv_id 
        ORDER BY date_creation DESC
      `);

    if (idResult.recordset.length === 0) {
      throw new Error('Impossible de récupérer l\'ID de la commande créée');
    }

    const commandeId = idResult.recordset[0].id;

    // Récupérer les interventions du RDV et les ajouter à la commande
    const interventions = await pool.request()
      .input('rdv_id', sql.BigInt, rdvId)
      .query(`
        SELECT 
          ir.sous_type_id,
          st.nom AS sous_type_nom,
          st.duree_estimee,
          ti.nom AS type_nom
        FROM InterventionRDV ir
        JOIN SousTypeIntervention st ON st.id = ir.sous_type_id
        JOIN TypeIntervention ti ON ti.id = st.type_intervention_id
        WHERE ir.rdv_id = @rdv_id
      `);

    // Ajouter chaque intervention comme ligne de commande
    for (const intervention of interventions.recordset) {
      // Prix par défaut basé sur la durée (50 TND/heure)
      const prixUnitaire = (intervention.duree_estimee || 60) * (50 / 60);
      
      await pool.request()
        .input('commande_id', sql.BigInt, commandeId)
        .input('type', sql.VarChar(20), 'INTERVENTION')
        .input('intervention_id', sql.BigInt, intervention.sous_type_id)
        .input('quantite', sql.Int, 1)
        .input('prix_unitaire', sql.Decimal(10, 2), prixUnitaire)
        .input('prix_total', sql.Decimal(10, 2), prixUnitaire)
        .query(`
          INSERT INTO LigneCommande (
            commande_id, type, intervention_id, 
            quantite, prix_unitaire, prix_total
          )
          VALUES (
            @commande_id, @type, @intervention_id,
            @quantite, @prix_unitaire, @prix_total
          )
        `);
    }

    // Récupérer la commande créée avec tous ses détails
    const commande = await getRepairOrderDetails(commandeId, pool);

    if (!commande) {
      console.error('ERREUR: getRepairOrderDetails a retourné null pour commandeId:', commandeId);
      return res.status(500).json({ 
        error: 'Erreur lors de la récupération de la commande créée',
        commandeId 
      });
    }

    console.log('Commande créée avec succès:', { id: commande.id, numero: commande.numero });

    return res.status(201).json({
      message: 'Commande de réparation créée avec succès',
      commande
    });

  } catch (error) {
    console.error('Erreur création commande:', error);
    return res.status(500).json({ 
      error: 'Erreur lors de la création de la commande',
      message: error.message 
    });
  }
};

// Récupérer les détails d'une commande
const getRepairOrder = async (req, res) => {
  try {
    const commandeId = parseInt(req.params.id);

    if (!commandeId || isNaN(commandeId)) {
      return res.status(400).json({ error: 'ID de commande invalide' });
    }

    const pool = await getConnection();
    const commande = await getRepairOrderDetails(commandeId, pool);

    if (!commande) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    return res.json({ commande });

  } catch (error) {
    console.error('Erreur récupération commande:', error);
    return res.status(500).json({ 
      error: 'Erreur lors de la récupération de la commande',
      message: error.message 
    });
  }
};

// Fonction helper pour récupérer les détails d'une commande
async function getRepairOrderDetails(commandeId, pool) {
  // Récupérer la commande
  const commandeResult = await pool.request()
    .input('id', sql.BigInt, commandeId)
    .query(`
      SELECT 
        c.id,
        c.numero,
        c.rdv_id,
        c.client_id,
        c.vehicule_id,
        c.agence_id,
        c.statut,
        c.montant_total,
        c.date_creation,
        c.date_validation,
        c.date_fin,
        u.nom AS client_nom,
        u.prenom AS client_prenom,
        u.telephone AS client_telephone,
        u.email AS client_email,
        v.immatriculation,
        v.numero_chassis,
        mo.nom AS modele_nom,
        ma.nom AS marque_nom,
        ag.nom AS agence_nom,
        ag.adresse AS agence_adresse,
        ag.telephone AS agence_telephone
      FROM CommandeReparation c
      JOIN Utilisateur u ON u.id = c.client_id
      JOIN Vehicule v ON v.id = c.vehicule_id
      JOIN Version ve ON ve.id = v.version_id
      JOIN Modele mo ON mo.id = ve.modele_id
      JOIN Marque ma ON ma.id = mo.marque_id
      JOIN Agence ag ON ag.id = c.agence_id
      WHERE c.id = @id
    `);

  if (commandeResult.recordset.length === 0) {
    return null;
  }

  const commande = commandeResult.recordset[0];

  // Récupérer les lignes de la commande
  const lignesResult = await pool.request()
    .input('commande_id', sql.BigInt, commandeId)
    .query(`
      SELECT 
        l.id,
        l.type,
        l.intervention_id,
        l.quantite,
        l.prix_unitaire,
        l.prix_total,
        CASE 
          WHEN l.type = 'INTERVENTION' AND l.intervention_id IS NOT NULL 
            THEN ISNULL(sti.nom, 'Intervention')
          WHEN l.type = 'PIECE' 
            THEN 'Pièce de rechange'
          ELSE l.type
        END AS description
      FROM LigneCommande l
      LEFT JOIN SousTypeIntervention sti ON sti.id = l.intervention_id AND l.type = 'INTERVENTION'
      WHERE l.commande_id = @commande_id
      ORDER BY l.id
    `);

  commande.lignes = lignesResult.recordset;

  return commande;
}

// Lister les commandes (avec filtres)
const listRepairOrders = async (req, res) => {
  try {
    const { statut, client_id, agence_id, date_debut, date_fin } = req.query;
    const pool = await getConnection();

    let query = `
      SELECT 
        c.id,
        c.numero,
        c.statut,
        c.montant_total,
        c.date_creation,
        c.date_fin,
        u.nom AS client_nom,
        u.prenom AS client_prenom,
        v.immatriculation,
        mo.nom AS modele_nom,
        ma.nom AS marque_nom,
        ag.nom AS agence_nom
      FROM CommandeReparation c
      JOIN Utilisateur u ON u.id = c.client_id
      JOIN Vehicule v ON v.id = c.vehicule_id
      JOIN Version ve ON ve.id = v.version_id
      JOIN Modele mo ON mo.id = ve.modele_id
      JOIN Marque ma ON ma.id = mo.marque_id
      JOIN Agence ag ON ag.id = c.agence_id
      WHERE 1=1
    `;

    const request = pool.request();

    if (statut) {
      query += ` AND c.statut = @statut`;
      request.input('statut', sql.VarChar(20), statut);
    }

    if (client_id) {
      query += ` AND c.client_id = @client_id`;
      request.input('client_id', sql.BigInt, parseInt(client_id));
    }

    if (agence_id) {
      query += ` AND c.agence_id = @agence_id`;
      request.input('agence_id', sql.BigInt, parseInt(agence_id));
    }

    if (date_debut) {
      query += ` AND c.date_creation >= @date_debut`;
      request.input('date_debut', sql.DateTime2, new Date(date_debut));
    }

    if (date_fin) {
      query += ` AND c.date_creation <= @date_fin`;
      request.input('date_fin', sql.DateTime2, new Date(date_fin));
    }

    query += ` ORDER BY c.date_creation DESC`;

    const result = await request.query(query);

    return res.json({
      count: result.recordset.length,
      commandes: result.recordset
    });

  } catch (error) {
    console.error('Erreur liste commandes:', error);
    return res.status(500).json({ 
      error: 'Erreur lors de la récupération des commandes',
      message: error.message 
    });
  }
};

// Ajouter une ligne à la commande
const addLine = async (req, res) => {
  try {
    const commandeId = parseInt(req.params.id);
    const { type, intervention_id, quantite, prix_unitaire } = req.body;

    if (!commandeId || isNaN(commandeId)) {
      return res.status(400).json({ error: 'ID de commande invalide' });
    }

    if (!type || !['INTERVENTION', 'PIECE'].includes(type)) {
      return res.status(400).json({ error: 'Type invalide (INTERVENTION ou PIECE)' });
    }

    if (!quantite || !prix_unitaire) {
      return res.status(400).json({ 
        error: 'Champs requis manquants',
        required: ['type', 'quantite', 'prix_unitaire']
      });
    }

    const pool = await getConnection();

    // Vérifier que la commande existe et est modifiable
    const commandeCheck = await pool.request()
      .input('id', sql.BigInt, commandeId)
      .query(`
        SELECT statut FROM CommandeReparation WHERE id = @id
      `);

    if (commandeCheck.recordset.length === 0) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    const statut = commandeCheck.recordset[0].statut;
    if (['FACTUREE', 'ANNULEE'].includes(statut)) {
      return res.status(400).json({ 
        error: `Impossible de modifier une commande avec le statut ${statut}` 
      });
    }

    const prixTotal = quantite * prix_unitaire;

    // Ajouter la ligne
    const result = await pool.request()
      .input('commande_id', sql.BigInt, commandeId)
      .input('type', sql.VarChar(20), type)
      .input('intervention_id', sql.BigInt, intervention_id || null)
      .input('quantite', sql.Int, quantite)
      .input('prix_unitaire', sql.Decimal(10, 2), prix_unitaire)
      .input('prix_total', sql.Decimal(10, 2), prixTotal)
      .query(`
        INSERT INTO LigneCommande (
          commande_id, type, intervention_id,
          quantite, prix_unitaire, prix_total
        )
        VALUES (
          @commande_id, @type, @intervention_id,
          @quantite, @prix_unitaire, @prix_total
        );
        
        SELECT SCOPE_IDENTITY() AS id;
      `);

    const ligneId = result.recordset[0].id;

    // Récupérer la ligne créée
    const ligneResult = await pool.request()
      .input('id', sql.BigInt, ligneId)
      .query(`
        SELECT * FROM LigneCommande WHERE id = @id
      `);

    return res.status(201).json({
      message: 'Ligne ajoutée avec succès',
      ligne: ligneResult.recordset[0]
    });

  } catch (error) {
    console.error('Erreur ajout ligne:', error);
    return res.status(500).json({ 
      error: 'Erreur lors de l\'ajout de la ligne',
      message: error.message 
    });
  }
};

// Supprimer une ligne
const deleteLine = async (req, res) => {
  try {
    const ligneId = parseInt(req.params.ligneId);

    if (!ligneId || isNaN(ligneId)) {
      return res.status(400).json({ error: 'ID de ligne invalide' });
    }

    const pool = await getConnection();

    // Vérifier que la ligne existe et que la commande est modifiable
    const ligneCheck = await pool.request()
      .input('id', sql.BigInt, ligneId)
      .query(`
        SELECT l.id, c.statut
        FROM LigneCommande l
        JOIN CommandeReparation c ON c.id = l.commande_id
        WHERE l.id = @id
      `);

    if (ligneCheck.recordset.length === 0) {
      return res.status(404).json({ error: 'Ligne non trouvée' });
    }

    const statut = ligneCheck.recordset[0].statut;
    if (['FACTUREE', 'ANNULEE'].includes(statut)) {
      return res.status(400).json({ 
        error: `Impossible de modifier une commande avec le statut ${statut}` 
      });
    }

    // Supprimer la ligne
    await pool.request()
      .input('id', sql.BigInt, ligneId)
      .query(`DELETE FROM LigneCommande WHERE id = @id`);

    return res.json({ message: 'Ligne supprimée avec succès' });

  } catch (error) {
    console.error('Erreur suppression ligne:', error);
    return res.status(500).json({ 
      error: 'Erreur lors de la suppression de la ligne',
      message: error.message 
    });
  }
};

// Mettre à jour le statut de la commande
const updateStatus = async (req, res) => {
  try {
    const commandeId = parseInt(req.params.id);
    const { statut } = req.body;

    const validStatuts = ['BROUILLON', 'EN_COURS', 'TERMINEE', 'FACTUREE', 'ANNULEE'];

    if (!commandeId || isNaN(commandeId)) {
      return res.status(400).json({ error: 'ID de commande invalide' });
    }

    if (!statut || !validStatuts.includes(statut)) {
      return res.status(400).json({ 
        error: 'Statut invalide',
        valid_statuts: validStatuts
      });
    }

    const pool = await getConnection();

    // Mettre à jour le statut
    const updateQuery = `
      UPDATE CommandeReparation
      SET 
        statut = @statut,
        date_validation = CASE WHEN @statut = 'EN_COURS' AND date_validation IS NULL THEN GETDATE() ELSE date_validation END,
        date_fin = CASE WHEN @statut = 'TERMINEE' AND date_fin IS NULL THEN GETDATE() ELSE date_fin END
      WHERE id = @id
    `;

    const result = await pool.request()
      .input('id', sql.BigInt, commandeId)
      .input('statut', sql.VarChar(20), statut)
      .query(updateQuery);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    // Récupérer la commande mise à jour
    const commande = await getRepairOrderDetails(commandeId, pool);

    return res.json({
      message: 'Statut mis à jour avec succès',
      commande
    });

  } catch (error) {
    console.error('Erreur mise à jour statut:', error);
    return res.status(500).json({ 
      error: 'Erreur lors de la mise à jour du statut',
      message: error.message 
    });
  }
};

// Créer une facture depuis une commande
const createInvoice = async (req, res) => {
  try {
    const commandeId = parseInt(req.params.id);

    if (!commandeId || isNaN(commandeId)) {
      return res.status(400).json({ error: 'ID de commande invalide' });
    }

    const pool = await getConnection();

    // Vérifier que la commande existe et est terminée
    const commandeCheck = await pool.request()
      .input('id', sql.BigInt, commandeId)
      .query(`
        SELECT 
          id, client_id, statut, montant_total
        FROM CommandeReparation 
        WHERE id = @id
      `);

    if (commandeCheck.recordset.length === 0) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    const commande = commandeCheck.recordset[0];

    if (commande.statut !== 'TERMINEE') {
      return res.status(400).json({ 
        error: 'La commande doit être terminée pour créer une facture' 
      });
    }

    // Vérifier qu'une facture n'existe pas déjà
    const existingInvoice = await pool.request()
      .input('commande_id', sql.BigInt, commandeId)
      .query(`SELECT id FROM Facture WHERE commande_id = @commande_id`);

    if (existingInvoice.recordset.length > 0) {
      return res.status(409).json({ 
        error: 'Une facture existe déjà pour cette commande',
        facture_id: existingInvoice.recordset[0].id
      });
    }

    // Créer la facture
    const createResult = await pool.request()
      .input('commande_id', sql.BigInt, commandeId)
      .input('montant_total', sql.Decimal(10, 2), commande.montant_total || 0)
      .query(`
        INSERT INTO Facture (
          commande_id, montant_ttc, statut
        )
        VALUES (
          @commande_id, @montant_total, 'EMISE'
        );
        
        SELECT SCOPE_IDENTITY() AS id;
      `);

    const factureId = createResult.recordset[0].id;

    // Mettre à jour le statut de la commande
    await pool.request()
      .input('id', sql.BigInt, commandeId)
      .query(`UPDATE CommandeReparation SET statut = 'FACTUREE' WHERE id = @id`);

    // Récupérer la facture créée
    const factureResult = await pool.request()
      .input('id', sql.BigInt, factureId)
      .query(`
        SELECT 
          f.*,
          c.client_id,
          u.nom AS client_nom,
          u.prenom AS client_prenom,
          u.email AS client_email
        FROM Facture f
        JOIN CommandeReparation c ON c.id = f.commande_id
        JOIN Utilisateur u ON u.id = c.client_id
        WHERE f.id = @id
      `);

    return res.status(201).json({
      message: 'Facture créée avec succès',
      facture: factureResult.recordset[0]
    });

  } catch (error) {
    console.error('Erreur création facture:', error);
    return res.status(500).json({ 
      error: 'Erreur lors de la création de la facture',
      message: error.message 
    });
  }
};

// Récupérer la facture d'une commande
const getInvoice = async (req, res) => {
  try {
    const commandeId = parseInt(req.params.id);

    if (!commandeId || isNaN(commandeId)) {
      return res.status(400).json({ error: 'ID de commande invalide' });
    }

    const pool = await getConnection();

    const result = await pool.request()
      .input('commande_id', sql.BigInt, commandeId)
      .query(`
        SELECT 
          f.*,
          c.client_id,
          u.nom AS client_nom,
          u.prenom AS client_prenom,
          u.email AS client_email,
          u.telephone AS client_telephone
        FROM Facture f
        JOIN CommandeReparation c ON c.id = f.commande_id
        JOIN Utilisateur u ON u.id = c.client_id
        WHERE f.commande_id = @commande_id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Facture non trouvée' });
    }

    return res.json({ facture: result.recordset[0] });

  } catch (error) {
    console.error('Erreur récupération facture:', error);
    return res.status(500).json({ 
      error: 'Erreur lors de la récupération de la facture',
      message: error.message 
    });
  }
};

// Mes commandes (pour le client)
const getMyRepairOrders = async (req, res) => {
  try {
    const clientId = req.user.id;
    const pool = await getConnection();

    const result = await pool.request()
      .input('client_id', sql.BigInt, clientId)
      .query(`
        SELECT 
          c.id,
          c.numero,
          c.statut,
          c.montant_total,
          c.date_creation,
          c.date_fin,
          v.immatriculation,
          mo.nom AS modele_nom,
          ma.nom AS marque_nom,
          ag.nom AS agence_nom
        FROM CommandeReparation c
        JOIN Vehicule v ON v.id = c.vehicule_id
        JOIN Version ve ON ve.id = v.version_id
        JOIN Modele mo ON mo.id = ve.modele_id
        JOIN Marque ma ON ma.id = mo.marque_id
        JOIN Agence ag ON ag.id = c.agence_id
        WHERE c.client_id = @client_id
        ORDER BY c.date_creation DESC
      `);

    return res.json({
      count: result.recordset.length,
      commandes: result.recordset
    });

  } catch (error) {
    console.error('Erreur mes commandes:', error);
    return res.status(500).json({ 
      error: 'Erreur lors de la récupération des commandes',
      message: error.message 
    });
  }
};

module.exports = {
  createFromAppointment,
  getRepairOrder,
  listRepairOrders,
  addLine,
  deleteLine,
  updateStatus,
  createInvoice,
  getInvoice,
  getMyRepairOrders
};
