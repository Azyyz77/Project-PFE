const { getConnection } = require('../config/database');
const path = require('path');
const fs = require('fs');
const { calculateSizeInMB, uploadsDir } = require('../middleware/uploadMiddleware');

class AttachmentController {
  // Upload de fichier(s)
  async uploadFile(req, res) {
    try {
      const { entiteType, entiteId } = req.body;
      const files = req.files;

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Aucun fichier fourni'
        });
      }

      const pool = await getConnection();
      const uploadedFiles = [];

      // Traiter chaque fichier
      for (const file of files) {
        const sizeInMB = calculateSizeInMB(file.size);
        
        // Insérer dans la base de données
        const result = await pool.request()
          .input('entite_type', entiteType)
          .input('entite_id', parseInt(entiteId))
          .input('url', file.filename) // Stocker seulement le nom du fichier
          .input('type_mime', file.mimetype)
          .input('taille_mo', sizeInMB)
          .query(`
            INSERT INTO PieceJointe (entite_type, entite_id, url, type_mime, taille_mo, date_upload)
            OUTPUT INSERTED.*
            VALUES (@entite_type, @entite_id, @url, @type_mime, @taille_mo, GETDATE())
          `);

        uploadedFiles.push({
          id: result.recordset[0].id,
          originalName: file.originalname,
          filename: file.filename,
          mimetype: file.mimetype,
          size: file.size,
          sizeInMB: sizeInMB,
          uploadDate: result.recordset[0].date_upload
        });
      }

      res.json({
        success: true,
        message: `${uploadedFiles.length} fichier(s) uploadé(s) avec succès`,
        files: uploadedFiles
      });

    } catch (error) {
      console.error('Erreur upload:', error);
      
      // Nettoyer les fichiers en cas d'erreur
      if (req.files) {
        req.files.forEach(file => {
          const filePath = path.join(uploadsDir, file.filename);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'upload des fichiers'
      });
    }
  }

  // Récupérer les pièces jointes d'une entité
  async getAttachments(req, res) {
    try {
      const { entiteType, entiteId } = req.params;

      const pool = await getConnection();
      const result = await pool.request()
        .input('entite_type', entiteType)
        .input('entite_id', parseInt(entiteId))
        .query(`
          SELECT 
            id,
            entite_type,
            entite_id,
            url,
            type_mime,
            taille_mo,
            date_upload,
            statut_moderation,
            modere_par,
            date_moderation,
            commentaire_moderation
          FROM PieceJointe 
          WHERE entite_type = @entite_type AND entite_id = @entite_id
          ORDER BY date_upload DESC
        `);

      const attachments = result.recordset.map(attachment => ({
        ...attachment,
        isImage: attachment.type_mime?.startsWith('image/') || false,
        downloadUrl: `/api/attachments/${attachment.id}/download`
      }));

      res.json({
        success: true,
        attachments
      });

    } catch (error) {
      console.error('Erreur récupération pièces jointes:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des pièces jointes'
      });
    }
  }

  // Supprimer une pièce jointe
  async deleteAttachment(req, res) {
    try {
      const { id } = req.params;

      const pool = await getConnection();
      
      // Récupérer les infos du fichier avant suppression
      const fileResult = await pool.request()
        .input('id', parseInt(id))
        .query('SELECT url FROM PieceJointe WHERE id = @id');

      if (fileResult.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Pièce jointe non trouvée'
        });
      }

      const filename = fileResult.recordset[0].url;
      
      // Supprimer de la base de données
      await pool.request()
        .input('id', parseInt(id))
        .query('DELETE FROM PieceJointe WHERE id = @id');

      // Supprimer le fichier physique
      const filePath = path.join(uploadsDir, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      res.json({
        success: true,
        message: 'Pièce jointe supprimée avec succès'
      });

    } catch (error) {
      console.error('Erreur suppression pièce jointe:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression de la pièce jointe'
      });
    }
  }

  // Télécharger une pièce jointe
  async downloadAttachment(req, res) {
    try {
      const { id } = req.params;
      
      // Handle token from query parameter for direct download links
      let token = req.headers.authorization?.replace('Bearer ', '');
      if (!token && req.query.token) {
        token = req.query.token;
        // Verify the token manually since middleware might not have processed it
        const jwt = require('jsonwebtoken');
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          req.user = decoded;
        } catch (error) {
          return res.status(401).json({
            success: false,
            message: 'Token invalide'
          });
        }
      }

      const pool = await getConnection();
      const result = await pool.request()
        .input('id', parseInt(id))
        .query('SELECT url, type_mime FROM PieceJointe WHERE id = @id');

      if (result.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Pièce jointe non trouvée'
        });
      }

      const { url: filename, type_mime } = result.recordset[0];
      const filePath = path.resolve(uploadsDir, filename);

      // Vérifier que le fichier existe
      if (!fs.existsSync(filePath)) {
        console.error('File not found:', filePath);
        return res.status(404).json({
          success: false,
          message: 'Fichier physique non trouvé'
        });
      }

      console.log('Sending file:', filePath);
      
      // Définir les headers appropriés
      res.setHeader('Content-Type', type_mime || 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      // Envoyer le fichier
      res.sendFile(filePath);

    } catch (error) {
      console.error('Erreur téléchargement pièce jointe:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors du téléchargement de la pièce jointe'
      });
    }
  }

  // Obtenir les statistiques des pièces jointes
  async getAttachmentStats(req, res) {
    try {
      const pool = await getConnection();
      const result = await pool.request().query(`
        SELECT 
          entite_type,
          COUNT(*) as total_files,
          SUM(taille_mo) as total_size_mb,
          AVG(taille_mo) as avg_size_mb
        FROM PieceJointe 
        GROUP BY entite_type
        ORDER BY total_files DESC
      `);

      res.json({
        success: true,
        stats: result.recordset
      });

    } catch (error) {
      console.error('Erreur statistiques pièces jointes:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des statistiques'
      });
    }
  }
}

module.exports = new AttachmentController();