const { getConnection, sql } = require('../config/database');

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

const createAppointment = async (req, res) => {
  try {
    const clientId = req.user.id;
    const { vehicule_id, agence_id, date_heure, description, duree_estimee, sous_type_ids } = req.body;

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

    const existingAtSameHour = await pool.request()
      .input('agence_id', sql.BigInt, agencyId)
      .input('date_ref', sql.VarChar(10), dateRef)
      .input('hour_ref', sql.Int, hourRef)
      .query(`
        SELECT TOP 1 id
        FROM RendezVous
        WHERE agence_id = @agence_id
          AND CAST(date_heure AS DATE) = CONVERT(date, @date_ref, 23)
          AND DATEPART(HOUR, date_heure) = @hour_ref
          AND statut NOT IN ('ANNULE', 'NO_SHOW')
        ORDER BY id DESC
      `);

    if (existingAtSameHour.recordset.length > 0) {
      return res.status(409).json({
        error: 'Ce creneau n\'est pas disponible. Choisissez une autre heure.'
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
        SELECT TOP 1 heure_ouverture, heure_fermeture
        FROM PlageHoraire
        WHERE agence_id = @agence_id
          AND jour_semaine = @jour_semaine
      `);

    if (openingRange.recordset.length === 0) {
      return res.status(400).json({ error: 'Aucune plage horaire disponible pour ce creneau.' });
    }

    const vehicleCheck = await pool.request()
      .input('client_id', sql.BigInt, clientId)
      .input('vehicule_id', sql.BigInt, vehicleId)
      .query(`
        SELECT TOP 1 id
        FROM Vehicule
        WHERE id = @vehicule_id
          AND client_id = @client_id
      `);

    if (vehicleCheck.recordset.length === 0) {
      return res.status(400).json({ error: 'Ce vehicule n\'appartient pas au client.' });
    }

    const created = await pool.request()
      .input('client_id', sql.BigInt, clientId)
      .input('vehicule_id', sql.BigInt, vehicleId)
      .input('agence_id', sql.BigInt, agencyId)
      .input('date_heure_str', sql.VarChar(19), normalizedDateTime)
      .input('description', sql.NVarChar(sql.MAX), description || null)
      .input('duree_est', sql.Int, estimatedDuration)
      .query(`
        DECLARE @date_heure datetime2 = CONVERT(datetime2, @date_heure_str, 126);

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

    if (Array.isArray(sous_type_ids) && sous_type_ids.length > 0) {
      const uniqueIds = [...new Set(sous_type_ids.map((id) => normalizePositiveInt(id)).filter(Boolean))];

      if (uniqueIds.length > 0) {
        const checkSubTypes = await pool.request()
          .query(`
            SELECT id
            FROM SousTypeIntervention
            WHERE id IN (${uniqueIds.join(',')})
          `);

        const foundIds = new Set(checkSubTypes.recordset.map((row) => row.id));
        const missingIds = uniqueIds.filter((id) => !foundIds.has(id));

        if (missingIds.length > 0) {
          return res.status(400).json({
            error: 'Sous-types invalides',
            invalid_ids: missingIds
          });
        }

        for (const sousTypeId of uniqueIds) {
          await pool.request()
            .input('rdv_id', sql.BigInt, rdvId)
            .input('sous_type_id', sql.BigInt, sousTypeId)
            .query(`
              INSERT INTO InterventionRDV (rdv_id, sous_type_id, statut)
              VALUES (@rdv_id, @sous_type_id, 'EN_ATTENTE')
            `);
        }
      }
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

    return res.status(201).json({
      message: 'Rendez-vous cree avec succes',
      appointment: details.recordset[0],
      interventions: interventions.recordset
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
          v.immatriculation
        FROM RendezVous r
        JOIN Agence ag ON ag.id = r.agence_id
        JOIN Vehicule v ON v.id = r.vehicule_id
        WHERE r.client_id = @client_id
        ORDER BY r.date_heure DESC
      `);

    const appointmentIds = appointments.recordset.map((row) => row.id);
    let interventionsByAppointment = {};

    if (appointmentIds.length > 0) {
      const interventions = await pool.request()
        .query(`
          SELECT ir.rdv_id, ir.id, ir.statut, st.nom AS sous_type_nom, ti.nom AS type_nom
          FROM InterventionRDV ir
          JOIN SousTypeIntervention st ON st.id = ir.sous_type_id
          JOIN TypeIntervention ti ON ti.id = st.type_intervention_id
          WHERE ir.rdv_id IN (${appointmentIds.join(',')})
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
    const capacity = 1;

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

    const slots = [];
    for (let h = openHour; h < closeHour; h += 1) {
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

module.exports = {
  createAppointment,
  getMyAppointments,
  getAgencies,
  getAvailableSlots,
  getInterventionCatalog,
  updateAppointmentStatus
};
