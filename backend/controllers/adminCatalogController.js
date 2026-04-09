const { getConnection, sql } = require('../config/database');

/**
 * Controller pour la gestion du catalogue (admin uniquement)
 */

// ========== TYPES D'INTERVENTION ==========

// Récupérer tous les types d'intervention
const getInterventionTypes = async (req, res) => {
  try {
    const pool = await getConnection();
    
    const result = await pool.request().query(`
      SELECT 
        t.id,
        t.nom,
        t.delai_moyen,
        COUNT(st.id) AS sous_types_count
      FROM TypeIntervention t
      LEFT JOIN SousTypeIntervention st ON st.type_intervention_id = t.id
      GROUP BY t.id, t.nom, t.delai_moyen
      ORDER BY t.nom
    `);

    return res.json({ types: result.recordset });
  } catch (error) {
    console.error('Erreur récupération types:', error);
    return res.status(500).json({ error: 'Erreur lors de la récupération des types' });
  }
};

// Créer un type d'intervention
const createInterventionType = async (req, res) => {
  try {
    const { nom, delai_moyen } = req.body;

    if (!nom) {
      return res.status(400).json({ error: 'Le nom est requis' });
    }

    const pool = await getConnection();
    
    const result = await pool.request()
      .input('nom', sql.NVarChar(100), nom)
      .input('delai_moyen', sql.Int, delai_moyen || null)
      .query(`
        INSERT INTO TypeIntervention (nom, delai_moyen)
        VALUES (@nom, @delai_moyen);
        SELECT SCOPE_IDENTITY() AS id;
      `);

    return res.status(201).json({ 
      message: 'Type créé avec succès',
      typeId: result.recordset[0].id 
    });
  } catch (error) {
    console.error('Erreur création type:', error);
    return res.status(500).json({ error: 'Erreur lors de la création du type' });
  }
};

// Modifier un type d'intervention
const updateInterventionType = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, delai_moyen } = req.body;

    if (!nom) {
      return res.status(400).json({ error: 'Le nom est requis' });
    }

    const pool = await getConnection();
    
    await pool.request()
      .input('id', sql.BigInt, id)
      .input('nom', sql.NVarChar(100), nom)
      .input('delai_moyen', sql.Int, delai_moyen || null)
      .query(`
        UPDATE TypeIntervention
        SET nom = @nom, delai_moyen = @delai_moyen
        WHERE id = @id
      `);

    return res.json({ message: 'Type modifié avec succès' });
  } catch (error) {
    console.error('Erreur modification type:', error);
    return res.status(500).json({ error: 'Erreur lors de la modification du type' });
  }
};

// Supprimer un type d'intervention
const deleteInterventionType = async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await getConnection();
    
    // Vérifier s'il y a des sous-types
    const check = await pool.request()
      .input('id', sql.BigInt, id)
      .query(`
        SELECT COUNT(*) AS count
        FROM SousTypeIntervention
        WHERE type_intervention_id = @id
      `);

    if (check.recordset[0].count > 0) {
      return res.status(400).json({ 
        error: 'Impossible de supprimer ce type car il contient des sous-types' 
      });
    }

    await pool.request()
      .input('id', sql.BigInt, id)
      .query(`DELETE FROM TypeIntervention WHERE id = @id`);

    return res.json({ message: 'Type supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression type:', error);
    return res.status(500).json({ error: 'Erreur lors de la suppression du type' });
  }
};

// ========== SOUS-TYPES D'INTERVENTION ==========

// Récupérer les sous-types d'un type
const getSubTypes = async (req, res) => {
  try {
    const { typeId } = req.params;

    const pool = await getConnection();
    
    const result = await pool.request()
      .input('typeId', sql.BigInt, typeId)
      .query(`
        SELECT 
          id,
          nom,
          type_intervention_id,
          duree_estimee
        FROM SousTypeIntervention
        WHERE type_intervention_id = @typeId
        ORDER BY nom
      `);

    return res.json({ subTypes: result.recordset });
  } catch (error) {
    console.error('Erreur récupération sous-types:', error);
    return res.status(500).json({ error: 'Erreur lors de la récupération des sous-types' });
  }
};

// Créer un sous-type
const createSubType = async (req, res) => {
  try {
    const { nom, type_intervention_id, duree_estimee } = req.body;

    if (!nom || !type_intervention_id) {
      return res.status(400).json({ error: 'Le nom et le type sont requis' });
    }

    const pool = await getConnection();
    
    const result = await pool.request()
      .input('nom', sql.NVarChar(150), nom)
      .input('type_intervention_id', sql.BigInt, type_intervention_id)
      .input('duree_estimee', sql.Int, duree_estimee || null)
      .query(`
        INSERT INTO SousTypeIntervention (nom, type_intervention_id, duree_estimee)
        VALUES (@nom, @type_intervention_id, @duree_estimee);
        SELECT SCOPE_IDENTITY() AS id;
      `);

    return res.status(201).json({ 
      message: 'Sous-type créé avec succès',
      subTypeId: result.recordset[0].id 
    });
  } catch (error) {
    console.error('Erreur création sous-type:', error);
    return res.status(500).json({ error: 'Erreur lors de la création du sous-type' });
  }
};

// Modifier un sous-type
const updateSubType = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, duree_estimee } = req.body;

    if (!nom) {
      return res.status(400).json({ error: 'Le nom est requis' });
    }

    const pool = await getConnection();
    
    await pool.request()
      .input('id', sql.BigInt, id)
      .input('nom', sql.NVarChar(150), nom)
      .input('duree_estimee', sql.Int, duree_estimee || null)
      .query(`
        UPDATE SousTypeIntervention
        SET nom = @nom, duree_estimee = @duree_estimee
        WHERE id = @id
      `);

    return res.json({ message: 'Sous-type modifié avec succès' });
  } catch (error) {
    console.error('Erreur modification sous-type:', error);
    return res.status(500).json({ error: 'Erreur lors de la modification du sous-type' });
  }
};

// Supprimer un sous-type
const deleteSubType = async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await getConnection();
    
    // Vérifier s'il y a des interventions liées
    const check = await pool.request()
      .input('id', sql.BigInt, id)
      .query(`
        SELECT COUNT(*) AS count
        FROM InterventionRDV
        WHERE sous_type_id = @id
      `);

    if (check.recordset[0].count > 0) {
      return res.status(400).json({ 
        error: 'Impossible de supprimer ce sous-type car il est utilisé dans des interventions' 
      });
    }

    await pool.request()
      .input('id', sql.BigInt, id)
      .query(`DELETE FROM SousTypeIntervention WHERE id = @id`);

    return res.json({ message: 'Sous-type supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression sous-type:', error);
    return res.status(500).json({ error: 'Erreur lors de la suppression du sous-type' });
  }
};

// ========== MARQUES ==========

// Récupérer toutes les marques
const getBrands = async (req, res) => {
  try {
    const pool = await getConnection();
    
    const result = await pool.request().query(`
      SELECT 
        m.id,
        m.nom,
        COUNT(mo.id) AS modeles_count
      FROM Marque m
      LEFT JOIN Modele mo ON mo.marque_id = m.id
      GROUP BY m.id, m.nom
      ORDER BY m.nom
    `);

    return res.json({ brands: result.recordset });
  } catch (error) {
    console.error('Erreur récupération marques:', error);
    return res.status(500).json({ error: 'Erreur lors de la récupération des marques' });
  }
};

// Créer une marque
const createBrand = async (req, res) => {
  try {
    const { nom } = req.body;

    if (!nom) {
      return res.status(400).json({ error: 'Le nom est requis' });
    }

    const pool = await getConnection();
    
    const result = await pool.request()
      .input('nom', sql.NVarChar(50), nom)
      .query(`
        INSERT INTO Marque (nom)
        VALUES (@nom);
        SELECT SCOPE_IDENTITY() AS id;
      `);

    return res.status(201).json({ 
      message: 'Marque créée avec succès',
      brandId: result.recordset[0].id 
    });
  } catch (error) {
    console.error('Erreur création marque:', error);
    return res.status(500).json({ error: 'Erreur lors de la création de la marque' });
  }
};

// Récupérer les modèles d'une marque
const getBrandModels = async (req, res) => {
  try {
    const { brandId } = req.params;

    const pool = await getConnection();
    
    const result = await pool.request()
      .input('brandId', sql.BigInt, brandId)
      .query(`
        SELECT 
          mo.id,
          mo.nom,
          mo.marque_id,
          COUNT(v.id) AS versions_count
        FROM Modele mo
        LEFT JOIN Version v ON v.modele_id = mo.id
        WHERE mo.marque_id = @brandId
        GROUP BY mo.id, mo.nom, mo.marque_id
        ORDER BY mo.nom
      `);

    return res.json({ models: result.recordset });
  } catch (error) {
    console.error('Erreur récupération modèles:', error);
    return res.status(500).json({ error: 'Erreur lors de la récupération des modèles' });
  }
};

// Créer un modèle
const createModel = async (req, res) => {
  try {
    const { nom, marque_id } = req.body;

    if (!nom || !marque_id) {
      return res.status(400).json({ error: 'Le nom et la marque sont requis' });
    }

    const pool = await getConnection();
    
    const result = await pool.request()
      .input('nom', sql.NVarChar(50), nom)
      .input('marque_id', sql.BigInt, marque_id)
      .query(`
        INSERT INTO Modele (nom, marque_id)
        VALUES (@nom, @marque_id);
        SELECT SCOPE_IDENTITY() AS id;
      `);

    return res.status(201).json({ 
      message: 'Modèle créé avec succès',
      modelId: result.recordset[0].id 
    });
  } catch (error) {
    console.error('Erreur création modèle:', error);
    return res.status(500).json({ error: 'Erreur lors de la création du modèle' });
  }
};

module.exports = {
  getInterventionTypes,
  createInterventionType,
  updateInterventionType,
  deleteInterventionType,
  getSubTypes,
  createSubType,
  updateSubType,
  deleteSubType,
  getBrands,
  createBrand,
  getBrandModels,
  createModel,
};
