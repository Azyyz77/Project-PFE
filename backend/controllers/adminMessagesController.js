const { getConnection, sql } = require('../config/database');

/**
 * Controller pour la publication de messages (admin uniquement)
 */

// Publier un message à tous les utilisateurs ou par rôle
const publishMessage = async (req, res) => {
  try {
    const { titre, message, target } = req.body;

    if (!titre || !message || !target) {
      return res.status(400).json({ error: 'Le titre, le message et la cible sont requis' });
    }

    const pool = await getConnection();
    
    // Vérifier que le type PUSH existe dans TypeNotification
    const typeCheck = await pool.request().query(`
      SELECT code FROM TypeNotification WHERE code = 'PUSH'
    `);
    
    if (typeCheck.recordset.length === 0) {
      // Créer le type PUSH s'il n'existe pas
      await pool.request().query(`
        INSERT INTO TypeNotification (code, libelle) VALUES ('PUSH', N'Notification Push')
      `);
    }
    
    // Récupérer les utilisateurs selon la cible
    let query = 'SELECT id FROM Utilisateur WHERE actif = 1';
    
    if (target === 'clients') {
      query += ' AND role_id = (SELECT id FROM Role WHERE nom = \'CLIENT\')';
    } else if (target === 'agents') {
      query += ' AND role_id = (SELECT id FROM Role WHERE nom = \'AGENT\')';
    }
    // Si target === 'all', on prend tous les utilisateurs actifs

    const users = await pool.request().query(query);
    
    if (users.recordset.length === 0) {
      return res.status(400).json({ error: 'Aucun utilisateur trouvé pour cette cible' });
    }
    
    // Créer une notification pour chaque utilisateur
    const dateEnvoi = new Date();
    
    for (const user of users.recordset) {
      await pool.request()
        .input('utilisateur_id', sql.BigInt, user.id)
        .input('titre', sql.NVarChar(200), titre)
        .input('message', sql.NVarChar(sql.MAX), message)
        .input('lu', sql.Bit, 0)
        .input('type', sql.VarChar(10), 'PUSH')
        .input('date_envoi', sql.DateTime2, dateEnvoi)
        .query(`
          INSERT INTO Notification (utilisateur_id, titre, message, lu, type, date_envoi)
          VALUES (@utilisateur_id, @titre, @message, @lu, @type, @date_envoi)
        `);
    }

    return res.status(201).json({ 
      message: 'Message publié avec succès',
      recipients: users.recordset.length 
    });
  } catch (error) {
    console.error('Erreur publication message:', error);
    return res.status(500).json({ 
      error: 'Erreur lors de la publication du message',
      details: error.message 
    });
  }
};

// Récupérer les messages récents publiés
const getRecentMessages = async (req, res) => {
  try {
    const pool = await getConnection();
    
    // Récupérer les 10 derniers messages uniques (par titre et date)
    const result = await pool.request().query(`
      SELECT TOP 10
        titre,
        message,
        date_envoi,
        COUNT(DISTINCT utilisateur_id) AS recipients_count
      FROM Notification
      WHERE type = 'PUSH'
      GROUP BY titre, message, date_envoi
      ORDER BY date_envoi DESC
    `);

    return res.json({ messages: result.recordset });
  } catch (error) {
    console.error('Erreur récupération messages:', error);
    return res.status(500).json({ error: 'Erreur lors de la récupération des messages' });
  }
};

// Récupérer les notifications d'un utilisateur
const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const pool = await getConnection();
    
    const result = await pool.request()
      .input('userId', sql.BigInt, userId)
      .query(`
        SELECT 
          id,
          titre,
          message,
          lu,
          type,
          date_envoi
        FROM Notification
        WHERE utilisateur_id = @userId
        ORDER BY date_envoi DESC
      `);

    return res.json({ notifications: result.recordset });
  } catch (error) {
    console.error('Erreur récupération notifications:', error);
    return res.status(500).json({ error: 'Erreur lors de la récupération des notifications' });
  }
};

// Marquer une notification comme lue
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const pool = await getConnection();
    
    await pool.request()
      .input('id', sql.BigInt, id)
      .input('userId', sql.BigInt, userId)
      .query(`
        UPDATE Notification
        SET lu = 1
        WHERE id = @id AND utilisateur_id = @userId
      `);

    return res.json({ message: 'Notification marquée comme lue' });
  } catch (error) {
    console.error('Erreur marquage notification:', error);
    return res.status(500).json({ error: 'Erreur lors du marquage de la notification' });
  }
};

// Marquer toutes les notifications comme lues
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    const pool = await getConnection();
    
    await pool.request()
      .input('userId', sql.BigInt, userId)
      .query(`
        UPDATE Notification
        SET lu = 1
        WHERE utilisateur_id = @userId AND lu = 0
      `);

    return res.json({ message: 'Toutes les notifications marquées comme lues' });
  } catch (error) {
    console.error('Erreur marquage notifications:', error);
    return res.status(500).json({ error: 'Erreur lors du marquage des notifications' });
  }
};

// Compter les notifications non lues
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const pool = await getConnection();
    
    const result = await pool.request()
      .input('userId', sql.BigInt, userId)
      .query(`
        SELECT COUNT(*) AS unread_count
        FROM Notification
        WHERE utilisateur_id = @userId AND lu = 0
      `);

    return res.json({ unreadCount: result.recordset[0].unread_count });
  } catch (error) {
    console.error('Erreur comptage notifications:', error);
    return res.status(500).json({ error: 'Erreur lors du comptage des notifications' });
  }
};

module.exports = {
  publishMessage,
  getRecentMessages,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
};
