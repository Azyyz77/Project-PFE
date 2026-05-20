const { getConnection, sql } = require('../config/database');
const path = require('path');
const fs = require('fs');
const { calculateSizeInMB, uploadsDir } = require('../middleware/uploadMiddleware');

const isExternalUrl = (url) => /^https?:\/\//i.test(url || '');
const isAbsolutePath = (url) => (url || '').startsWith('/');
const isLocalFilename = (url) => {
  if (!url) return false;
  if (isExternalUrl(url) || isAbsolutePath(url)) return false;
  return !url.includes('/') && !url.includes('\\');
};

const buildDownloadUrl = (req, id) => `${req.protocol}://${req.get('host')}/api/documents/${id}/download`;

const withDownloadUrl = (req, doc) => {
  const downloadUrl = isLocalFilename(doc.url) ? buildDownloadUrl(req, doc.id) : doc.url;
  return { ...doc, download_url: downloadUrl };
};

// Récupérer tous les documents
exports.getAllDocuments = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .query(`
        SELECT * FROM Document
        WHERE actif = 1
        ORDER BY date_creation DESC
      `);
    
    const documents = result.recordset.map((doc) => withDownloadUrl(req, doc));
    res.json(documents);
  } catch (error) {
    console.error('Erreur lors de la récupération des documents:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Récupérer les documents par catégorie
exports.getDocumentsByCategory = async (req, res) => {
  try {
    const { categorie } = req.params;

    const pool = await getConnection();
    const result = await pool.request()
      .input('categorie', sql.NVarChar(50), categorie)
      .query(`
        SELECT * FROM Document
        WHERE categorie = @categorie
        ORDER BY titre
      `);
    
    const documents = result.recordset.map((doc) => withDownloadUrl(req, doc));
    res.json(documents);
  } catch (error) {
    console.error('Erreur lors de la récupération des documents:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Upload d'un document (admin)
exports.uploadDocument = async (req, res) => {
  try {
    const { titre, description, categorie } = req.body;
    const file = req.file;
    const admin_id = req.user.id;

    if (!file) {
      return res.status(400).json({ message: 'Fichier requis' });
    }

    if (!categorie) {
      return res.status(400).json({ message: 'Catégorie requise' });
    }

    const derivedTitle = titre && titre.trim()
      ? titre.trim()
      : path.parse(file.originalname).name;

    if (!derivedTitle) {
      return res.status(400).json({ message: 'Titre requis' });
    }

    const sizeInMB = calculateSizeInMB(file.size);

    const pool = await getConnection();
    const result = await pool.request()
      .input('titre', sql.NVarChar(200), derivedTitle)
      .input('description', sql.NVarChar(sql.MAX), description || null)
      .input('url', sql.NVarChar(500), file.filename)
      .input('categorie', sql.NVarChar(50), categorie)
      .input('type_mime', sql.NVarChar(100), file.mimetype || null)
      .input('taille_mo', sql.Decimal(10, 2), sizeInMB)
      .input('admin_id', sql.BigInt, admin_id)
      .query(`
        INSERT INTO Document (titre, description, url, categorie, type_mime, taille_mo, admin_id, actif, date_creation)
        VALUES (@titre, @description, @url, @categorie, @type_mime, @taille_mo, @admin_id, 1, GETDATE());
        SELECT SCOPE_IDENTITY() AS id;
      `);

    const documentId = result.recordset[0].id;

    res.status(201).json({
      message: 'Document créé avec succès',
      id: documentId,
      download_url: buildDownloadUrl(req, documentId)
    });
  } catch (error) {
    console.error('Erreur lors de l\'upload du document:', error);

    if (req.file) {
      const filePath = path.join(uploadsDir, req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Créer un document
exports.createDocument = async (req, res) => {
  try {
    const { titre, description, url, categorie, type_mime, taille_mo } = req.body;
    const admin_id = req.user.id; // Get admin ID from authenticated user
    
    if (!titre || !url || !categorie) {
      return res.status(400).json({ message: 'Titre, URL et catégorie sont requis' });
    }

    const pool = await getConnection();
    const result = await pool.request()
      .input('titre', sql.NVarChar(200), titre)
      .input('description', sql.NVarChar(sql.MAX), description || null)
      .input('url', sql.NVarChar(500), url)
      .input('categorie', sql.NVarChar(50), categorie)
      .input('type_mime', sql.NVarChar(100), type_mime || null)
      .input('taille_mo', sql.Decimal(10, 2), taille_mo || null)
      .input('admin_id', sql.BigInt, admin_id)
      .query(`
        INSERT INTO Document (titre, description, url, categorie, type_mime, taille_mo, admin_id, actif, date_creation)
        VALUES (@titre, @description, @url, @categorie, @type_mime, @taille_mo, @admin_id, 1, GETDATE());
        SELECT SCOPE_IDENTITY() AS id;
      `);

    res.status(201).json({
      message: 'Document créé avec succès',
      id: result.recordset[0].id
    });
  } catch (error) {
    console.error('Erreur lors de la création du document:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Mettre à jour un document
exports.updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { titre, description, url, categorie, actif } = req.body;
    const file = req.file;

    const pool = await getConnection();
    const existingResult = await pool.request()
      .input('id', sql.BigInt, id)
      .query(`
        SELECT id, titre, description, url, categorie, type_mime, taille_mo, actif
        FROM Document
        WHERE id = @id
      `);

    if (existingResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Document non trouvé' });
    }

    const existing = existingResult.recordset[0];

    const nextTitle = typeof titre === 'string' ? titre.trim() : existing.titre;
    const nextCategory = typeof categorie === 'string' ? categorie.trim() : existing.categorie;

    if (!nextTitle) {
      return res.status(400).json({ message: 'Titre requis' });
    }

    if (!nextCategory) {
      return res.status(400).json({ message: 'Catégorie requise' });
    }

    const nextDescription = description !== undefined
      ? (description && String(description).trim() ? String(description).trim() : null)
      : existing.description;

    let nextUrl = existing.url;
    let nextTypeMime = existing.type_mime;
    let nextSize = existing.taille_mo;

    let shouldDeleteOldFile = false;

    if (file) {
      nextUrl = file.filename;
      nextTypeMime = file.mimetype || null;
      nextSize = calculateSizeInMB(file.size);
      shouldDeleteOldFile = isLocalFilename(existing.url);
    } else if (typeof url === 'string' && url.trim()) {
      const trimmedUrl = url.trim();
      if (trimmedUrl !== existing.url) {
        shouldDeleteOldFile = isLocalFilename(existing.url);
      }
      nextUrl = trimmedUrl;
    }

    const nextActif = actif === undefined
      ? existing.actif
      : (actif === true || actif === 'true' || actif === 1 || actif === '1');

    await pool.request()
      .input('id', sql.BigInt, id)
      .input('titre', sql.NVarChar(200), nextTitle)
      .input('description', sql.NVarChar(sql.MAX), nextDescription)
      .input('url', sql.NVarChar(500), nextUrl)
      .input('categorie', sql.NVarChar(50), nextCategory)
      .input('type_mime', sql.NVarChar(100), nextTypeMime || null)
      .input('taille_mo', sql.Decimal(10, 2), nextSize || null)
      .input('actif', sql.Bit, nextActif)
      .query(`
        UPDATE Document
        SET titre = @titre, description = @description, url = @url,
            categorie = @categorie, type_mime = @type_mime, taille_mo = @taille_mo, actif = @actif
        WHERE id = @id
      `);

    if (shouldDeleteOldFile) {
      const oldPath = path.join(uploadsDir, existing.url);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    res.json({ message: 'Document mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du document:', error);

    if (req.file) {
      const filePath = path.join(uploadsDir, req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Supprimer un document
exports.deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await getConnection();
    const existing = await pool.request()
      .input('id', sql.BigInt, id)
      .query('SELECT url FROM Document WHERE id = @id');

    if (existing.recordset.length === 0) {
      return res.status(404).json({ message: 'Document non trouvé' });
    }

    const documentUrl = existing.recordset[0].url;

    await pool.request()
      .input('id', sql.BigInt, id)
      .query('DELETE FROM Document WHERE id = @id');

    if (isLocalFilename(documentUrl)) {
      const filePath = path.join(uploadsDir, documentUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.json({ message: 'Document supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du document:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Télécharger un document
exports.downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;

    let token = req.headers.authorization?.replace('Bearer ', '');
    if (!token && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({ message: 'Token requis' });
    }

    const jwt = require('jsonwebtoken');
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (error) {
      return res.status(401).json({ message: 'Token invalide' });
    }

    const pool = await getConnection();
    const result = await pool.request()
      .input('id', sql.BigInt, id)
      .query(`
        SELECT id, titre, url, type_mime
        FROM Document
        WHERE id = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Document non trouvé' });
    }

    const document = result.recordset[0];

    if (!isLocalFilename(document.url)) {
      return res.redirect(document.url);
    }

    const filePath = path.resolve(uploadsDir, document.url);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Fichier non trouvé' });
    }

    const extension = path.extname(document.url);
    const downloadName = document.titre ? `${document.titre}${extension}` : document.url;

    res.setHeader('Content-Type', document.type_mime || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);
    res.sendFile(filePath);
  } catch (error) {
    console.error('Erreur lors du téléchargement du document:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
