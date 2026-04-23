const { getConnection } = require('../config/database');
const path = require('path');
const fs = require('fs');
const { uploadsDir } = require('../middleware/uploadMiddleware');

class ModerationController {
  // Récupérer les fichiers en attente de modération
  async getPendingFiles(req, res) {
    try {
      const { page = 1, limit = 10, entiteType } = req.query;
      const offset = (page - 1) * limit;

      const pool = await getConnection();
      
      let whereClause = "WHERE pj.statut_moderation = 'EN_ATTENTE'";
      if (entiteType && ['RDV', 'RECLAMATION'].includes(entiteType)) {
        whereClause += ` AND pj.entite_type = '${entiteType}'`;
      }

      const query = `
        SELECT 
          pj.*,
          u.nom + ' ' + u.prenom AS client_nom,
          u.email AS client_email,
          CASE 
            WHEN pj.entite_type = 'RDV' THEN 'Rendez-vous'
            WHEN pj.entite_type = 'RECLAMATION' THEN 'Réclamation'
            ELSE pj.entite_type
          END AS entite_type_label
        FROM PieceJointe pj
        LEFT JOIN RendezVous rv ON (pj.entite_type = 'RDV' AND pj.entite_id = rv.id)
        LEFT JOIN Reclamation r ON (pj.entite_type = 'RECLAMATION' AND pj.entite_id = r.id)
        LEFT JOIN Utilisateur u ON (u.id = COALESCE(rv.client_id, r.client_id))
        ${whereClause}
        ORDER BY pj.date_upload DESC
        OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY
      `;

      const result = await pool.request().query(query);

      // Compter le total
      const countQuery = `
        SELECT COUNT(*) as total
        FROM PieceJointe pj
        ${whereClause}
      `;
      const countResult = await pool.request().query(countQuery);

      res.json({
        success: true,
        files: result.recordset,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult.recordset[0].total,
          totalPages: Math.ceil(countResult.recordset[0].total / limit)
        }
      });
    } catch (error) {
      console.error('Erreur récupération fichiers en attente:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération'
      });
    }
  }

  // Approuver un fichier
  async approveFile(req, res) {
    try {
      const { id } = req.params;
      const { commentaire } = req.body;
      const moderatorId = req.user.id;

      const pool = await getConnection();
      
      // Vérifier que le fichier existe et est en attente
      const checkResult = await pool.request()
        .input('id', parseInt(id))
        .query('SELECT statut_moderation FROM PieceJointe WHERE id = @id');

      if (checkResult.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Fichier non trouvé'
        });
      }

      if (checkResult.recordset[0].statut_moderation !== 'EN_ATTENTE') {
        return res.status(400).json({
          success: false,
          message: 'Ce fichier a déjà été modéré'
        });
      }

      await pool.request()
        .input('id', parseInt(id))
        .input('moderator_id', moderatorId)
        .input('commentaire', commentaire || null)
        .query(`
          UPDATE PieceJointe 
          SET 
            statut_moderation = 'APPROUVE',
            modere_par = @moderator_id,
            date_moderation = GETDATE(),
            commentaire_moderation = @commentaire
          WHERE id = @id
        `);

      res.json({
        success: true,
        message: 'Fichier approuvé avec succès'
      });
    } catch (error) {
      console.error('Erreur approbation fichier:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'approbation'
      });
    }
  }

  // Rejeter un fichier
  async rejectFile(req, res) {
    try {
      const { id } = req.params;
      const { commentaire } = req.body;
      const moderatorId = req.user.id;

      if (!commentaire || !commentaire.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Un commentaire est requis pour le rejet'
        });
      }

      const pool = await getConnection();
      
      // Vérifier que le fichier existe et est en attente
      const checkResult = await pool.request()
        .input('id', parseInt(id))
        .query('SELECT statut_moderation FROM PieceJointe WHERE id = @id');

      if (checkResult.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Fichier non trouvé'
        });
      }

      if (checkResult.recordset[0].statut_moderation !== 'EN_ATTENTE') {
        return res.status(400).json({
          success: false,
          message: 'Ce fichier a déjà été modéré'
        });
      }

      await pool.request()
        .input('id', parseInt(id))
        .input('moderator_id', moderatorId)
        .input('commentaire', commentaire.trim())
        .query(`
          UPDATE PieceJointe 
          SET 
            statut_moderation = 'REJETE',
            modere_par = @moderator_id,
            date_moderation = GETDATE(),
            commentaire_moderation = @commentaire
          WHERE id = @id
        `);

      res.json({
        success: true,
        message: 'Fichier rejeté avec succès'
      });
    } catch (error) {
      console.error('Erreur rejet fichier:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors du rejet'
      });
    }
  }

  // Obtenir l'historique de modération
  async getModerationHistory(req, res) {
    try {
      const { page = 1, limit = 20, status } = req.query;
      const offset = (page - 1) * limit;

      const pool = await getConnection();
      
      let whereClause = "WHERE pj.statut_moderation IN ('APPROUVE', 'REJETE')";
      if (status && ['APPROUVE', 'REJETE'].includes(status)) {
        whereClause = `WHERE pj.statut_moderation = '${status}'`;
      }

      const query = `
        SELECT 
          pj.*,
          u.nom + ' ' + u.prenom AS client_nom,
          u.email AS client_email,
          m.nom + ' ' + m.prenom AS moderateur_nom,
          CASE 
            WHEN pj.entite_type = 'RDV' THEN 'Rendez-vous'
            WHEN pj.entite_type = 'RECLAMATION' THEN 'Réclamation'
            ELSE pj.entite_type
          END AS entite_type_label
        FROM PieceJointe pj
        LEFT JOIN RendezVous rv ON (pj.entite_type = 'RDV' AND pj.entite_id = rv.id)
        LEFT JOIN Reclamation r ON (pj.entite_type = 'RECLAMATION' AND pj.entite_id = r.id)
        LEFT JOIN Utilisateur u ON (u.id = COALESCE(rv.client_id, r.client_id))
        LEFT JOIN Utilisateur m ON m.id = pj.modere_par
        ${whereClause}
        ORDER BY pj.date_moderation DESC
        OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY
      `;

      const result = await pool.request().query(query);

      // Compter le total
      const countQuery = `
        SELECT COUNT(*) as total
        FROM PieceJointe pj
        ${whereClause}
      `;
      const countResult = await pool.request().query(countQuery);

      res.json({
        success: true,
        files: result.recordset,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult.recordset[0].total,
          totalPages: Math.ceil(countResult.recordset[0].total / limit)
        }
      });
    } catch (error) {
      console.error('Erreur historique modération:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération de l\'historique'
      });
    }
  }

  // Statistiques de modération
  async getModerationStats(req, res) {
    try {
      const pool = await getConnection();
      
      const statsQuery = `
        SELECT 
          statut_moderation,
          COUNT(*) as count,
          ROUND(AVG(taille_mo), 2) as avg_size_mb,
          SUM(taille_mo) as total_size_mb
        FROM PieceJointe 
        GROUP BY statut_moderation
        
        UNION ALL
        
        SELECT 
          'TOTAL' as statut_moderation,
          COUNT(*) as count,
          ROUND(AVG(taille_mo), 2) as avg_size_mb,
          SUM(taille_mo) as total_size_mb
        FROM PieceJointe
      `;

      const moderatorStatsQuery = `
        SELECT 
          m.nom + ' ' + m.prenom AS moderateur_nom,
          COUNT(*) as files_moderated,
          SUM(CASE WHEN pj.statut_moderation = 'APPROUVE' THEN 1 ELSE 0 END) as approved,
          SUM(CASE WHEN pj.statut_moderation = 'REJETE' THEN 1 ELSE 0 END) as rejected
        FROM PieceJointe pj
        JOIN Utilisateur m ON m.id = pj.modere_par
        WHERE pj.statut_moderation IN ('APPROUVE', 'REJETE')
        GROUP BY pj.modere_par, m.nom, m.prenom
        ORDER BY files_moderated DESC
      `;

      const [statsResult, moderatorResult] = await Promise.all([
        pool.request().query(statsQuery),
        pool.request().query(moderatorStatsQuery)
      ]);

      res.json({
        success: true,
        stats: {
          byStatus: statsResult.recordset,
          byModerator: moderatorResult.recordset
        }
      });
    } catch (error) {
      console.error('Erreur stats modération:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des statistiques'
      });
    }
  }

  // Obtenir les détails d'un fichier pour modération
  async getFileDetails(req, res) {
    try {
      const { id } = req.params;

      const pool = await getConnection();
      const result = await pool.request()
        .input('id', parseInt(id))
        .query(`
          SELECT 
            pj.*,
            u.nom + ' ' + u.prenom AS client_nom,
            u.email AS client_email,
            u.telephone AS client_telephone,
            CASE 
              WHEN pj.entite_type = 'RDV' THEN 'Rendez-vous'
              WHEN pj.entite_type = 'RECLAMATION' THEN 'Réclamation'
              ELSE pj.entite_type
            END AS entite_type_label,
            CASE 
              WHEN pj.modere_par IS NOT NULL THEN m.nom + ' ' + m.prenom
              ELSE NULL
            END AS moderateur_nom
          FROM PieceJointe pj
          LEFT JOIN RendezVous rv ON (pj.entite_type = 'RDV' AND pj.entite_id = rv.id)
          LEFT JOIN Reclamation r ON (pj.entite_type = 'RECLAMATION' AND pj.entite_id = r.id)
          LEFT JOIN Utilisateur u ON (u.id = COALESCE(rv.client_id, r.client_id))
          LEFT JOIN Utilisateur m ON m.id = pj.modere_par
          WHERE pj.id = @id
        `);

      if (result.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Fichier non trouvé'
        });
      }

      const file = result.recordset[0];
      
      // Vérifier si le fichier physique existe
      const filePath = path.join(uploadsDir, file.url);
      const fileExists = fs.existsSync(filePath);

      res.json({
        success: true,
        file: {
          ...file,
          fileExists,
          downloadUrl: `/api/attachments/${file.id}/download`
        }
      });
    } catch (error) {
      console.error('Erreur détails fichier:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des détails'
      });
    }
  }
}

module.exports = new ModerationController();