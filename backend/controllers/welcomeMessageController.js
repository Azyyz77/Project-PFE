/**
 * Contrôleur pour la gestion des messages d'accueil
 */

const { getConnection, sql } = require('../config/database');

/**
 * Obtenir les messages actifs (pour clients)
 */
exports.getActiveMessages = async (req, res) => {
  try {
    const { agence_id, afficher_accueil, afficher_dashboard } = req.query;
    const user_id = req.user?.id;

    const pool = await getConnection();
    let query = `
      SELECT 
        m.*,
        CASE WHEN ml.id IS NOT NULL THEN 1 ELSE 0 END AS lu
      FROM VueMessagesActifs m
      LEFT JOIN MessageLecture ml ON m.id = ml.message_id AND ml.utilisateur_id = @user_id
      WHERE 1=1
    `;

    const request = pool.request()
      .input('user_id', sql.BigInt, user_id || null);

    if (agence_id) {
      query += ' AND (m.agence_id = @agence_id OR m.agence_id IS NULL)';
      request.input('agence_id', sql.BigInt, agence_id);
    }

    if (afficher_accueil !== undefined) {
      query += ' AND m.afficher_accueil = @afficher_accueil';
      request.input('afficher_accueil', sql.Bit, afficher_accueil === 'true' ? 1 : 0);
    }

    if (afficher_dashboard !== undefined) {
      query += ' AND m.afficher_dashboard = @afficher_dashboard';
      request.input('afficher_dashboard', sql.Bit, afficher_dashboard === 'true' ? 1 : 0);
    }

    query += ' ORDER BY m.priorite DESC, m.date_debut DESC';

    const result = await request.query(query);

    res.json({
      success: true,
      messages: result.recordset
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: error.message
    });
  }
};

/**
 * Obtenir tous les messages (pour admin)
 */
exports.getAllMessages = async (req, res) => {
  try {
    const { actif, type, agence_id } = req.query;

    const pool = await getConnection();
    let query = `
      SELECT 
        m.*,
        a.nom AS agence_nom,
        u.nom AS created_by_nom,
        u.prenom AS created_by_prenom,
        (SELECT COUNT(*) FROM MessageLecture ml WHERE ml.message_id = m.id) AS nb_lectures
      FROM MessageAccueil m
      LEFT JOIN Agence a ON m.agence_id = a.id
      INNER JOIN Utilisateur u ON m.created_by = u.id
      WHERE 1=1
    `;

    const request = pool.request();

    if (actif !== undefined) {
      query += ' AND m.actif = @actif';
      request.input('actif', sql.Bit, actif === 'true' ? 1 : 0);
    }

    if (type) {
      query += ' AND m.type = @type';
      request.input('type', sql.NVarChar, type);
    }

    if (agence_id) {
      query += ' AND (m.agence_id = @agence_id OR m.agence_id IS NULL)';
      request.input('agence_id', sql.BigInt, agence_id);
    }

    query += ' ORDER BY m.priorite DESC, m.created_at DESC';

    const result = await request.query(query);

    res.json({
      success: true,
      messages: result.recordset
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: error.message
    });
  }
};

/**
 * Obtenir un message par ID
 */
exports.getMessageById = async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await getConnection();
    const result = await pool.request()
      .input('id', sql.BigInt, id)
      .query(`
        SELECT 
          m.*,
          a.nom AS agence_nom,
          u.nom AS created_by_nom,
          u.prenom AS created_by_prenom,
          (SELECT COUNT(*) FROM MessageLecture ml WHERE ml.message_id = m.id) AS nb_lectures
        FROM MessageAccueil m
        LEFT JOIN Agence a ON m.agence_id = a.id
        INNER JOIN Utilisateur u ON m.created_by = u.id
        WHERE m.id = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        error: 'Message introuvable'
      });
    }

    res.json({
      success: true,
      message: result.recordset[0]
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du message:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: error.message
    });
  }
};

/**
 * Créer un nouveau message (ADMIN uniquement)
 */
exports.createMessage = async (req, res) => {
  try {
    const {
      titre,
      contenu,
      type,
      priorite,
      date_debut,
      date_fin,
      afficher_accueil,
      afficher_dashboard,
      couleur_fond,
      icone,
      lien_url,
      lien_texte,
      agence_id
    } = req.body;

    const created_by = req.user.id;

    // Validation
    if (!titre || !contenu || !date_debut) {
      return res.status(400).json({
        error: 'Données manquantes',
        message: 'Titre, contenu et date début sont requis'
      });
    }

    const pool = await getConnection();
    const result = await pool.request()
      .input('titre', sql.NVarChar, titre)
      .input('contenu', sql.NVarChar, contenu)
      .input('type', sql.NVarChar, type || 'INFO')
      .input('priorite', sql.Int, priorite || 1)
      .input('date_debut', sql.DateTime, date_debut)
      .input('date_fin', sql.DateTime, date_fin || null)
      .input('afficher_accueil', sql.Bit, afficher_accueil !== false ? 1 : 0)
      .input('afficher_dashboard', sql.Bit, afficher_dashboard !== false ? 1 : 0)
      .input('couleur_fond', sql.NVarChar, couleur_fond || null)
      .input('icone', sql.NVarChar, icone || null)
      .input('lien_url', sql.NVarChar, lien_url || null)
      .input('lien_texte', sql.NVarChar, lien_texte || null)
      .input('agence_id', sql.BigInt, agence_id || null)
      .input('created_by', sql.BigInt, created_by)
      .query(`
        INSERT INTO MessageAccueil (
          titre, contenu, type, priorite, date_debut, date_fin,
          afficher_accueil, afficher_dashboard, couleur_fond, icone,
          lien_url, lien_texte, agence_id, created_by
        )
        OUTPUT INSERTED.*
        VALUES (
          @titre, @contenu, @type, @priorite, @date_debut, @date_fin,
          @afficher_accueil, @afficher_dashboard, @couleur_fond, @icone,
          @lien_url, @lien_texte, @agence_id, @created_by
        )
      `);

    res.status(201).json({
      success: true,
      message: 'Message créé avec succès',
      data: result.recordset[0]
    });
  } catch (error) {
    console.error('Erreur lors de la création du message:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: error.message
    });
  }
};

/**
 * Mettre à jour un message (ADMIN uniquement)
 */
exports.updateMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const pool = await getConnection();

    // Vérifier que le message existe
    const checkResult = await pool.request()
      .input('id', sql.BigInt, id)
      .query('SELECT id FROM MessageAccueil WHERE id = @id');

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({
        error: 'Message introuvable'
      });
    }

    // Construire la requête de mise à jour dynamiquement
    let updateFields = [];
    const request = pool.request().input('id', sql.BigInt, id);

    const fieldMappings = {
      titre: sql.NVarChar,
      contenu: sql.NVarChar,
      type: sql.NVarChar,
      priorite: sql.Int,
      date_debut: sql.DateTime,
      date_fin: sql.DateTime,
      actif: sql.Bit,
      afficher_accueil: sql.Bit,
      afficher_dashboard: sql.Bit,
      couleur_fond: sql.NVarChar,
      icone: sql.NVarChar,
      lien_url: sql.NVarChar,
      lien_texte: sql.NVarChar,
      agence_id: sql.BigInt
    };

    Object.keys(fieldMappings).forEach(field => {
      if (updateData[field] !== undefined) {
        updateFields.push(`${field} = @${field}`);
        request.input(field, fieldMappings[field], updateData[field]);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        error: 'Aucune donnée à mettre à jour'
      });
    }

    updateFields.push('updated_at = GETDATE()');

    const result = await request.query(`
      UPDATE MessageAccueil 
      SET ${updateFields.join(', ')}
      OUTPUT INSERTED.*
      WHERE id = @id
    `);

    res.json({
      success: true,
      message: 'Message mis à jour avec succès',
      data: result.recordset[0]
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du message:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: error.message
    });
  }
};

/**
 * Supprimer (désactiver) un message (ADMIN uniquement)
 */
exports.deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await getConnection();

    // Vérifier que le message existe
    const checkResult = await pool.request()
      .input('id', sql.BigInt, id)
      .query('SELECT id, titre FROM MessageAccueil WHERE id = @id');

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({
        error: 'Message introuvable'
      });
    }

    const message = checkResult.recordset[0];

    // Désactiver le message au lieu de le supprimer (soft delete)
    await pool.request()
      .input('id', sql.BigInt, id)
      .query('UPDATE MessageAccueil SET actif = 0, updated_at = GETDATE() WHERE id = @id');

    res.json({
      success: true,
      message: `Message "${message.titre}" désactivé avec succès`
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du message:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: error.message
    });
  }
};

/**
 * Marquer un message comme lu
 */
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const pool = await getConnection();

    // Vérifier que le message existe
    const checkResult = await pool.request()
      .input('id', sql.BigInt, id)
      .query('SELECT id FROM MessageAccueil WHERE id = @id');

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({
        error: 'Message introuvable'
      });
    }

    // Insérer ou ignorer si déjà lu
    await pool.request()
      .input('message_id', sql.BigInt, id)
      .input('utilisateur_id', sql.BigInt, user_id)
      .query(`
        IF NOT EXISTS (SELECT 1 FROM MessageLecture WHERE message_id = @message_id AND utilisateur_id = @utilisateur_id)
        BEGIN
          INSERT INTO MessageLecture (message_id, utilisateur_id)
          VALUES (@message_id, @utilisateur_id)
        END
      `);

    res.json({
      success: true,
      message: 'Message marqué comme lu'
    });
  } catch (error) {
    console.error('Erreur lors du marquage du message:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: error.message
    });
  }
};

module.exports = exports;
