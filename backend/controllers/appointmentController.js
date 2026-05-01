const { getConnection, sql } = require('../config/database');
const { sendWhatsAppMessage, getWhatsAppStatus } = require('../services/whatsappClient');
// ADD this line next to your existing requires
const { triggerAppointmentWorkflow } = require('../services/n8nService');
const STAFF_ROLES = ['ADMIN', 'AGENT', 'DIRECTION'];
const ALLOWED_STATUSES = ['PLANIFIE', 'CONFIRME', 'EN_COURS', 'TERMINE', 'ANNULE', 'NO_SHOW'];
const APPOINTMENT_DATE_TIME_REGEX = /^(\d{4})-(\d{2})-(\d{2})T([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/;

const normalizePositiveInt = (value) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
};

const getIsoWeekdayFromDateRef = (dateRef) => {
  const date = new Date(`${dateRef}T12:00:00`);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  const jsDay = date.getDay(); // 0=Sun..6=Sat
  return ((jsDay + 6) % 7) + 1; // 1=Mon..7=Sun
};

const sendAppointmentWhatsAppNotification = async (userPhone, appointmentDetails) => {
  try {
    const status = getWhatsAppStatus();
    if (!status.ready) {
      console.warn('WhatsApp n\'est pas prêt - notification non envoyée');
      return;
    }

    const { agence_nom, date_heure, sous_type_nom } = appointmentDetails;
    const formattedDate = new Date(date_heure).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const message = `Bonjour! 🚗\n\nVotre rendez-vous a été confirmé avec succès!\n\n📍 Agence: ${agence_nom}\n📅 Date: ${formattedDate}\n🔧 Service: ${sous_type_nom || 'Service SAV'}\n\nMerci de votre confiance.`;

    await sendWhatsAppMessage(userPhone, message);
    console.log(`Notification WhatsApp envoyée à ${userPhone}`);
  } catch (error) {
    console.warn('Erreur envoi notification WhatsApp:', error.message);
    // Ne pas bloquer l'opération si WhatsApp échoue
  }
};

const createAppointment = async (req, res) => {
  try {
    const clientId = req.user.id;
    const { vehicule_id, agence_id, date_heure, description, duree_estimee, sous_type_ids, package_ids } = req.body;

    console.log('createAppointment request:', {
      clientId,
      vehicule_id,
      agence_id,
      date_heure,
      sous_type_ids,
      sous_type_ids_type: Array.isArray(sous_type_ids) ? 'array' : typeof sous_type_ids,
      package_ids,
      package_ids_type: Array.isArray(package_ids) ? 'array' : typeof package_ids,
    });

    const vehicleId = normalizePositiveInt(vehicule_id);
    const agencyId = normalizePositiveInt(agence_id);
    const estimatedDuration = duree_estimee ? normalizePositiveInt(duree_estimee) : 60;

    if (!vehicleId || !agencyId || !date_heure) {
      return res.status(400).json({
        error: 'Champs requis manquants',
        required: ['vehicule_id', 'agence_id', 'date_heure']
      });
    }

    const match = APPOINTMENT_DATE_TIME_REGEX.exec(String(date_heure || ''));
    if (!match) {
      return res.status(400).json({ error: 'Format date_heure invalide' });
    }

    const [, year, month, day, hour, minute, secondRaw] = match;
    const second = secondRaw || '00';
    const dateRef = `${year}-${month}-${day}`;
    const hourRef = Number(hour);
    const normalizedDateTime = `${year}-${month}-${day}T${hour}:${minute}:${second}`;

    const pool = await getConnection();

    // Vérifier que le téléphone est vérifié avant de permettre la prise de rendez-vous
    const userCheck = await pool.request()
      .input('client_id', sql.BigInt, clientId)
      .query(`
        SELECT telephone_verifie
        FROM Utilisateur
        WHERE id = @client_id
      `);

    if (userCheck.recordset.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    if (!userCheck.recordset[0].telephone_verifie) {
      return res.status(403).json({
        error: 'Vérification téléphone requise',
        message: 'Vous devez vérifier votre numéro de téléphone avant de prendre un rendez-vous. Veuillez vérifier le code envoyé par WhatsApp.',
        verification_required: true
      });
    }

    const isoWeekday = getIsoWeekdayFromDateRef(dateRef);
    if (!isoWeekday) {
      return res.status(400).json({ error: 'Date invalide' });
    }

    const openingRange = await pool.request()
      .input('agence_id', sql.BigInt, agencyId)
      .input('jour_semaine', sql.TinyInt, isoWeekday)
      .query(`
        SELECT TOP 1
          DATEPART(HOUR, heure_ouverture) AS open_hour,
          DATEPART(HOUR, heure_fermeture) AS close_hour,
          capacite
        FROM PlageHoraire
        WHERE agence_id = @agence_id
          AND jour_semaine = @jour_semaine
      `);

    if (openingRange.recordset.length === 0) {
      return res.status(400).json({ error: 'Aucune plage horaire disponible pour ce creneau.' });
    }

    const openingConfig = openingRange.recordset[0];
    const openHour = Number(openingConfig.open_hour);
    const closeHour = Number(openingConfig.close_hour);
    const configuredCapacity = Number(openingConfig.capacite);
    const capacity = configuredCapacity > 0 ? configuredCapacity : 1;

    if (Number.isNaN(openHour) || Number.isNaN(closeHour) || openHour >= closeHour) {
      return res.status(500).json({ error: 'Configuration de plage horaire invalide' });
    }

    if (hourRef < openHour || hourRef >= closeHour) {
      return res.status(400).json({ error: 'Ce creneau est hors plage horaire de l\'agence.' });
    }

    const occupancyAtSameHour = await pool.request()
      .input('agence_id', sql.BigInt, agencyId)
      .input('date_ref', sql.VarChar(10), dateRef)
      .input('hour_ref', sql.Int, hourRef)
      .query(`
        SELECT COUNT(*) AS total
        FROM RendezVous
        WHERE agence_id = @agence_id
          AND CAST(date_heure AS DATE) = CONVERT(date, @date_ref, 23)
          AND DATEPART(HOUR, date_heure) = @hour_ref
          AND statut NOT IN ('ANNULE', 'NO_SHOW')
      `);

    const used = Number(occupancyAtSameHour.recordset?.[0]?.total || 0);
    if (used >= capacity) {
      return res.status(409).json({
        error: `Ce creneau est complet (${used}/${capacity}). Choisissez une autre heure.`
      });
    }

    const vehicleCheck = await pool.request()
      .input('client_id', sql.BigInt, clientId)
      .input('vehicule_id', sql.BigInt, vehicleId)
      .query(`
        SELECT TOP 1 id, statut_validation
        FROM Vehicule
        WHERE id = @vehicule_id
          AND client_id = @client_id
      `);

    if (vehicleCheck.recordset.length === 0) {
      return res.status(400).json({ error: 'Ce vehicule n\'appartient pas au client.' });
    }

    if (vehicleCheck.recordset[0].statut_validation !== 'VALIDE') {
      return res.status(403).json({
        error: 'Véhicule non validé',
        message: 'Votre véhicule doit être validé par un agent SAV avant de prendre un rendez-vous.'
      });
    }

    // Process sub-types to extract valid IDs
    let validatedSubTypeIds = [];
    if (Array.isArray(sous_type_ids) && sous_type_ids.length > 0) {
      validatedSubTypeIds = [...new Set(sous_type_ids.map((id) => normalizePositiveInt(id)).filter(Boolean))];
      console.log('Validated sub-type IDs:', validatedSubTypeIds);
    } else {
      console.log('No sub-type IDs provided or invalid format');
    }

    // Process packages to extract valid IDs
    let validatedPackageIds = [];
    if (Array.isArray(package_ids) && package_ids.length > 0) {
      validatedPackageIds = [...new Set(package_ids.map((id) => normalizePositiveInt(id)).filter(Boolean))];
      console.log('Validated package IDs:', validatedPackageIds);
    } else {
      console.log('No package IDs provided or invalid format');
    }

    // Now create the appointment ONLY if validation passed
    const created = await pool.request()
      .input('client_id', sql.BigInt, clientId)
      .input('vehicule_id', sql.BigInt, vehicleId)
      .input('agence_id', sql.BigInt, agencyId)
      .input('date_heure_str', sql.VarChar(19), normalizedDateTime)
      .input('description', sql.NVarChar(sql.MAX), description || null)
      .input('duree_est', sql.Int, estimatedDuration)
      .query(`
        -- Parse the datetime string
        DECLARE @date_heure datetime2;
        SET @date_heure = CAST(@date_heure_str AS datetime2);

        -- Debug: Check the parsed date
        PRINT 'Parsed date: ' + CONVERT(varchar, @date_heure, 120);
        PRINT 'Current date: ' + CONVERT(varchar, GETDATE(), 120);

        INSERT INTO RendezVous (client_id, vehicule_id, agence_id, date_heure, description, duree_estimee, statut)
        VALUES (@client_id, @vehicule_id, @agence_id, @date_heure, @description, @duree_est, 'PLANIFIE');

        DECLARE @newId bigint = SCOPE_IDENTITY();

        INSERT INTO Notification (utilisateur_id, titre, message, type, entite_type, entite_id)
        VALUES (
          @client_id,
          N'Rendez-vous cree',
          N'Votre RDV du ' + FORMAT(@date_heure,'dd/MM/yyyy HH:mm') + N' est enregistre.',
          'PUSH',
          'RDV',
          @newId
        );

        SELECT @newId AS rdv_id;
      `);

    const rdvId = created.recordset?.[0]?.rdv_id;

    if (!rdvId) {
      return res.status(500).json({ error: 'Creation du rendez-vous echouee' });
    }

    // Insert validated sub-types with error handling
    const failedSubTypes = [];
    for (const sousTypeId of validatedSubTypeIds) {
      try {
        await pool.request()
          .input('rdv_id', sql.BigInt, rdvId)
          .input('sous_type_id', sql.BigInt, sousTypeId)
          .query(`
            INSERT INTO InterventionRDV (rdv_id, sous_type_id, statut)
            VALUES (@rdv_id, @sous_type_id, 'EN_ATTENTE')
          `);
      } catch (error) {
        console.warn(`Failed to insert sub-type ${sousTypeId}:`, error.message);
        failedSubTypes.push(sousTypeId);
      }
    }

    // Insert validated packages with error handling
    const failedPackages = [];
    let prixTotal = 0;
    
    for (const packageId of validatedPackageIds) {
      try {
        // Get package details
        const packageInfo = await pool.request()
          .input('package_id', sql.BigInt, packageId)
          .query(`
            SELECT id, nom, prix, actif
            FROM PackageIntervention
            WHERE id = @package_id AND actif = 1
          `);

        if (packageInfo.recordset.length === 0) {
          console.warn(`Package ${packageId} not found or inactive`);
          failedPackages.push(packageId);
          continue;
        }

        const pkg = packageInfo.recordset[0];
        const quantite = 1; // Default quantity
        const prixUnitaire = pkg.prix;

        // Insert into RDV_Package
        await pool.request()
          .input('rdv_id', sql.BigInt, rdvId)
          .input('package_id', sql.BigInt, packageId)
          .input('quantite', sql.Int, quantite)
          .input('prix_unitaire', sql.Decimal(10, 3), prixUnitaire)
          .query(`
            INSERT INTO RDV_Package (rdv_id, package_id, quantite, prix_unitaire)
            VALUES (@rdv_id, @package_id, @quantite, @prix_unitaire)
          `);

        prixTotal += prixUnitaire * quantite;
      } catch (error) {
        console.warn(`Failed to insert package ${packageId}:`, error.message);
        failedPackages.push(packageId);
      }
    }

    if (failedSubTypes.length > 0 || failedPackages.length > 0) {
      console.error('Invalid IDs:', { failedSubTypes, failedPackages });
      return res.status(400).json({
        error: 'Certains éléments sont invalides',
        invalid_sub_types: failedSubTypes,
        invalid_packages: failedPackages,
        message: 'Rendez-vous créé mais certains services/packages n\'ont pas pu être ajoutés'
      });
    }

    const details = await pool.request()
      .input('rdv_id', sql.BigInt, rdvId)
      .query(`
        SELECT
          r.id,
          r.client_id,
          r.vehicule_id,
          r.agence_id,
          r.date_heure,
          r.statut,
          r.description,
          r.duree_estimee,
          r.date_creation,
          ag.nom AS agence_nom,
          v.immatriculation,
          v.numero_chassis
        FROM RendezVous r
        JOIN Agence ag ON ag.id = r.agence_id
        JOIN Vehicule v ON v.id = r.vehicule_id
        WHERE r.id = @rdv_id
      `);

    const interventions = await pool.request()
      .input('rdv_id', sql.BigInt, rdvId)
      .query(`
        SELECT ir.id, ir.statut, ir.sous_type_id, st.nom AS sous_type_nom, ti.nom AS type_nom
        FROM InterventionRDV ir
        JOIN SousTypeIntervention st ON st.id = ir.sous_type_id
        JOIN TypeIntervention ti ON ti.id = st.type_intervention_id
        WHERE ir.rdv_id = @rdv_id
      `);

    // Get packages for this appointment
    const packages = await pool.request()
      .input('rdv_id', sql.BigInt, rdvId)
      .query(`
        SELECT 
          rp.package_id as id,
          p.nom,
          rp.prix_unitaire as prix,
          rp.quantite,
          p.description
        FROM RDV_Package rp
        JOIN PackageIntervention p ON p.id = rp.package_id
        WHERE rp.rdv_id = @rdv_id
      `);

    // Send WhatsApp notification if phone is available
    const userInfo = await pool.request()
      .input('id', sql.BigInt, clientId)
      .query(`SELECT telephone FROM Utilisateur WHERE id = @id`);

    if (userInfo.recordset.length > 0 && userInfo.recordset[0].telephone) {
      const appointmentInfo = {
        agence_nom: details.recordset[0].agence_nom,
        date_heure: details.recordset[0].date_heure,
        sous_type_nom: interventions.recordset[0]?.sous_type_nom || 'Service',
      };
      await sendAppointmentWhatsAppNotification(userInfo.recordset[0].telephone, appointmentInfo);
    }

    return res.status(201).json({
      message: 'Rendez-vous cree avec succes',
      appointment: details.recordset[0],
      interventions: interventions.recordset,
      packages: packages.recordset,
      prix_total: prixTotal
    });
  } catch (error) {
    console.error('Erreur creation rendez-vous:', error);

    if (error && error.code === 'EREQUEST' && [50001, 50002].includes(error.number)) {
      return res.status(400).json({ error: error.message });
    }

    if (error && error.code === 'EREQUEST' && error.number === 50003) {
      return res.status(409).json({ error: error.message });
    }

    return res.status(500).json({ error: 'Erreur lors de la creation du rendez-vous', message: error.message });
  }
};

const getMyAppointments = async (req, res) => {
  try {
    const clientId = req.user.id;
    const pool = await getConnection();

    const appointments = await pool.request()
      .input('client_id', sql.BigInt, clientId)
      .query(`
        SELECT
          r.id,
          r.client_id,
          r.vehicule_id,
          r.agence_id,
          r.date_heure,
          r.statut,
          r.description,
          r.duree_estimee,
          r.date_creation,
          ag.nom AS agence_nom,
          ag.ville AS agence_ville,
          ag.adresse AS agence_adresse,
          ag.telephone AS agence_telephone,
          v.immatriculation,
          v.numero_chassis,
          mo.nom AS modele_nom,
          ma.nom AS marque_nom
        FROM RendezVous r
        JOIN Agence ag ON ag.id = r.agence_id
        JOIN Vehicule v ON v.id = r.vehicule_id
        JOIN Version ve ON ve.id = v.version_id
        JOIN Modele mo ON mo.id = ve.modele_id
        JOIN Marque ma ON ma.id = mo.marque_id
        WHERE r.client_id = @client_id
        ORDER BY r.date_heure DESC
      `);

    const appointmentIds = appointments.recordset.map((row) => row.id);
    let interventionsByAppointment = {};

    if (appointmentIds.length > 0) {
      // Use parameterized query to prevent SQL injection
      const placeholders = appointmentIds.map((_, i) => `@rdv_id_${i}`).join(',');
      const request = pool.request();
      appointmentIds.forEach((id, i) => {
        request.input(`rdv_id_${i}`, sql.BigInt, id);
      });

      const interventions = await request.query(`
        SELECT ir.rdv_id, ir.id, ir.statut, st.nom AS sous_type_nom, ti.nom AS type_nom
        FROM InterventionRDV ir
        JOIN SousTypeIntervention st ON st.id = ir.sous_type_id
        JOIN TypeIntervention ti ON ti.id = st.type_intervention_id
        WHERE ir.rdv_id IN (${placeholders})
      `);

      interventionsByAppointment = interventions.recordset.reduce((acc, row) => {
        if (!acc[row.rdv_id]) {
          acc[row.rdv_id] = [];
        }
        acc[row.rdv_id].push({
          id: row.id,
          statut: row.statut,
          sous_type_nom: row.sous_type_nom,
          type_nom: row.type_nom
        });
        return acc;
      }, {});
    }

    const merged = appointments.recordset.map((row) => ({
      ...row,
      interventions: interventionsByAppointment[row.id] || []
    }));

    return res.json({ count: merged.length, appointments: merged });
  } catch (error) {
    console.error('Erreur chargement mes rendez-vous:', error);
    return res.status(500).json({ error: 'Erreur lors du chargement des rendez-vous', message: error.message });
  }
};

const getAgencies = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(`
      SELECT id, nom, ville, telephone, adresse
      FROM Agence
      ORDER BY nom
    `);

    return res.json({ count: result.recordset.length, agencies: result.recordset });
  } catch (error) {
    console.error('Erreur chargement agences:', error);
    return res.status(500).json({ error: 'Erreur lors du chargement des agences', message: error.message });
  }
};

const getAvailableSlots = async (req, res) => {
  try {
    const agencyId = normalizePositiveInt(req.query.agenceId);
    const date = req.query.date;

    if (!agencyId || !date) {
      return res.status(400).json({
        error: 'Parametres requis manquants',
        required: ['agenceId', 'date (YYYY-MM-DD)']
      });
    }

    const validDate = /^\d{4}-\d{2}-\d{2}$/.test(date);
    if (!validDate) {
      return res.status(400).json({ error: 'Format date invalide' });
    }

    const pool = await getConnection();

    const range = await pool.request()
      .input('agence_id', sql.BigInt, agencyId)
      .input('date_ref', sql.VarChar(10), date)
      .query(`
        SELECT TOP 1
          DATEPART(HOUR, heure_ouverture) AS open_hour,
          DATEPART(HOUR, heure_fermeture) AS close_hour,
          capacite
        FROM PlageHoraire
        WHERE agence_id = @agence_id
          AND jour_semaine = ((DATEDIFF(DAY, '19000101', CONVERT(date, @date_ref, 23)) % 7) + 1)
      `);

    if (range.recordset.length === 0) {
      return res.json({ count: 0, slots: [] });
    }

    const slotConfig = range.recordset[0];
    const openHour = Number(slotConfig.open_hour);
    const closeHour = Number(slotConfig.close_hour);
    const configuredCapacity = Number(slotConfig.capacite);
    const capacity = configuredCapacity > 0 ? configuredCapacity : 1;

    if (Number.isNaN(openHour) || Number.isNaN(closeHour) || openHour >= closeHour) {
      return res.status(500).json({ error: 'Configuration de plage horaire invalide' });
    }

    const busy = await pool.request()
      .input('agence_id', sql.BigInt, agencyId)
      .input('date_ref', sql.VarChar(10), date)
      .query(`
        SELECT DATEPART(HOUR, date_heure) AS heure, COUNT(*) AS total
        FROM RendezVous
        WHERE agence_id = @agence_id
          AND CAST(date_heure AS DATE) = CONVERT(date, @date_ref, 23)
          AND statut NOT IN ('ANNULE', 'NO_SHOW')
        GROUP BY DATEPART(HOUR, date_heure)
      `);

    const reservations = new Map();
    busy.recordset.forEach((row) => reservations.set(Number(row.heure), Number(row.total)));

    // Get current date and hour to filter out past slots
    const now = new Date();
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const currentHour = now.getHours();
    const isToday = date === today;

    const slots = [];
    for (let h = openHour; h < closeHour; h += 1) {
      // Skip past hours if this is today
      if (isToday && h <= currentHour) {
        continue;
      }

      const used = reservations.get(h) || 0;
      slots.push({
        hour: h,
        label: `${String(h).padStart(2, '0')}:00`,
        capacity,
        reserved: used,
        available: Math.max(capacity - used, 0),
        is_full: used >= capacity,
        configured_capacity: configuredCapacity
      });
    }

    return res.json({ count: slots.length, slots });
  } catch (error) {
    console.error('Erreur chargement des creneaux:', error);
    return res.status(500).json({ error: 'Erreur lors du chargement des creneaux', message: error.message });
  }
};

const getInterventionCatalog = async (req, res) => {
  try {
    const pool = await getConnection();

    const rows = await pool.request().query(`
      SELECT
        ti.id AS type_id,
        ti.nom AS type_nom,
        ti.delai_moyen,
        st.id AS sous_type_id,
        st.nom AS sous_type_nom,
        st.duree_estimee
      FROM TypeIntervention ti
      LEFT JOIN SousTypeIntervention st ON st.type_intervention_id = ti.id
      ORDER BY ti.nom, st.nom
    `);

    const grouped = rows.recordset.reduce((acc, row) => {
      if (!acc[row.type_id]) {
        acc[row.type_id] = {
          id: row.type_id,
          nom: row.type_nom,
          delai_moyen: row.delai_moyen,
          sous_types: []
        };
      }

      if (row.sous_type_id) {
        acc[row.type_id].sous_types.push({
          id: row.sous_type_id,
          nom: row.sous_type_nom,
          duree_estimee: row.duree_estimee
        });
      }

      return acc;
    }, {});

    const interventions = Object.values(grouped);

    return res.json({ count: interventions.length, interventions });
  } catch (error) {
    console.error('Erreur chargement interventions:', error);
    return res.status(500).json({ error: 'Erreur lors du chargement des interventions', message: error.message });
  }
};

/**
 * Get available packages
 */
const getAvailablePackages = async (req, res) => {
  try {
    const pool = await getConnection();

    const packages = await pool.request().query(`
      SELECT 
        id,
        nom,
        description,
        prix,
        actif
      FROM PackageIntervention
      WHERE actif = 1
      ORDER BY nom
    `);

    return res.json({ 
      count: packages.recordset.length, 
      packages: packages.recordset 
    });
  } catch (error) {
    console.error('Erreur chargement packages:', error);
    return res.status(500).json({ 
      error: 'Erreur lors du chargement des packages', 
      message: error.message 
    });
  }
};

const updateAppointmentStatus = async (req, res) => {
  try {
    if (!STAFF_ROLES.includes(req.user.role)) {
      return res.status(403).json({ error: 'Acces non autorise' });
    }

    const appointmentId = normalizePositiveInt(req.params.id);
    const { statut } = req.body;

    if (!appointmentId || !statut || !ALLOWED_STATUSES.includes(statut)) {
      return res.status(400).json({
        error: 'Statut invalide',
        valid_statuses: ALLOWED_STATUSES
      });
    }

    const pool = await getConnection();

    if (statut === 'CONFIRME') {
      await pool.request()
        .input('rdv_id', sql.BigInt, appointmentId)
        .input('agent_id', sql.BigInt, req.user.id)
        .execute('dbo.SP_ConfirmerRDV');
    } else {
      const result = await pool.request()
        .input('id', sql.BigInt, appointmentId)
        .input('statut', sql.VarChar(20), statut)
        .query(`
          UPDATE RendezVous
          SET statut = @statut
          WHERE id = @id
        `);

      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({ error: 'Rendez-vous introuvable' });
      }
    }

    const updated = await pool.request()
      .input('id', sql.BigInt, appointmentId)
      .query(`
        SELECT id, client_id, vehicule_id, agence_id, date_heure, statut, description, duree_estimee
        FROM RendezVous
        WHERE id = @id
      `);

    return res.json({ message: 'Statut mis a jour', appointment: updated.recordset[0] });
  } catch (error) {
    console.error('Erreur mise a jour statut rendez-vous:', error);
    return res.status(500).json({ error: 'Erreur lors de la mise a jour du statut', message: error.message });
  }
};

const getAppointmentDetails = async (req, res) => {
  try {
    const clientId = req.user.id;
    const appointmentId = normalizePositiveInt(req.params.id);

    if (!appointmentId) {
      return res.status(400).json({ error: 'ID rendez-vous invalide' });
    }

    const pool = await getConnection();

    const appointment = await pool.request()
      .input('id', sql.BigInt, appointmentId)
      .input('client_id', sql.BigInt, clientId)
      .query(`
        SELECT
          r.id,
          r.client_id,
          r.vehicule_id,
          r.agence_id,
          r.date_heure,
          r.statut,
          r.description,
          r.duree_estimee,
          r.date_creation,
          ag.nom AS agence_nom,
          ag.ville AS agence_ville,
          ag.adresse AS agence_adresse,
          ag.telephone AS agence_telephone,
          v.immatriculation,
          v.numero_chassis,
          mo.nom AS modele_nom,
          ma.nom AS marque_nom
        FROM RendezVous r
        JOIN Agence ag ON ag.id = r.agence_id
        JOIN Vehicule v ON v.id = r.vehicule_id
        JOIN Version ve ON ve.id = v.version_id
        JOIN Modele mo ON mo.id = ve.modele_id
        JOIN Marque ma ON ma.id = mo.marque_id
        WHERE r.id = @id AND r.client_id = @client_id
      `);

    if (appointment.recordset.length === 0) {
      return res.status(404).json({ error: 'Rendez-vous non trouve ou acces refusé' });
    }

    const interventions = await pool.request()
      .input('rdv_id', sql.BigInt, appointmentId)
      .query(`
        SELECT ir.id, ir.statut, st.nom AS sous_type_nom, ti.nom AS type_nom, st.duree_estimee
        FROM InterventionRDV ir
        JOIN SousTypeIntervention st ON st.id = ir.sous_type_id
        JOIN TypeIntervention ti ON ti.id = st.type_intervention_id
        WHERE ir.rdv_id = @rdv_id
      `);

    return res.json({
      appointment: appointment.recordset[0],
      interventions: interventions.recordset
    });
  } catch (error) {
    console.error('Erreur chargement details rendez-vous:', error);
    return res.status(500).json({ error: 'Erreur lors du chargement des details', message: error.message });
  }
};

const cancelAppointment = async (req, res) => {
  try {
    const clientId = req.user.id;
    const appointmentId = normalizePositiveInt(req.params.id);
    const { raison } = req.body;

    if (!appointmentId) {
      return res.status(400).json({ error: 'ID rendez-vous invalide' });
    }

    const pool = await getConnection();

    // Verify appointment belongs to client
    const existingAppointment = await pool.request()
      .input('id', sql.BigInt, appointmentId)
      .input('client_id', sql.BigInt, clientId)
      .query(`
        SELECT id, statut, date_heure
        FROM RendezVous
        WHERE id = @id AND client_id = @client_id
      `);

    if (existingAppointment.recordset.length === 0) {
      return res.status(404).json({ error: 'Rendez-vous non trouve' });
    }

    const appointment = existingAppointment.recordset[0];

    // Check if appointment can be cancelled (not already completed, cancelled, or passed)
    if (['TERMINE', 'ANNULE', 'NO_SHOW'].includes(appointment.statut)) {
      return res.status(400).json({ error: `Impossible d'annuler un rendez-vous avec le statut ${appointment.statut}` });
    }

    const appointmentDate = new Date(appointment.date_heure);
    if (appointmentDate < new Date()) {
      return res.status(400).json({ error: 'Impossible d\'annuler un rendez-vous dans le passé' });
    }

    // Cancel the appointment
    const result = await pool.request()
      .input('id', sql.BigInt, appointmentId)
      .input('raison', sql.NVarChar(sql.MAX), raison || null)
      .query(`
        UPDATE RendezVous
        SET statut = 'ANNULE'
        WHERE id = @id;

        INSERT INTO Notification (utilisateur_id, titre, message, type, entite_type, entite_id)
        VALUES (
          (SELECT client_id FROM RendezVous WHERE id = @id),
          N'Rendez-vous annulé',
          N'Votre rendez-vous a été annulé.' + CASE WHEN @raison IS NOT NULL THEN N' Raison: ' + @raison ELSE N'' END,
          'PUSH',
          'RDV',
          @id
        );
      `);

    // Send WhatsApp cancellation notification
    const appointmentInfo = await pool.request()
      .input('id', sql.BigInt, appointmentId)
      .query(`
        SELECT u.telephone, r.date_heure, ag.nom
        FROM RendezVous r
        JOIN Utilisateur u ON u.id = r.client_id
        JOIN Agence ag ON ag.id = r.agence_id
        WHERE r.id = @id
      `);

    if (appointmentInfo.recordset.length > 0 && appointmentInfo.recordset[0].telephone) {
      const appointment = appointmentInfo.recordset[0];
      const formattedDate = new Date(appointment.date_heure).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      const cancelMessage = `Votre rendez-vous du ${formattedDate} à l'agence ${appointment.nom} a été annulé.${raison ? `\n\nRaison: ${raison}` : ''}`;
      await sendAppointmentWhatsAppNotification(appointment.telephone, { agence_nom: appointment.nom, date_heure: appointment.date_heure });
    }

    return res.json({ message: 'Rendez-vous annulé avec succès' });
  } catch (error) {
    console.error('Erreur annulation rendez-vous:', error);
    return res.status(500).json({ error: 'Erreur lors de l\'annulation du rendez-vous', message: error.message });
  }
};

module.exports = {
  createAppointment,
  getMyAppointments,
  getAgencies,
  getAvailableSlots,
  getInterventionCatalog,
  getAvailablePackages,
  updateAppointmentStatus,
  getAppointmentDetails,
  cancelAppointment
};
