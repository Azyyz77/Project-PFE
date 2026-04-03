const { getConnection, sql } = require('../config/database');

const ALLOWED_STAFF_ROLES = ['ADMIN', 'AGENT', 'DIRECTION'];

/**
 * Créer une nouvelle réclamation
 */
const createComplaint = async (req, res) => {
  try {
    const { sujet, description } = req.body;
    
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        error: 'Non authentifié',
        message: 'Vous devez être connecté pour créer une réclamation'
      });
    }
    
    const client_id = req.user.id;

    if (!sujet || !description) {
      return res.status(400).json({
        error: 'Champs requis manquants',
        required: ['sujet', 'description']
      });
    }

    if (sujet.trim().length === 0 || description.trim().length < 10) {
      return res.status(400).json({
        error: 'Validation échouée',
        message: 'Le sujet est requis et la description doit contenir au moins 10 caractères'
      });
    }

    const pool = await getConnection();

    // Generate a temporary numero - the trigger will update it
    const tempNumero = `TEMP-${Date.now()}-${client_id}`;

    // Insert with temporary numero - trigger will update it
    const insertQuery = `
      INSERT INTO Reclamation (numero, client_id, objet, description, statut, date_soumission)
      VALUES (@numero, @client_id, @objet, @description, 'SOUMISE', GETDATE());
    `;

    await pool.request()
      .input('numero', sql.NVarChar(30), tempNumero)
      .input('client_id', sql.BigInt, client_id)
      .input('objet', sql.NVarChar(200), sujet.trim())
      .input('description', sql.NVarChar(sql.MAX), description.trim())
      .query(insertQuery);

    console.log('[CreateComplaint] Insert completed for client:', client_id);

    // Wait a moment for trigger to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    // Get the most recent complaint for this client
    const selectQuery = `
      SELECT TOP 1 id, numero, objet, description, statut, date_soumission
      FROM Reclamation
      WHERE client_id = @client_id
      ORDER BY date_soumission DESC, id DESC
    `;

    const result = await pool.request()
      .input('client_id', sql.BigInt, client_id)
      .query(selectQuery);

    console.log('[CreateComplaint] Select result:', result.recordset.length, 'records found');

    if (!result.recordset || result.recordset.length === 0) {
      console.error('[CreateComplaint] No record found after insert for client:', client_id);
      return res.status(500).json({
        error: 'Erreur lors de la création',
        message: 'La réclamation a été créée mais impossible de la récupérer'
      });
    }

    const complaint = result.recordset[0];

    res.status(201).json({
      message: 'Réclamation créée avec succès',
      complaint: {
        id: complaint.id,
        numero: complaint.numero,
        sujet: complaint.objet,
        description: complaint.description,
        statut: complaint.statut,
        date_creation: complaint.date_soumission
      }
    });
  } catch (error) {
    console.error('Erreur lors de la création de la réclamation:', error);
    res.status(500).json({
      error: 'Erreur lors de la création de la réclamation',
      message: error.message
    });
  }
};

/**
 * Obtenir toutes les réclamations d'un client
 */
const getMyComplaints = async (req, res) => {
  try {
    const client_id = req.user.id;
    const pool = await getConnection();

    const query = `
      SELECT 
        r.id,
        r.numero,
        r.objet AS sujet,
        r.description,
        r.statut,
        r.date_soumission AS date_creation,
        r.date_traitement,
        r.date_cloture AS date_resolution,
        a.nom + ' ' + a.prenom AS agent_nom
      FROM Reclamation r
      LEFT JOIN Utilisateur a ON a.id = r.agent_id
      WHERE r.client_id = @client_id
      ORDER BY r.date_soumission DESC
    `;

    const result = await pool.request()
      .input('client_id', sql.BigInt, client_id)
      .query(query);

    res.json(result.recordset);
  } catch (error) {
    console.error('Erreur lors de la récupération des réclamations:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des réclamations',
      message: error.message
    });
  }
};

/**
 * Obtenir une réclamation par ID
 */
const getComplaintById = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getConnection();

    const query = `
      SELECT 
        r.id,
        r.numero,
        r.objet AS sujet,
        r.description,
        r.statut,
        r.date_soumission AS date_creation,
        r.date_traitement,
        r.date_cloture AS date_resolution,
        r.client_id,
        c.nom + ' ' + c.prenom AS client_nom,
        c.email AS client_email,
        c.telephone AS client_tel,
        a.nom + ' ' + a.prenom AS agent_nom
      FROM Reclamation r
      JOIN Utilisateur c ON c.id = r.client_id
      LEFT JOIN Utilisateur a ON a.id = r.agent_id
      WHERE r.id = @id
    `;

    const result = await pool.request()
      .input('id', sql.BigInt, id)
      .query(query);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Réclamation non trouvée' });
    }

    const complaint = result.recordset[0];

    // Vérifier les permissions
    const currentUserIdInt = parseInt(req.user.id, 10);
    if (complaint.client_id !== currentUserIdInt && !ALLOWED_STAFF_ROLES.includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    res.json({ complaint });
  } catch (error) {
    console.error('Erreur lors de la récupération de la réclamation:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération de la réclamation',
      message: error.message
    });
  }
};

/**
 * Obtenir toutes les réclamations (pour le staff)
 */
const getAllComplaints = async (req, res) => {
  try {
    if (!ALLOWED_STAFF_ROLES.includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    const pool = await getConnection();
    const { statut } = req.query;

    let query = `
      SELECT 
        r.id,
        r.numero,
        r.objet AS sujet,
        r.description,
        r.statut,
        r.date_soumission AS date_creation,
        r.date_traitement,
        r.date_cloture AS date_resolution,
        c.nom + ' ' + c.prenom AS client_nom,
        c.email AS client_email,
        c.telephone AS client_tel,
        a.nom + ' ' + a.prenom AS agent_nom
      FROM Reclamation r
      JOIN Utilisateur c ON c.id = r.client_id
      LEFT JOIN Utilisateur a ON a.id = r.agent_id
    `;

    if (statut) {
      query += ' WHERE r.statut = @statut';
    }

    query += ' ORDER BY r.date_soumission DESC';

    const request = pool.request();
    if (statut) {
      request.input('statut', sql.VarChar(20), statut);
    }

    const result = await request.query(query);

    res.json({ count: result.recordset.length, complaints: result.recordset });
  } catch (error) {
    console.error('Erreur lors de la récupération des réclamations:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des réclamations',
      message: error.message
    });
  }
};

/**
 * Mettre à jour le statut d'une réclamation (pour le staff)
 */
const updateComplaintStatus = async (req, res) => {
  try {
    if (!ALLOWED_STAFF_ROLES.includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    const { id } = req.params;
    const { statut, reponse } = req.body;

    if (!statut) {
      return res.status(400).json({ error: 'Le statut est requis' });
    }

    const validStatuts = ['SOUMISE', 'EN_COURS', 'TRAITEE', 'CLOTUREE'];
    if (!validStatuts.includes(statut)) {
      return res.status(400).json({
        error: 'Statut invalide',
        validStatuts
      });
    }

    const pool = await getConnection();

    // Vérifier que la réclamation existe
    const checkResult = await pool.request()
      .input('id', sql.BigInt, id)
      .query('SELECT id FROM Reclamation WHERE id = @id');

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Réclamation non trouvée' });
    }

    let updateQuery = `
      UPDATE Reclamation
      SET statut = @statut,
          agent_id = @agent_id,
          date_traitement = CASE WHEN @statut IN ('EN_COURS', 'TRAITEE', 'CLOTUREE') THEN COALESCE(date_traitement, GETDATE()) ELSE date_traitement END,
          date_cloture = CASE WHEN @statut IN ('TRAITEE', 'CLOTUREE') THEN GETDATE() ELSE NULL END
      WHERE id = @id
    `;

    await pool.request()
      .input('id', sql.BigInt, id)
      .input('statut', sql.VarChar(20), statut)
      .input('agent_id', sql.BigInt, req.user.id)
      .query(updateQuery);

    res.json({ message: 'Réclamation mise à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la réclamation:', error);
    res.status(500).json({
      error: 'Erreur lors de la mise à jour de la réclamation',
      message: error.message
    });
  }
};

module.exports = {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  getAllComplaints,
  updateComplaintStatus
};
