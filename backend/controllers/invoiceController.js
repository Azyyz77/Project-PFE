const { getConnection, sql } = require('../config/database');
const PDFDocument = require('pdfkit');
const emailService = require('../services/emailService');

/**
 * Controller pour la gestion des factures
 */

// Lister les factures (avec filtres)
const listInvoices = async (req, res) => {
  try {
    const { statut, client_id, agence_id, date_debut, date_fin } = req.query;
    const pool = await getConnection();

    let query = `
      SELECT 
        f.id,
        f.numero,
        f.statut,
        f.montant_ttc,
        f.date_emission,
        f.date_paiement,
        c.numero AS commande_numero,
        u.nom AS client_nom,
        u.prenom AS client_prenom,
        ag.nom AS agence_nom
      FROM Facture f
      JOIN CommandeReparation c ON c.id = f.commande_id
      JOIN Utilisateur u ON u.id = c.client_id
      JOIN Agence ag ON ag.id = c.agence_id
      WHERE 1=1
    `;

    const request = pool.request();

    if (statut) {
      query += ` AND f.statut = @statut`;
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
      query += ` AND f.date_emission >= @date_debut`;
      request.input('date_debut', sql.DateTime2, new Date(date_debut));
    }

    if (date_fin) {
      query += ` AND f.date_emission <= @date_fin`;
      request.input('date_fin', sql.DateTime2, new Date(date_fin));
    }

    query += ` ORDER BY f.date_emission DESC`;

    const result = await request.query(query);

    return res.json({
      count: result.recordset.length,
      factures: result.recordset
    });

  } catch (error) {
    console.error('Erreur liste factures:', error);
    return res.status(500).json({ 
      error: 'Erreur lors de la récupération des factures',
      message: error.message 
    });
  }
};

// Récupérer une facture par ID
const getInvoice = async (req, res) => {
  try {
    const factureId = parseInt(req.params.id);

    if (!factureId || isNaN(factureId)) {
      return res.status(400).json({ error: 'ID de facture invalide' });
    }

    const pool = await getConnection();
    const facture = await getInvoiceDetails(factureId, pool);

    if (!facture) {
      return res.status(404).json({ error: 'Facture non trouvée' });
    }

    // Vérifier les permissions
    if (req.user.role === 'CLIENT' && facture.client_id !== req.user.id) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    return res.json({ facture });

  } catch (error) {
    console.error('Erreur récupération facture:', error);
    return res.status(500).json({ 
      error: 'Erreur lors de la récupération de la facture',
      message: error.message 
    });
  }
};

// Fonction helper pour récupérer les détails d'une facture
async function getInvoiceDetails(factureId, pool) {
  // Récupérer la facture
  const factureResult = await pool.request()
    .input('id', sql.BigInt, factureId)
    .query(`
      SELECT 
        f.id,
        f.numero,
        f.commande_id,
        f.montant_ttc,
        f.statut AS statut_paiement,
        f.date_emission,
        f.date_envoi,
        f.date_paiement,
        f.mode_paiement,
        f.notes,
        c.numero AS commande_numero,
        c.client_id,
        c.vehicule_id,
        c.montant_total AS montant_ht,
        CAST(c.montant_total * 0.19 AS DECIMAL(10,2)) AS montant_tva,
        19 AS taux_tva,
        u.nom AS client_nom,
        u.prenom AS client_prenom,
        u.email AS client_email,
        u.telephone AS client_telephone,
        u.adresse AS client_adresse,
        v.immatriculation AS vehicule_immatriculation,
        mo.nom AS vehicule_modele,
        ma.nom AS vehicule_marque,
        ag.nom AS agence_nom,
        ag.adresse AS agence_adresse,
        ag.telephone AS agence_telephone,
        ag.email AS agence_email
      FROM Facture f
      JOIN CommandeReparation c ON c.id = f.commande_id
      JOIN Utilisateur u ON u.id = c.client_id
      JOIN Vehicule v ON v.id = c.vehicule_id
      JOIN Version ve ON ve.id = v.version_id
      JOIN Modele mo ON mo.id = ve.modele_id
      JOIN Marque ma ON ma.id = mo.marque_id
      JOIN Agence ag ON ag.id = c.agence_id
      WHERE f.id = @id
    `);

  if (factureResult.recordset.length === 0) {
    return null;
  }

  const facture = factureResult.recordset[0];

  // Récupérer les lignes de la commande
  const lignesResult = await pool.request()
    .input('commande_id', sql.BigInt, facture.commande_id)
    .query(`
      SELECT 
        l.id,
        l.type,
        l.quantite,
        l.prix_unitaire,
        l.prix_total AS montant_total,
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

  facture.lignes = lignesResult.recordset;

  return facture;
}

// Mettre à jour le statut d'une facture
const updateStatus = async (req, res) => {
  try {
    const factureId = parseInt(req.params.id);
    const { statut, mode_paiement, notes } = req.body;

    const validStatuts = ['EMISE', 'ENVOYEE', 'PAYEE', 'ANNULEE'];

    if (!factureId || isNaN(factureId)) {
      return res.status(400).json({ error: 'ID de facture invalide' });
    }

    if (!statut || !validStatuts.includes(statut)) {
      return res.status(400).json({ 
        error: 'Statut invalide',
        valid_statuts: validStatuts
      });
    }

    const pool = await getConnection();

    // Construire la requête de mise à jour
    let updateQuery = `
      UPDATE Facture
      SET 
        statut = @statut,
        date_envoi = CASE WHEN @statut = 'ENVOYEE' AND date_envoi IS NULL THEN GETDATE() ELSE date_envoi END,
        date_paiement = CASE WHEN @statut = 'PAYEE' AND date_paiement IS NULL THEN GETDATE() ELSE date_paiement END
    `;

    const request = pool.request()
      .input('id', sql.BigInt, factureId)
      .input('statut', sql.VarChar(20), statut);

    if (mode_paiement) {
      updateQuery += `, mode_paiement = @mode_paiement`;
      request.input('mode_paiement', sql.VarChar(50), mode_paiement);
    }

    if (notes) {
      updateQuery += `, notes = @notes`;
      request.input('notes', sql.NVarChar(sql.MAX), notes);
    }

    updateQuery += ` WHERE id = @id`;

    const result = await request.query(updateQuery);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Facture non trouvée' });
    }

    // Récupérer la facture mise à jour
    const facture = await getInvoiceDetails(factureId, pool);

    return res.json({
      message: 'Statut mis à jour avec succès',
      facture
    });

  } catch (error) {
    console.error('Erreur mise à jour statut facture:', error);
    return res.status(500).json({ 
      error: 'Erreur lors de la mise à jour du statut',
      message: error.message 
    });
  }
};

// Envoyer la facture par email
const sendByEmail = async (req, res) => {
  try {
    const factureId = parseInt(req.params.id);

    if (!factureId || isNaN(factureId)) {
      return res.status(400).json({ error: 'ID de facture invalide' });
    }

    const pool = await getConnection();
    const facture = await getInvoiceDetails(factureId, pool);

    if (!facture) {
      return res.status(404).json({ error: 'Facture non trouvée' });
    }

    if (!facture.client_email) {
      return res.status(400).json({ error: 'Le client n\'a pas d\'adresse email' });
    }

    // Générer le PDF
    const pdfBuffer = await generateInvoicePDF(facture);

    // Envoyer l'email
    await emailService.sendEmail({
      to: facture.client_email,
      subject: `Facture ${facture.numero} - ${facture.agence_nom}`,
      html: `
        <h2>Bonjour ${facture.client_prenom} ${facture.client_nom},</h2>
        <p>Veuillez trouver ci-joint votre facture n° <strong>${facture.numero}</strong>.</p>
        <p><strong>Montant:</strong> ${facture.montant_ttc.toFixed(2)} TND</p>
        <p><strong>Date d'émission:</strong> ${new Date(facture.date_emission).toLocaleDateString('fr-FR')}</p>
        <p>Merci de votre confiance.</p>
        <p>Cordialement,<br>${facture.agence_nom}</p>
      `,
      attachments: [{
        filename: `Facture_${facture.numero}.pdf`,
        content: pdfBuffer
      }]
    });

    // Mettre à jour le statut si nécessaire
    if (facture.statut === 'EMISE') {
      await pool.request()
        .input('id', sql.BigInt, factureId)
        .query(`
          UPDATE Facture 
          SET statut = 'ENVOYEE', date_envoi = GETDATE() 
          WHERE id = @id
        `);
    }

    return res.json({ message: 'Facture envoyée par email avec succès' });

  } catch (error) {
    console.error('Erreur envoi facture:', error);
    return res.status(500).json({ 
      error: 'Erreur lors de l\'envoi de la facture',
      message: error.message 
    });
  }
};

// Télécharger la facture en PDF
const downloadPDF = async (req, res) => {
  try {
    const factureId = parseInt(req.params.id);

    if (!factureId || isNaN(factureId)) {
      return res.status(400).json({ error: 'ID de facture invalide' });
    }

    const pool = await getConnection();
    const facture = await getInvoiceDetails(factureId, pool);

    if (!facture) {
      return res.status(404).json({ error: 'Facture non trouvée' });
    }

    // Vérifier les permissions
    if (req.user.role === 'CLIENT' && facture.client_id !== req.user.id) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    console.log('Génération PDF pour facture:', {
      id: facture.id,
      numero: facture.numero,
      lignes_count: facture.lignes ? facture.lignes.length : 0
    });

    // Générer le PDF
    const pdfBuffer = await generateInvoicePDF(facture);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Facture_${facture.numero}.pdf`);
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Erreur téléchargement PDF:', error);
    console.error('Stack:', error.stack);
    return res.status(500).json({ 
      error: 'Erreur lors de la génération du PDF',
      message: error.message 
    });
  }
};

// Fonction helper pour générer le PDF
async function generateInvoicePDF(facture) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', (err) => {
        reject(err);
      });

      // En-tête
      doc.fontSize(20).text('FACTURE', { align: 'center' });
      doc.moveDown();

      // Informations agence
      doc.fontSize(12).text(facture.agence_nom || 'Agence', { align: 'left' });
      doc.fontSize(10);
      if (facture.agence_adresse) doc.text(facture.agence_adresse);
      if (facture.agence_telephone) doc.text(`Tél: ${facture.agence_telephone}`);
      if (facture.agence_email) doc.text(`Email: ${facture.agence_email}`);
      doc.moveDown();

      // Numéro et date
      doc.fontSize(12).text(`Facture N°: ${facture.numero}`, { align: 'right' });
      doc.text(`Date: ${new Date(facture.date_emission).toLocaleDateString('fr-FR')}`, { align: 'right' });
      doc.moveDown();

      // Informations client
      doc.fontSize(12).text('Client:', { underline: true });
      doc.fontSize(10).text(`${facture.client_prenom || ''} ${facture.client_nom || ''}`);
      if (facture.client_adresse) doc.text(facture.client_adresse);
      if (facture.client_telephone) doc.text(`Tél: ${facture.client_telephone}`);
      if (facture.client_email) doc.text(`Email: ${facture.client_email}`);
      doc.moveDown();

      // Informations véhicule
      doc.fontSize(12).text('Véhicule:', { underline: true });
      doc.fontSize(10).text(`${facture.vehicule_marque || ''} ${facture.vehicule_modele || ''}`);
      doc.text(`Immatriculation: ${facture.vehicule_immatriculation || 'N/A'}`);
      doc.moveDown(2);

      // Tableau des lignes
      doc.fontSize(12).text('Détails:', { underline: true });
      doc.moveDown();

      // En-tête du tableau
      const tableTop = doc.y;
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text('Description', 50, tableTop);
      doc.text('Qté', 300, tableTop);
      doc.text('P.U.', 350, tableTop);
      doc.text('Total', 450, tableTop, { align: 'right' });
      doc.font('Helvetica');

      // Lignes
      let y = tableTop + 20;
      if (facture.lignes && facture.lignes.length > 0) {
        facture.lignes.forEach((ligne) => {
          doc.text(ligne.description || 'N/A', 50, y, { width: 240 });
          doc.text((ligne.quantite || 0).toString(), 300, y);
          doc.text(`${(ligne.prix_unitaire || 0).toFixed(2)} TND`, 350, y);
          doc.text(`${(ligne.prix_total || 0).toFixed(2)} TND`, 450, y, { align: 'right' });
          y += 20;
        });
      } else {
        doc.text('Aucune ligne', 50, y);
        y += 20;
      }

      // Total
      doc.moveDown(2);
      doc.fontSize(14).font('Helvetica-Bold');
      doc.text(`TOTAL: ${(facture.montant_ttc || 0).toFixed(2)} TND`, { align: 'right' });

      // Pied de page
      doc.fontSize(10).font('Helvetica');
      doc.moveDown(3);
      doc.text('Merci de votre confiance!', { align: 'center' });

      doc.end();

    } catch (error) {
      console.error('Erreur génération PDF:', error);
      reject(error);
    }
  });
}

// Mes factures (pour le client)
const getMyInvoices = async (req, res) => {
  try {
    const clientId = req.user.id;
    const pool = await getConnection();

    const result = await pool.request()
      .input('client_id', sql.BigInt, clientId)
      .query(`
        SELECT 
          f.id,
          f.numero,
          f.statut AS statut_paiement,
          f.montant_ttc,
          f.date_emission,
          f.date_paiement,
          c.numero AS commande_numero,
          v.immatriculation AS vehicule_immatriculation,
          ag.nom AS agence_nom
        FROM Facture f
        JOIN CommandeReparation c ON c.id = f.commande_id
        JOIN Vehicule v ON v.id = c.vehicule_id
        JOIN Agence ag ON ag.id = c.agence_id
        WHERE c.client_id = @client_id
        ORDER BY f.date_emission DESC
      `);

    return res.json({
      count: result.recordset.length,
      invoices: result.recordset
    });

  } catch (error) {
    console.error('Erreur mes factures:', error);
    return res.status(500).json({ 
      error: 'Erreur lors de la récupération des factures',
      message: error.message 
    });
  }
};

// Annuler une facture
const cancelInvoice = async (req, res) => {
  try {
    const factureId = parseInt(req.params.id);
    const { reason } = req.body;

    if (!factureId || isNaN(factureId)) {
      return res.status(400).json({ error: 'ID de facture invalide' });
    }

    if (!reason) {
      return res.status(400).json({ error: 'Raison d\'annulation requise' });
    }

    const pool = await getConnection();

    // Vérifier que la facture n'est pas déjà payée
    const factureCheck = await pool.request()
      .input('id', sql.BigInt, factureId)
      .query(`SELECT statut FROM Facture WHERE id = @id`);

    if (factureCheck.recordset.length === 0) {
      return res.status(404).json({ error: 'Facture non trouvée' });
    }

    if (factureCheck.recordset[0].statut === 'PAYEE') {
      return res.status(400).json({ error: 'Impossible d\'annuler une facture payée' });
    }

    // Annuler la facture
    await pool.request()
      .input('id', sql.BigInt, factureId)
      .input('notes', sql.NVarChar(sql.MAX), `Annulée: ${reason}`)
      .query(`
        UPDATE Facture 
        SET statut = 'ANNULEE', notes = @notes 
        WHERE id = @id
      `);

    // Récupérer la facture mise à jour
    const facture = await getInvoiceDetails(factureId, pool);

    return res.json({
      message: 'Facture annulée avec succès',
      facture
    });

  } catch (error) {
    console.error('Erreur annulation facture:', error);
    return res.status(500).json({ 
      error: 'Erreur lors de l\'annulation de la facture',
      message: error.message 
    });
  }
};

module.exports = {
  listInvoices,
  getInvoice,
  updateStatus,
  sendByEmail,
  downloadPDF,
  getMyInvoices,
  cancelInvoice
};
