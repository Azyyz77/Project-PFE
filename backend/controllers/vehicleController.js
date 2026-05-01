const { getConnection, sql } = require('../config/database');

const ALLOWED_STAFF_ROLES = ['ADMIN', 'AGENT', 'DIRECTION'];
const VEHICLE_FIELD_LIMITS = {
  immatriculation: 20,
  numero_chassis: 17,
  couleur: 50,
};
const TUNIS_STANDARD_PLATE_REGEX = /^(\d{1,3})\s*تونس\s*(\d{1,3})$/u;
const NT_PLATE_REGEX = /^(\d{1,5})\s*ن\.ت$/u;

const VEHICLE_WITH_RELATIONS_SELECT = `
  SELECT
    vh.id,
    vh.client_id,
    vh.version_id,
    vh.immatriculation,
    vh.numero_chassis,
    vh.couleur,
    vh.annee,
    vh.image_vehicule,
    vh.image_carte_grise,
    vh.date_ajout,
    vh.statut_validation,
    vh.motif_refus,
    vh.date_validation,
    vh.agent_validateur_id,
    ve.nom AS version_nom,
    ve.motorisation,
    ve.transmission,
    mo.nom AS modele_nom,
    ma.nom AS marque_nom,
    u.prenom AS client_prenom,
    u.nom AS client_nom,
    u.email AS client_email,
    u.telephone AS client_tel
  FROM Vehicule vh
  JOIN Version ve ON ve.id = vh.version_id
  JOIN Modele mo ON mo.id = ve.modele_id
  JOIN Marque ma ON ma.id = mo.marque_id
  JOIN Utilisateur u ON u.id = vh.client_id
`;

const validateVehiclePayload = ({ immatriculation, numero_chassis, version_id, couleur, annee, image_vehicule, image_carte_grise }) => {
  if (!immatriculation || !numero_chassis || !version_id || !annee) {
    return {
      status: 400,
      payload: {
        error: 'Champs requis manquants',
        required: ['immatriculation', 'numero_chassis', 'version_id', 'annee']
      }
    };
  }

  const normalizedImmatriculation = String(immatriculation).trim();
  const normalizedNumeroChassis = String(numero_chassis).trim();
  const normalizedCouleur = couleur ? String(couleur).trim() : null;
  const normalizedAnnee = Number(annee);
  const normalizedImageVehicule = image_vehicule ? String(image_vehicule).trim() : null;
  const normalizedImageCarteGrise = image_carte_grise ? String(image_carte_grise).trim() : null;

  if (normalizedImmatriculation.length > VEHICLE_FIELD_LIMITS.immatriculation) {
    return {
      status: 400,
      payload: {
        error: 'Immatriculation invalide',
        message: `L'immatriculation ne doit pas dépasser ${VEHICLE_FIELD_LIMITS.immatriculation} caractères.`
      }
    };
  }

  if (!TUNIS_STANDARD_PLATE_REGEX.test(normalizedImmatriculation) && !NT_PLATE_REGEX.test(normalizedImmatriculation)) {
    return {
      status: 400,
      payload: {
        error: 'Immatriculation invalide',
        message: 'Le format doit être soit "123 تونس 456" soit "12345 ن.ت".'
      }
    };
  }

  if (normalizedNumeroChassis.length > VEHICLE_FIELD_LIMITS.numero_chassis) {
    return {
      status: 400,
      payload: {
        error: 'Numéro de châssis invalide',
        message: `Le numéro de châssis ne doit pas dépasser ${VEHICLE_FIELD_LIMITS.numero_chassis} caractères.`
      }
    };
  }

  if (normalizedCouleur && normalizedCouleur.length > VEHICLE_FIELD_LIMITS.couleur) {
    return {
      status: 400,
      payload: {
        error: 'Couleur invalide',
        message: `La couleur ne doit pas dépasser ${VEHICLE_FIELD_LIMITS.couleur} caractères.`
      }
    };
  }

  if (Number.isNaN(normalizedAnnee) || normalizedAnnee < 1950 || normalizedAnnee > 2100) {
    return {
      status: 400,
      payload: {
        error: 'Année invalide',
        message: 'L\'année doit être comprise entre 1950 et 2100.'
      }
    };
  }

  return {
    status: 200,
    payload: {
      immatriculation: normalizedImmatriculation,
      numero_chassis: normalizedNumeroChassis,
      couleur: normalizedCouleur,
      version_id: Number(version_id),
      annee: normalizedAnnee,
      image_vehicule: normalizedImageVehicule,
      image_carte_grise: normalizedImageCarteGrise,
    }
  };
};

const addVehicle = async (req, res) => {
  try {
    const validation = validateVehiclePayload(req.body);

    if (validation.status !== 200) {
      return res.status(validation.status).json(validation.payload);
    }

    const { immatriculation, numero_chassis, version_id, couleur, annee, image_vehicule, image_carte_grise } = validation.payload;
    const client_id = req.user.id;

    const pool = await getConnection();

    const checkResult = await pool.request()
      .input('immatriculation', sql.NVarChar(VEHICLE_FIELD_LIMITS.immatriculation), immatriculation)
      .query('SELECT id FROM Vehicule WHERE immatriculation = @immatriculation');

    if (checkResult.recordset.length > 0) {
      return res.status(409).json({ error: 'Ce numéro d\'immatriculation existe déjà' });
    }

    const versionResult = await pool.request()
      .input('version_id', sql.BigInt, version_id)
      .query('SELECT id FROM Version WHERE id = @version_id AND actif = 1');

    if (versionResult.recordset.length === 0) {
      return res.status(400).json({ error: 'Version de véhicule introuvable ou inactive' });
    }

    const insertQuery = `
          INSERT INTO Vehicule (client_id, version_id, immatriculation, numero_chassis, couleur, annee, image_vehicule, image_carte_grise, date_ajout, statut_validation)
      OUTPUT INSERTED.id, INSERTED.client_id, INSERTED.version_id, INSERTED.immatriculation,
            INSERTED.numero_chassis, INSERTED.couleur, INSERTED.annee, INSERTED.image_vehicule, INSERTED.image_carte_grise, INSERTED.date_ajout,
            INSERTED.statut_validation, INSERTED.motif_refus, INSERTED.date_validation, INSERTED.agent_validateur_id
          VALUES (@client_id, @version_id, @immatriculation, @numero_chassis, @couleur, @annee, @image_vehicule, @image_carte_grise, GETDATE(), 'EN_ATTENTE')
    `;

    const result = await pool.request()
      .input('client_id', sql.BigInt, client_id)
      .input('version_id', sql.BigInt, version_id)
      .input('immatriculation', sql.NVarChar(VEHICLE_FIELD_LIMITS.immatriculation), immatriculation)
      .input('numero_chassis', sql.NVarChar(VEHICLE_FIELD_LIMITS.numero_chassis), numero_chassis)
      .input('couleur', sql.NVarChar(VEHICLE_FIELD_LIMITS.couleur), couleur || null)
      .input('annee', sql.SmallInt, annee)
      .input('image_vehicule', sql.NVarChar(sql.MAX), image_vehicule || null)
      .input('image_carte_grise', sql.NVarChar(sql.MAX), image_carte_grise || null)
      .query(insertQuery);

    res.status(201).json({
      message: 'Véhicule ajouté avec succès',
      vehicle: result.recordset[0]
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du véhicule:', error);
    if (error.number === 2628) {
      return res.status(400).json({
        error: 'Données véhicule invalides',
        message: 'Une valeur dépasse la taille autorisée par la base de données.'
      });
    }
    res.status(500).json({ error: 'Erreur lors de l\'ajout du véhicule', message: error.message });
  }
};

const getVehiclesByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const userIdInt = parseInt(userId, 10);
    const currentUserIdInt = parseInt(req.user.id, 10);
    
    if (currentUserIdInt !== userIdInt && !ALLOWED_STAFF_ROLES.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Accès non autorisé',
        message: 'Vous ne pouvez voir que vos propres véhicules'
      });
    }

    const pool = await getConnection();

    const result = await pool.request()
      .input('userId', sql.BigInt, userId)
      .query(`${VEHICLE_WITH_RELATIONS_SELECT} WHERE vh.client_id = @userId ORDER BY vh.date_ajout DESC`);

    res.json({ count: result.recordset.length, vehicles: result.recordset });
  } catch (error) {
    console.error('Erreur lors de la récupération des véhicules:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des véhicules', message: error.message });
  }
};

const getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await getConnection();

    const result = await pool.request()
      .input('id', sql.BigInt, id)
      .query(`${VEHICLE_WITH_RELATIONS_SELECT} WHERE vh.id = @id`);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Véhicule non trouvé' });
    }

    const vehicle = result.recordset[0];

    // Debug logs
    console.log('[getVehicleById] vehicle.client_id:', vehicle.client_id, 'type:', typeof vehicle.client_id);
    console.log('[getVehicleById] req.user.id:', req.user.id, 'type:', typeof req.user.id);
    console.log('[getVehicleById] req.user.role:', req.user.role);

    const currentUserIdInt = parseInt(req.user.id, 10);
    const vehicleClientIdInt = parseInt(vehicle.client_id, 10);
    
    console.log('[getVehicleById] currentUserIdInt:', currentUserIdInt);
    console.log('[getVehicleById] vehicleClientIdInt:', vehicleClientIdInt);
    console.log('[getVehicleById] Match:', currentUserIdInt === vehicleClientIdInt);
    
    if (vehicleClientIdInt !== currentUserIdInt && !ALLOWED_STAFF_ROLES.includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    res.json({ vehicle });
  } catch (error) {
    console.error('Erreur lors de la récupération du véhicule:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du véhicule', message: error.message });
  }
};

const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const validation = validateVehiclePayload(req.body);

    if (validation.status !== 200) {
      return res.status(validation.status).json(validation.payload);
    }

    const { immatriculation, numero_chassis, version_id, couleur, annee, image_vehicule, image_carte_grise } = validation.payload;

    const pool = await getConnection();

    const existingVehicleResult = await pool.request()
      .input('id', sql.BigInt, id)
      .query('SELECT id, client_id FROM Vehicule WHERE id = @id');

    if (existingVehicleResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Véhicule non trouvé' });
    }

    const existingVehicle = existingVehicleResult.recordset[0];
    if (existingVehicle.client_id !== req.user.id && !ALLOWED_STAFF_ROLES.includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    const versionResult = await pool.request()
      .input('version_id', sql.BigInt, version_id)
      .query('SELECT id FROM Version WHERE id = @version_id AND actif = 1');

    if (versionResult.recordset.length === 0) {
      return res.status(400).json({ error: 'Version de véhicule introuvable ou inactive' });
    }

    const duplicateImmatResult = await pool.request()
      .input('id', sql.BigInt, id)
      .input('immatriculation', sql.NVarChar(VEHICLE_FIELD_LIMITS.immatriculation), immatriculation)
      .query('SELECT id FROM Vehicule WHERE immatriculation = @immatriculation AND id <> @id');

    if (duplicateImmatResult.recordset.length > 0) {
      return res.status(409).json({ error: 'Ce numéro d\'immatriculation existe déjà' });
    }

    const duplicateChassisResult = await pool.request()
      .input('id', sql.BigInt, id)
      .input('numero_chassis', sql.NVarChar(VEHICLE_FIELD_LIMITS.numero_chassis), numero_chassis)
      .query('SELECT id FROM Vehicule WHERE numero_chassis = @numero_chassis AND id <> @id');

    if (duplicateChassisResult.recordset.length > 0) {
      return res.status(409).json({ error: 'Ce numéro de châssis existe déjà' });
    }

    const isClientOwner = existingVehicle.client_id === req.user.id && req.user.role === 'CLIENT';

    await pool.request()
      .input('id', sql.BigInt, id)
      .input('version_id', sql.BigInt, version_id)
      .input('immatriculation', sql.NVarChar(VEHICLE_FIELD_LIMITS.immatriculation), immatriculation)
      .input('numero_chassis', sql.NVarChar(VEHICLE_FIELD_LIMITS.numero_chassis), numero_chassis)
      .input('couleur', sql.NVarChar(VEHICLE_FIELD_LIMITS.couleur), couleur || null)
      .input('annee', sql.SmallInt, annee)
      .input('image_vehicule', sql.NVarChar(sql.MAX), image_vehicule || null)
      .input('image_carte_grise', sql.NVarChar(sql.MAX), image_carte_grise || null)
      .query(`
        UPDATE Vehicule
        SET
          version_id = @version_id,
          immatriculation = @immatriculation,
          numero_chassis = @numero_chassis,
          couleur = @couleur,
          annee = @annee,
          image_vehicule = @image_vehicule,
          image_carte_grise = @image_carte_grise,
          statut_validation = CASE WHEN ${isClientOwner ? "1=1" : "1=0"} THEN 'EN_ATTENTE' ELSE statut_validation END,
          motif_refus = CASE WHEN ${isClientOwner ? "1=1" : "1=0"} THEN NULL ELSE motif_refus END,
          date_validation = CASE WHEN ${isClientOwner ? "1=1" : "1=0"} THEN NULL ELSE date_validation END,
          agent_validateur_id = CASE WHEN ${isClientOwner ? "1=1" : "1=0"} THEN NULL ELSE agent_validateur_id END
        WHERE id = @id
      `);

    const updatedResult = await pool.request()
      .input('id', sql.BigInt, id)
      .query(`${VEHICLE_WITH_RELATIONS_SELECT} WHERE vh.id = @id`);

    res.json({
      message: 'Véhicule mis à jour avec succès',
      vehicle: updatedResult.recordset[0]
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du véhicule:', error);
    if (error.number === 2628) {
      return res.status(400).json({
        error: 'Données véhicule invalides',
        message: 'Une valeur dépasse la taille autorisée par la base de données.'
      });
    }
    res.status(500).json({ error: 'Erreur lors de la mise à jour du véhicule', message: error.message });
  }
};

const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getConnection();

    const existingVehicleResult = await pool.request()
      .input('id', sql.BigInt, id)
      .query('SELECT id, client_id FROM Vehicule WHERE id = @id');

    if (existingVehicleResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Véhicule non trouvé' });
    }

    const existingVehicle = existingVehicleResult.recordset[0];
    if (existingVehicle.client_id !== req.user.id && !ALLOWED_STAFF_ROLES.includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    await pool.request()
      .input('id', sql.BigInt, id)
      .query('DELETE FROM Vehicule WHERE id = @id');

    res.json({ message: 'Véhicule supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du véhicule:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du véhicule', message: error.message });
  }
};

const getVersionCatalog = async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool.request().query(`
      SELECT
        ve.id,
        ve.nom AS version_nom,
        ve.motorisation,
        ve.transmission,
        mo.id AS modele_id,
        mo.nom AS modele_nom,
        ma.id AS marque_id,
        ma.nom AS marque_nom
      FROM Version ve
      JOIN Modele mo ON mo.id = ve.modele_id
      JOIN Marque ma ON ma.id = mo.marque_id
      WHERE ve.actif = 1 AND mo.actif = 1 AND ma.actif = 1
      ORDER BY ma.nom, mo.nom, ve.nom
    `);

    res.json({ count: result.recordset.length, versions: result.recordset });
  } catch (error) {
    console.error('Erreur lors de la récupération du catalogue versions:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du catalogue versions', message: error.message });
  }
};

module.exports = {
  addVehicle,
  getVehiclesByUser,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  getVersionCatalog
};
