const { getConnection, sql } = require('../config/database');

// ============================================================================
// SECTIONS D'INFORMATION
// ============================================================================

/**
 * Obtenir toutes les sections (avec compteurs)
 */
exports.getAllSections = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .query(`
        SELECT * FROM VueSectionsInformation
        ORDER BY ordre ASC
      `);

    res.json({
      success: true,
      data: result.recordset
    });
  } catch (error) {
    console.error('Erreur getAllSections:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des sections'
    });
  }
};

/**
 * Obtenir les sections actives (pour les clients)
 */
exports.getActiveSections = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .query(`
        SELECT * FROM VueSectionsInformation
        WHERE actif = 1
        ORDER BY ordre ASC
      `);

    res.json({
      success: true,
      data: result.recordset
    });
  } catch (error) {
    console.error('Erreur getActiveSections:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des sections'
    });
  }
};

/**
 * Obtenir une section par slug
 */
exports.getSectionBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const pool = await getConnection();
    
    const result = await pool.request()
      .input('slug', sql.NVarChar(200), slug)
      .query(`
        SELECT * FROM SectionInformation
        WHERE slug = @slug AND actif = 1
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Section non trouvée'
      });
    }

    res.json({
      success: true,
      data: result.recordset[0]
    });
  } catch (error) {
    console.error('Erreur getSectionBySlug:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération de la section'
    });
  }
};

/**
 * Créer une nouvelle section (Admin)
 */
exports.createSection = async (req, res) => {
  try {
    const { titre, slug, icone, ordre } = req.body;

    if (!titre || !slug) {
      return res.status(400).json({
        success: false,
        error: 'Titre et slug sont requis'
      });
    }

    const pool = await getConnection();
    const result = await pool.request()
      .input('titre', sql.NVarChar(200), titre)
      .input('slug', sql.NVarChar(200), slug)
      .input('icone', sql.NVarChar(50), icone || null)
      .input('ordre', sql.Int, ordre || 0)
      .query(`
        INSERT INTO SectionInformation (titre, slug, icone, ordre)
        OUTPUT INSERTED.*
        VALUES (@titre, @slug, @icone, @ordre)
      `);

    res.status(201).json({
      success: true,
      message: 'Section créée avec succès',
      data: result.recordset[0]
    });
  } catch (error) {
    console.error('Erreur createSection:', error);
    if (error.number === 2627) { // Duplicate key
      return res.status(400).json({
        success: false,
        error: 'Ce slug existe déjà'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création de la section'
    });
  }
};

/**
 * Mettre à jour une section (Admin)
 */
exports.updateSection = async (req, res) => {
  try {
    const { id } = req.params;
    const { titre, slug, icone, ordre, actif } = req.body;

    const pool = await getConnection();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('titre', sql.NVarChar(200), titre)
      .input('slug', sql.NVarChar(200), slug)
      .input('icone', sql.NVarChar(50), icone || null)
      .input('ordre', sql.Int, ordre)
      .input('actif', sql.Bit, actif)
      .query(`
        UPDATE SectionInformation
        SET titre = @titre,
            slug = @slug,
            icone = @icone,
            ordre = @ordre,
            actif = @actif,
            date_modification = GETDATE()
        OUTPUT INSERTED.*
        WHERE id = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Section non trouvée'
      });
    }

    res.json({
      success: true,
      message: 'Section mise à jour avec succès',
      data: result.recordset[0]
    });
  } catch (error) {
    console.error('Erreur updateSection:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour de la section'
    });
  }
};

/**
 * Supprimer une section (Admin)
 */
exports.deleteSection = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getConnection();
    
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM SectionInformation WHERE id = @id');

    res.json({
      success: true,
      message: 'Section supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur deleteSection:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la suppression de la section'
    });
  }
};

// ============================================================================
// CONTENUS D'INFORMATION
// ============================================================================

/**
 * Obtenir tous les contenus d'une section
 */
exports.getContentsBySection = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const pool = await getConnection();
    
    const result = await pool.request()
      .input('sectionId', sql.Int, sectionId)
      .query(`
        SELECT * FROM ContenuInformation
        WHERE section_id = @sectionId AND actif = 1
        ORDER BY ordre ASC
      `);

    res.json({
      success: true,
      data: result.recordset
    });
  } catch (error) {
    console.error('Erreur getContentsBySection:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des contenus'
    });
  }
};

/**
 * Obtenir tous les contenus (Admin)
 */
exports.getAllContents = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .query(`
        SELECT c.*, s.titre as section_titre
        FROM ContenuInformation c
        INNER JOIN SectionInformation s ON c.section_id = s.id
        ORDER BY s.ordre ASC, c.ordre ASC
      `);

    res.json({
      success: true,
      data: result.recordset
    });
  } catch (error) {
    console.error('Erreur getAllContents:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des contenus'
    });
  }
};

/**
 * Créer un nouveau contenu (Admin)
 */
exports.createContent = async (req, res) => {
  try {
    const { section_id, titre, contenu, ordre } = req.body;

    if (!section_id || !titre || !contenu) {
      return res.status(400).json({
        success: false,
        error: 'Section, titre et contenu sont requis'
      });
    }

    const pool = await getConnection();
    const result = await pool.request()
      .input('section_id', sql.Int, section_id)
      .input('titre', sql.NVarChar(300), titre)
      .input('contenu', sql.NVarChar(sql.MAX), contenu)
      .input('ordre', sql.Int, ordre || 0)
      .query(`
        INSERT INTO ContenuInformation (section_id, titre, contenu, ordre)
        OUTPUT INSERTED.*
        VALUES (@section_id, @titre, @contenu, @ordre)
      `);

    res.status(201).json({
      success: true,
      message: 'Contenu créé avec succès',
      data: result.recordset[0]
    });
  } catch (error) {
    console.error('Erreur createContent:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création du contenu'
    });
  }
};

/**
 * Mettre à jour un contenu (Admin)
 */
exports.updateContent = async (req, res) => {
  try {
    const { id } = req.params;
    const { titre, contenu, ordre, actif } = req.body;

    const pool = await getConnection();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('titre', sql.NVarChar(300), titre)
      .input('contenu', sql.NVarChar(sql.MAX), contenu)
      .input('ordre', sql.Int, ordre)
      .input('actif', sql.Bit, actif)
      .query(`
        UPDATE ContenuInformation
        SET titre = @titre,
            contenu = @contenu,
            ordre = @ordre,
            actif = @actif,
            date_modification = GETDATE()
        OUTPUT INSERTED.*
        WHERE id = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Contenu non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Contenu mis à jour avec succès',
      data: result.recordset[0]
    });
  } catch (error) {
    console.error('Erreur updateContent:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour du contenu'
    });
  }
};

/**
 * Supprimer un contenu (Admin)
 */
exports.deleteContent = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getConnection();
    
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM ContenuInformation WHERE id = @id');

    res.json({
      success: true,
      message: 'Contenu supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur deleteContent:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la suppression du contenu'
    });
  }
};

// ============================================================================
// DOCUMENTS TÉLÉCHARGEABLES
// ============================================================================

/**
 * Obtenir tous les documents actifs
 */
exports.getAllDocuments = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .query(`
        SELECT d.*, s.titre as section_titre
        FROM DocumentTelecharge d
        LEFT JOIN SectionInformation s ON d.section_id = s.id
        WHERE d.actif = 1
        ORDER BY s.ordre ASC, d.titre ASC
      `);

    res.json({
      success: true,
      data: result.recordset
    });
  } catch (error) {
    console.error('Erreur getAllDocuments:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des documents'
    });
  }
};

/**
 * Obtenir les documents d'une section
 */
exports.getDocumentsBySection = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const pool = await getConnection();
    
    const result = await pool.request()
      .input('sectionId', sql.Int, sectionId)
      .query(`
        SELECT * FROM DocumentTelecharge
        WHERE section_id = @sectionId AND actif = 1
        ORDER BY titre ASC
      `);

    res.json({
      success: true,
      data: result.recordset
    });
  } catch (error) {
    console.error('Erreur getDocumentsBySection:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des documents'
    });
  }
};

/**
 * Créer un nouveau document (Admin)
 */
exports.createDocument = async (req, res) => {
  try {
    const { section_id, titre, description, nom_fichier, chemin_fichier, type_fichier, taille_octets } = req.body;

    if (!titre || !nom_fichier || !chemin_fichier) {
      return res.status(400).json({
        success: false,
        error: 'Titre, nom de fichier et chemin sont requis'
      });
    }

    const pool = await getConnection();
    const result = await pool.request()
      .input('section_id', sql.Int, section_id || null)
      .input('titre', sql.NVarChar(300), titre)
      .input('description', sql.NVarChar(sql.MAX), description || null)
      .input('nom_fichier', sql.NVarChar(500), nom_fichier)
      .input('chemin_fichier', sql.NVarChar(1000), chemin_fichier)
      .input('type_fichier', sql.NVarChar(100), type_fichier || null)
      .input('taille_octets', sql.BigInt, taille_octets || null)
      .query(`
        INSERT INTO DocumentTelecharge 
        (section_id, titre, description, nom_fichier, chemin_fichier, type_fichier, taille_octets)
        OUTPUT INSERTED.*
        VALUES (@section_id, @titre, @description, @nom_fichier, @chemin_fichier, @type_fichier, @taille_octets)
      `);

    res.status(201).json({
      success: true,
      message: 'Document créé avec succès',
      data: result.recordset[0]
    });
  } catch (error) {
    console.error('Erreur createDocument:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création du document'
    });
  }
};

/**
 * Mettre à jour un document (Admin)
 */
exports.updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { titre, description, actif } = req.body;

    const pool = await getConnection();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('titre', sql.NVarChar(300), titre)
      .input('description', sql.NVarChar(sql.MAX), description || null)
      .input('actif', sql.Bit, actif)
      .query(`
        UPDATE DocumentTelecharge
        SET titre = @titre,
            description = @description,
            actif = @actif,
            date_modification = GETDATE()
        OUTPUT INSERTED.*
        WHERE id = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Document non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Document mis à jour avec succès',
      data: result.recordset[0]
    });
  } catch (error) {
    console.error('Erreur updateDocument:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour du document'
    });
  }
};

/**
 * Supprimer un document (Admin)
 */
exports.deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getConnection();
    
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM DocumentTelecharge WHERE id = @id');

    res.json({
      success: true,
      message: 'Document supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur deleteDocument:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la suppression du document'
    });
  }
};

/**
 * Incrémenter le compteur de téléchargements
 */
exports.incrementDownloadCount = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getConnection();
    
    await pool.request()
      .input('id', sql.Int, id)
      .query(`
        UPDATE DocumentTelecharge
        SET nombre_telechargements = nombre_telechargements + 1
        WHERE id = @id
      `);

    res.json({
      success: true,
      message: 'Compteur mis à jour'
    });
  } catch (error) {
    console.error('Erreur incrementDownloadCount:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour du compteur'
    });
  }
};

