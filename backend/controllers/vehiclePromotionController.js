/**
 * Contrôleur pour la gestion des promotions véhicules
 */

const { getConnection, sql } = require('../config/database');

/**
 * Obtenir toutes les promotions actives (pour clients)
 */
exports.getActivePromotions = async (req, res) => {
  try {
    const { agence_id, marque_id } = req.query;

    const pool = await getConnection();
    let query = `
      SELECT * FROM VuePromotionsActives
      WHERE 1=1
    `;

    const request = pool.request();

    if (agence_id) {
      query += ' AND (agence_id = @agence_id OR agence_id IS NULL)';
      request.input('agence_id', sql.BigInt, agence_id);
    }

    if (marque_id) {
      query += ' AND marque_id = @marque_id';
      request.input('marque_id', sql.BigInt, marque_id);
    }

    query += ' ORDER BY date_debut DESC';

    const result = await request.query(query);

    res.json({
      success: true,
      promotions: result.recordset
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des promotions:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: error.message
    });
  }
};

/**
 * Obtenir toutes les promotions (pour admin)
 */
exports.getAllPromotions = async (req, res) => {
  try {
    const { actif, agence_id } = req.query;

    const pool = await getConnection();
    let query = `
      SELECT 
        p.*,
        mar.nom AS marque_nom,
        mod.nom AS modele_nom,
        ver.nom AS version_nom,
        a.nom AS agence_nom
      FROM PromotionVehicule p
      LEFT JOIN Marque mar ON p.marque_id = mar.id
      LEFT JOIN Modele mod ON p.modele_id = mod.id
      LEFT JOIN Version ver ON p.version_id = ver.id
      LEFT JOIN Agence a ON p.agence_id = a.id
      WHERE 1=1
    `;

    const request = pool.request();

    if (actif !== undefined) {
      query += ' AND p.actif = @actif';
      request.input('actif', sql.Bit, actif === 'true' ? 1 : 0);
    }

    if (agence_id) {
      query += ' AND (p.agence_id = @agence_id OR p.agence_id IS NULL)';
      request.input('agence_id', sql.BigInt, agence_id);
    }

    query += ' ORDER BY p.created_at DESC';

    const result = await request.query(query);

    res.json({
      success: true,
      promotions: result.recordset
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des promotions:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: error.message
    });
  }
};

/**
 * Obtenir une promotion par ID
 */
exports.getPromotionById = async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await getConnection();
    const result = await pool.request()
      .input('id', sql.BigInt, id)
      .query(`
        SELECT 
          p.*,
          mar.nom AS marque_nom,
          mod.nom AS modele_nom,
          ver.nom AS version_nom,
          a.nom AS agence_nom
        FROM PromotionVehicule p
        LEFT JOIN Marque mar ON p.marque_id = mar.id
        LEFT JOIN Modele mod ON p.modele_id = mod.id
        LEFT JOIN Version ver ON p.version_id = ver.id
        LEFT JOIN Agence a ON p.agence_id = a.id
        WHERE p.id = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        error: 'Promotion introuvable'
      });
    }

    res.json({
      success: true,
      promotion: result.recordset[0]
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la promotion:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: error.message
    });
  }
};

/**
 * Créer une nouvelle promotion (ADMIN uniquement)
 */
exports.createPromotion = async (req, res) => {
  try {
    const {
      titre,
      description,
      marque_id,
      modele_id,
      version_id,
      prix_original,
      prix_promotion,
      pourcentage_reduction,
      image_url,
      date_debut,
      date_fin,
      stock_disponible,
      conditions,
      agence_id
    } = req.body;

    const created_by = req.user.id;

    // Validation
    if (!titre || !prix_promotion || !date_debut || !date_fin) {
      return res.status(400).json({
        error: 'Données manquantes',
        message: 'Titre, prix promotion, date début et date fin sont requis'
      });
    }

    const pool = await getConnection();
    const result = await pool.request()
      .input('titre', sql.NVarChar, titre)
      .input('description', sql.NVarChar, description || null)
      .input('marque_id', sql.BigInt, marque_id || null)
      .input('modele_id', sql.BigInt, modele_id || null)
      .input('version_id', sql.BigInt, version_id || null)
      .input('prix_original', sql.Decimal(18, 2), prix_original || null)
      .input('prix_promotion', sql.Decimal(18, 2), prix_promotion)
      .input('pourcentage_reduction', sql.Decimal(5, 2), pourcentage_reduction || null)
      .input('image_url', sql.NVarChar, image_url || null)
      .input('date_debut', sql.Date, date_debut)
      .input('date_fin', sql.Date, date_fin)
      .input('stock_disponible', sql.Int, stock_disponible || null)
      .input('conditions', sql.NVarChar, conditions || null)
      .input('agence_id', sql.BigInt, agence_id || null)
      .input('created_by', sql.BigInt, created_by)
      .query(`
        INSERT INTO PromotionVehicule (
          titre, description, marque_id, modele_id, version_id,
          prix_original, prix_promotion, pourcentage_reduction,
          image_url, date_debut, date_fin, stock_disponible,
          conditions, agence_id, created_by
        )
        OUTPUT INSERTED.*
        VALUES (
          @titre, @description, @marque_id, @modele_id, @version_id,
          @prix_original, @prix_promotion, @pourcentage_reduction,
          @image_url, @date_debut, @date_fin, @stock_disponible,
          @conditions, @agence_id, @created_by
        )
      `);

    res.status(201).json({
      success: true,
      message: 'Promotion créée avec succès',
      promotion: result.recordset[0]
    });
  } catch (error) {
    console.error('Erreur lors de la création de la promotion:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: error.message
    });
  }
};

/**
 * Mettre à jour une promotion (ADMIN uniquement)
 */
exports.updatePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const pool = await getConnection();

    // Vérifier que la promotion existe
    const checkResult = await pool.request()
      .input('id', sql.BigInt, id)
      .query('SELECT id FROM PromotionVehicule WHERE id = @id');

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({
        error: 'Promotion introuvable'
      });
    }

    // Construire la requête de mise à jour dynamiquement
    let updateFields = [];
    const request = pool.request().input('id', sql.BigInt, id);

    const fieldMappings = {
      titre: sql.NVarChar,
      description: sql.NVarChar,
      marque_id: sql.BigInt,
      modele_id: sql.BigInt,
      version_id: sql.BigInt,
      prix_original: sql.Decimal(18, 2),
      prix_promotion: sql.Decimal(18, 2),
      pourcentage_reduction: sql.Decimal(5, 2),
      image_url: sql.NVarChar,
      date_debut: sql.Date,
      date_fin: sql.Date,
      stock_disponible: sql.Int,
      conditions: sql.NVarChar,
      agence_id: sql.BigInt,
      actif: sql.Bit
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
      UPDATE PromotionVehicule 
      SET ${updateFields.join(', ')}
      OUTPUT INSERTED.*
      WHERE id = @id
    `);

    res.json({
      success: true,
      message: 'Promotion mise à jour avec succès',
      promotion: result.recordset[0]
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la promotion:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: error.message
    });
  }
};

/**
 * Supprimer (désactiver) une promotion (ADMIN uniquement)
 */
exports.deletePromotion = async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await getConnection();

    // Vérifier que la promotion existe
    const checkResult = await pool.request()
      .input('id', sql.BigInt, id)
      .query('SELECT id, titre FROM PromotionVehicule WHERE id = @id');

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({
        error: 'Promotion introuvable'
      });
    }

    const promotion = checkResult.recordset[0];

    // Désactiver la promotion au lieu de la supprimer (soft delete)
    await pool.request()
      .input('id', sql.BigInt, id)
      .query('UPDATE PromotionVehicule SET actif = 0, updated_at = GETDATE() WHERE id = @id');

    res.json({
      success: true,
      message: `Promotion "${promotion.titre}" désactivée avec succès`
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la promotion:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: error.message
    });
  }
};

module.exports = exports;
