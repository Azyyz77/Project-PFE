const { getConnection, sql } = require('../config/database');
const redis = require('../config/redis');

const invalidateCatalogCache = async () => {
  try {
    const keys = await redis.keys('cache:/api/catalog*');
    if (keys && keys.length > 0) {
      await redis.del(keys);
    }
  } catch (err) {
    console.error('Error invalidating catalog cache:', err);
  }
};

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

    await invalidateCatalogCache();

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

    await invalidateCatalogCache();

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

    await invalidateCatalogCache();

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

    const duplicateCheck = await pool.request()
      .input('nom', sql.NVarChar(150), nom)
      .input('type_intervention_id', sql.BigInt, type_intervention_id)
      .query(`
        SELECT COUNT(*) AS count
        FROM SousTypeIntervention
        WHERE type_intervention_id = @type_intervention_id
          AND LOWER(LTRIM(RTRIM(nom))) = LOWER(LTRIM(RTRIM(@nom)))
      `);

    if (duplicateCheck.recordset[0].count > 0) {
      return res.status(400).json({
        error: 'Ce sous-type existe deja pour ce type d\'intervention'
      });
    }
    
    const result = await pool.request()
      .input('nom', sql.NVarChar(150), nom)
      .input('type_intervention_id', sql.BigInt, type_intervention_id)
      .input('duree_estimee', sql.Int, duree_estimee || null)
      .query(`
        INSERT INTO SousTypeIntervention (nom, type_intervention_id, duree_estimee)
        VALUES (@nom, @type_intervention_id, @duree_estimee);
        SELECT SCOPE_IDENTITY() AS id;
      `);

    await invalidateCatalogCache();

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
    const { nom, duree_estimee, type_intervention_id } = req.body;

    if (!nom) {
      return res.status(400).json({ error: 'Le nom est requis' });
    }

    const pool = await getConnection();

    if (type_intervention_id) {
      const duplicateCheck = await pool.request()
        .input('id', sql.BigInt, id)
        .input('nom', sql.NVarChar(150), nom)
        .input('type_intervention_id', sql.BigInt, type_intervention_id)
        .query(`
          SELECT COUNT(*) AS count
          FROM SousTypeIntervention
          WHERE type_intervention_id = @type_intervention_id
            AND id <> @id
            AND LOWER(LTRIM(RTRIM(nom))) = LOWER(LTRIM(RTRIM(@nom)))
        `);

      if (duplicateCheck.recordset[0].count > 0) {
        return res.status(400).json({
          error: 'Ce sous-type existe deja pour ce type d\'intervention'
        });
      }
    }
    
    await pool.request()
      .input('id', sql.BigInt, id)
      .input('nom', sql.NVarChar(150), nom)
      .input('duree_estimee', sql.Int, duree_estimee || null)
      .query(`
        UPDATE SousTypeIntervention
        SET nom = @nom, duree_estimee = @duree_estimee
        WHERE id = @id
      `);

    await invalidateCatalogCache();

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

    // Vérifier s'il est lié à des packages
    const packageCheck = await pool.request()
      .input('id', sql.BigInt, id)
      .query(`
        SELECT COUNT(*) AS count
        FROM Package_SousType
        WHERE sous_type_id = @id
      `);

    if (packageCheck.recordset[0].count > 0) {
      return res.status(400).json({
        error: 'Impossible de supprimer ce sous-type car il est lié à des packages'
      });
    }

    await pool.request()
      .input('id', sql.BigInt, id)
      .query(`DELETE FROM SousTypeIntervention WHERE id = @id`);

    await invalidateCatalogCache();

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

    if (!nom || !nom.trim()) {
      return res.status(400).json({ error: 'Le nom est requis' });
    }

    const pool = await getConnection();
    
    // ✅ VALIDATION: Vérifier que le nom de la marque n'existe pas déjà
    const checkResult = await pool.request()
      .input('nom', sql.NVarChar(50), nom.trim())
      .query(`
        SELECT id, nom FROM Marque 
        WHERE LOWER(nom) = LOWER(@nom)
      `);

    if (checkResult.recordset.length > 0) {
      return res.status(409).json({ 
        error: 'Doublon détecté',
        message: `Une marque avec ce nom existe déjà : ${checkResult.recordset[0].nom}`
      });
    }
    
    const result = await pool.request()
      .input('nom', sql.NVarChar(50), nom.trim())
      .query(`
        INSERT INTO Marque (nom)
        OUTPUT INSERTED.id, INSERTED.nom
        VALUES (@nom);
      `);

    await invalidateCatalogCache();

    return res.status(201).json({ 
      message: 'Marque créée avec succès',
      brand: result.recordset[0]
    });
  } catch (error) {
    console.error('Erreur création marque:', error);
    return res.status(500).json({ error: 'Erreur lors de la création de la marque' });
  }
};

// Modifier une marque
const updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom } = req.body;

    if (!nom || !nom.trim()) {
      return res.status(400).json({ error: 'Le nom est requis' });
    }

    const pool = await getConnection();

    // ✅ VALIDATION: Vérifier que le nouveau nom n'est pas déjà utilisé par une autre marque
    const checkResult = await pool.request()
      .input('nom', sql.NVarChar(50), nom.trim())
      .input('id', sql.BigInt, id)
      .query(`
        SELECT id, nom FROM Marque 
        WHERE LOWER(nom) = LOWER(@nom) AND id != @id
      `);

    if (checkResult.recordset.length > 0) {
      return res.status(409).json({ 
        error: 'Doublon détecté',
        message: `Une autre marque utilise déjà ce nom : ${checkResult.recordset[0].nom}`
      });
    }

    const result = await pool.request()
      .input('id', sql.BigInt, id)
      .input('nom', sql.NVarChar(50), nom.trim())
      .query(`
        UPDATE Marque
        SET nom = @nom
        OUTPUT INSERTED.id, INSERTED.nom
        WHERE id = @id;
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Marque introuvable' });
    }

    await invalidateCatalogCache();

    return res.json({ message: 'Marque modifiée avec succès' });
  } catch (error) {
    console.error('Erreur modification marque:', error);
    return res.status(500).json({ error: 'Erreur lors de la modification de la marque' });
  }
};

// Supprimer une marque
const deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await getConnection();

    const check = await pool.request()
      .input('id', sql.BigInt, id)
      .query(`
        SELECT COUNT(*) AS count
        FROM Modele
        WHERE marque_id = @id
      `);

    if (check.recordset[0].count > 0) {
      return res.status(400).json({
        error: 'Impossible de supprimer cette marque car elle contient des modèles'
      });
    }

    const result = await pool.request()
      .input('id', sql.BigInt, id)
      .query(`
        DELETE FROM Marque WHERE id = @id;
        SELECT @@ROWCOUNT AS count;
      `);

    if (result.recordset[0].count === 0) {
      return res.status(404).json({ error: 'Marque introuvable' });
    }

    await invalidateCatalogCache();

    return res.json({ message: 'Marque supprimée avec succès' });
  } catch (error) {
    console.error('Erreur suppression marque:', error);
    return res.status(500).json({ error: 'Erreur lors de la suppression de la marque' });
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

    if (!nom || !nom.trim() || !marque_id) {
      return res.status(400).json({ error: 'Le nom et la marque sont requis' });
    }

    const pool = await getConnection();
    
    // ✅ VALIDATION: Vérifier que le nom du modèle n'existe pas déjà pour cette marque
    const checkResult = await pool.request()
      .input('nom', sql.NVarChar(50), nom.trim())
      .input('marque_id', sql.BigInt, marque_id)
      .query(`
        SELECT m.id, m.nom, ma.nom AS marque_nom 
        FROM Modele m
        INNER JOIN Marque ma ON m.marque_id = ma.id
        WHERE LOWER(m.nom) = LOWER(@nom) AND m.marque_id = @marque_id
      `);

    if (checkResult.recordset.length > 0) {
      const existing = checkResult.recordset[0];
      return res.status(409).json({ 
        error: 'Doublon détecté',
        message: `Un modèle "${existing.nom}" existe déjà pour la marque ${existing.marque_nom}`
      });
    }
    
    const result = await pool.request()
      .input('nom', sql.NVarChar(50), nom.trim())
      .input('marque_id', sql.BigInt, marque_id)
      .query(`
        INSERT INTO Modele (nom, marque_id)
        OUTPUT INSERTED.id, INSERTED.nom, INSERTED.marque_id
        VALUES (@nom, @marque_id);
      `);

    await invalidateCatalogCache();

    return res.status(201).json({ 
      message: 'Modèle créé avec succès',
      model: result.recordset[0]
    });
  } catch (error) {
    console.error('Erreur création modèle:', error);
    return res.status(500).json({ error: 'Erreur lors de la création du modèle' });
  }
};

// Modifier un modèle
const updateModel = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, marque_id } = req.body;

    if (!nom || !nom.trim() || !marque_id) {
      return res.status(400).json({ error: 'Le nom et la marque sont requis' });
    }

    const pool = await getConnection();

    // ✅ VALIDATION: Vérifier que le nouveau nom n'est pas déjà utilisé par un autre modèle de la même marque
    const checkResult = await pool.request()
      .input('nom', sql.NVarChar(50), nom.trim())
      .input('marque_id', sql.BigInt, marque_id)
      .input('id', sql.BigInt, id)
      .query(`
        SELECT m.id, m.nom, ma.nom AS marque_nom 
        FROM Modele m
        INNER JOIN Marque ma ON m.marque_id = ma.id
        WHERE LOWER(m.nom) = LOWER(@nom) AND m.marque_id = @marque_id AND m.id != @id
      `);

    if (checkResult.recordset.length > 0) {
      const existing = checkResult.recordset[0];
      return res.status(409).json({ 
        error: 'Doublon détecté',
        message: `Un autre modèle "${existing.nom}" existe déjà pour la marque ${existing.marque_nom}`
      });
    }

    const result = await pool.request()
      .input('id', sql.BigInt, id)
      .input('nom', sql.NVarChar(50), nom.trim())
      .input('marque_id', sql.BigInt, marque_id)
      .query(`
        UPDATE Modele
        SET nom = @nom, marque_id = @marque_id
        OUTPUT INSERTED.id, INSERTED.nom, INSERTED.marque_id
        WHERE id = @id;
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Modèle introuvable' });
    }

    await invalidateCatalogCache();

    return res.json({ message: 'Modèle modifié avec succès', model: result.recordset[0] });
  } catch (error) {
    console.error('Erreur modification modèle:', error);
    return res.status(500).json({ error: 'Erreur lors de la modification du modèle' });
  }
};

// Supprimer un modèle
const deleteModel = async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await getConnection();

    const check = await pool.request()
      .input('id', sql.BigInt, id)
      .query(`
        SELECT COUNT(*) AS count
        FROM Version
        WHERE modele_id = @id
      `);

    if (check.recordset[0].count > 0) {
      return res.status(400).json({
        error: 'Impossible de supprimer ce modèle car il contient des versions'
      });
    }

    const result = await pool.request()
      .input('id', sql.BigInt, id)
      .query(`
        DELETE FROM Modele WHERE id = @id;
        SELECT @@ROWCOUNT AS count;
      `);

    if (result.recordset[0].count === 0) {
      return res.status(404).json({ error: 'Modèle introuvable' });
    }

    await invalidateCatalogCache();

    return res.json({ message: 'Modèle supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression modèle:', error);
    return res.status(500).json({ error: 'Erreur lors de la suppression du modèle' });
  }
};

// Récupérer les versions d'un modèle
const getModelVersions = async (req, res) => {
  try {
    const { modelId } = req.params;

    const pool = await getConnection();

    const result = await pool.request()
      .input('modelId', sql.BigInt, modelId)
      .query(`
        SELECT
          id,
          modele_id,
          nom,
          motorisation,
          transmission,
          actif
        FROM Version
        WHERE modele_id = @modelId
        ORDER BY nom
      `);

    return res.json({ versions: result.recordset });
  } catch (error) {
    console.error('Erreur récupération versions:', error);
    return res.status(500).json({ error: 'Erreur lors de la récupération des versions' });
  }
};

// Créer une version
const createVersion = async (req, res) => {
  try {
    const { nom, modele_id, motorisation, transmission, actif } = req.body;

    if (!nom || !modele_id) {
      return res.status(400).json({ error: 'Le nom et le modèle sont requis' });
    }

    const pool = await getConnection();

    const duplicateCheck = await pool.request()
      .input('nom', sql.NVarChar(100), nom)
      .input('modele_id', sql.BigInt, modele_id)
      .query(`
        SELECT COUNT(*) AS count
        FROM Version
        WHERE modele_id = @modele_id
          AND LOWER(LTRIM(RTRIM(nom))) = LOWER(LTRIM(RTRIM(@nom)))
      `);

    if (duplicateCheck.recordset[0].count > 0) {
      return res.status(400).json({
        error: 'Cette version existe deja pour ce modele'
      });
    }

    const result = await pool.request()
      .input('nom', sql.NVarChar(100), nom)
      .input('modele_id', sql.BigInt, modele_id)
      .input('motorisation', sql.NVarChar(100), motorisation || null)
      .input('transmission', sql.NVarChar(30), transmission || null)
      .input('actif', sql.Bit, typeof actif === 'boolean' ? actif : true)
      .query(`
        INSERT INTO Version (modele_id, nom, motorisation, transmission, actif)
        VALUES (@modele_id, @nom, @motorisation, @transmission, @actif);
        SELECT SCOPE_IDENTITY() AS id;
      `);

    await invalidateCatalogCache();

    return res.status(201).json({
      message: 'Version créée avec succès',
      versionId: result.recordset[0].id
    });
  } catch (error) {
    console.error('Erreur création version:', error);
    return res.status(500).json({ error: 'Erreur lors de la création de la version' });
  }
};

// Modifier une version
const updateVersion = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, modele_id, motorisation, transmission, actif } = req.body;

    if (!nom || !modele_id) {
      return res.status(400).json({ error: 'Le nom et le modèle sont requis' });
    }

    const pool = await getConnection();

    const duplicateCheck = await pool.request()
      .input('id', sql.BigInt, id)
      .input('nom', sql.NVarChar(100), nom)
      .input('modele_id', sql.BigInt, modele_id)
      .query(`
        SELECT COUNT(*) AS count
        FROM Version
        WHERE modele_id = @modele_id
          AND id <> @id
          AND LOWER(LTRIM(RTRIM(nom))) = LOWER(LTRIM(RTRIM(@nom)))
      `);

    if (duplicateCheck.recordset[0].count > 0) {
      return res.status(400).json({
        error: 'Cette version existe deja pour ce modele'
      });
    }

    const result = await pool.request()
      .input('id', sql.BigInt, id)
      .input('nom', sql.NVarChar(100), nom)
      .input('modele_id', sql.BigInt, modele_id)
      .input('motorisation', sql.NVarChar(100), motorisation || null)
      .input('transmission', sql.NVarChar(30), transmission || null)
      .input('actif', sql.Bit, typeof actif === 'boolean' ? actif : true)
      .query(`
        UPDATE Version
        SET nom = @nom,
            modele_id = @modele_id,
            motorisation = @motorisation,
            transmission = @transmission,
            actif = @actif
        WHERE id = @id;
        SELECT @@ROWCOUNT AS count;
      `);

    if (result.recordset[0].count === 0) {
      return res.status(404).json({ error: 'Version introuvable' });
    }

    await invalidateCatalogCache();

    return res.json({ message: 'Version modifiée avec succès' });
  } catch (error) {
    console.error('Erreur modification version:', error);
    return res.status(500).json({ error: 'Erreur lors de la modification de la version' });
  }
};

// Supprimer une version
const deleteVersion = async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await getConnection();

    const vehicleCheck = await pool.request()
      .input('id', sql.BigInt, id)
      .query(`
        SELECT COUNT(*) AS count
        FROM Vehicule
        WHERE version_id = @id
      `);

    if (vehicleCheck.recordset[0].count > 0) {
      return res.status(400).json({
        error: 'Impossible de supprimer cette version car elle est utilisée par des vehicules'
      });
    }

    const promoCheck = await pool.request()
      .input('id', sql.BigInt, id)
      .query(`
        SELECT COUNT(*) AS count
        FROM PromotionVehicule
        WHERE version_id = @id
      `);

    if (promoCheck.recordset[0].count > 0) {
      return res.status(400).json({
        error: 'Impossible de supprimer cette version car elle est liée a une promotion'
      });
    }

    const result = await pool.request()
      .input('id', sql.BigInt, id)
      .query(`
        DELETE FROM Version WHERE id = @id;
        SELECT @@ROWCOUNT AS count;
      `);

    if (result.recordset[0].count === 0) {
      return res.status(404).json({ error: 'Version introuvable' });
    }

    await invalidateCatalogCache();

    return res.json({ message: 'Version supprimée avec succès' });
  } catch (error) {
    console.error('Erreur suppression version:', error);
    return res.status(500).json({ error: 'Erreur lors de la suppression de la version' });
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
  updateBrand,
  deleteBrand,
  getBrandModels,
  createModel,
  updateModel,
  deleteModel,
  getModelVersions,
  createVersion,
  updateVersion,
  deleteVersion,
};
