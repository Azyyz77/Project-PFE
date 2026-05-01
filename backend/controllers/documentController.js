const { getConnection, sql } = require('../config/database');

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
    
    res.json(result.recordset);
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
    
    res.json(result.recordset);
  } catch (error) {
    console.error('Erreur lors de la récupération des documents:', error);
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
    const { titre, description, url, categorie, type_mime, taille_mo, actif } = req.body;

    const pool = await getConnection();
    await pool.request()
      .input('id', sql.BigInt, id)
      .input('titre', sql.NVarChar(200), titre)
      .input('description', sql.NVarChar(sql.MAX), description || null)
      .input('url', sql.NVarChar(500), url)
      .input('categorie', sql.NVarChar(50), categorie)
      .input('type_mime', sql.NVarChar(100), type_mime || null)
      .input('taille_mo', sql.Decimal(10, 2), taille_mo || null)
      .input('actif', sql.Bit, actif !== undefined ? actif : true)
      .query(`
        UPDATE Document
        SET titre = @titre, description = @description, url = @url,
            categorie = @categorie, type_mime = @type_mime, taille_mo = @taille_mo, actif = @actif
        WHERE id = @id
      `);

    res.json({ message: 'Document mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du document:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Supprimer un document
exports.deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await getConnection();
    await pool.request()
      .input('id', sql.BigInt, id)
      .query('DELETE FROM Document WHERE id = @id');

    res.json({ message: 'Document supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du document:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
