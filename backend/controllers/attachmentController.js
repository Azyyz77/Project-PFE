const sql = require('mssql');
const poolPromise = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuration de multer pour l'upload de fichiers
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/attachments');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx|xls|xlsx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé'));
    }
  }
}).single('file');

// Upload d'une pièce jointe
exports.uploadAttachment = async (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier fourni' });
    }

    try {
      const { entite_type, entite_id } = req.body;

      if (!entite_type || !entite_id) {
        return res.status(400).json({ message: 'Type et ID d\'entité requis' });
      }

      const fileUrl = `/uploads/attachments/${req.file.filename}`;
      const fileSizeMB = req.file.size / (1024 * 1024);

      const pool = await poolPromise;
      const result = await pool.request()
        .input('entite_type', sql.NVarChar(20), entite_type)
        .input('entite_id', sql.BigInt, entite_id)
        .input('url', sql.NVarChar(500), fileUrl)
        .input('type_mime', sql.NVarChar(100), req.file.mimetype)
        .input('taille_mo', sql.Decimal(8, 2), fileSizeMB.toFixed(2))
        .query(`
          INSERT INTO PieceJointe (entite_type, entite_id, url, type_mime, taille_mo, date_upload)
          VALUES (@entite_type, @entite_id, @url, @type_mime, @taille_mo, GETDATE());
          SELECT SCOPE_IDENTITY() AS id;
        `);

      res.status(201).json({
        message: 'Fichier uploadé avec succès',
        id: result.recordset[0].id,
        url: fileUrl,
        filename: req.file.filename
      });
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  });
};

// Récupérer les pièces jointes d'une entité
exports.getAttachments = async (req, res) => {
  try {
    const { entite_type, entite_id } = req.params;

    const pool = await poolPromise;
    const result = await pool.request()
      .input('entite_type', sql.NVarChar(20), entite_type)
      .input('entite_id', sql.BigInt, entite_id)
      .query(`
        SELECT * FROM PieceJointe
        WHERE entite_type = @entite_type AND entite_id = @entite_id
        ORDER BY date_upload DESC
      `);
    
    res.json(result.recordset);
  } catch (error) {
    console.error('Erreur lors de la récupération des pièces jointes:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Supprimer une pièce jointe
exports.deleteAttachment = async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await poolPromise;
    
    // Récupérer l'URL du fichier
    const fileResult = await pool.request()
      .input('id', sql.BigInt, id)
      .query('SELECT url FROM PieceJointe WHERE id = @id');

    if (fileResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Pièce jointe non trouvée' });
    }

    const fileUrl = fileResult.recordset[0].url;
    const filePath = path.join(__dirname, '..', fileUrl);

    // Supprimer le fichier physique
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Supprimer l'enregistrement de la base de données
    await pool.request()
      .input('id', sql.BigInt, id)
      .query('DELETE FROM PieceJointe WHERE id = @id');

    res.json({ message: 'Pièce jointe supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la pièce jointe:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
