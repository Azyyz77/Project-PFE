/**
 * SERVICE: Agent Dashboard Service
 * Logique métier pour le dashboard de l'agent SAV (MSSQL)
 */

const { getConnection, sql } = require('../config/database');

class AgentDashboardService {

  // ============================================================
  // DASHBOARD PRINCIPAL
  // ============================================================

  static async getDashboardSummary(agentId) {
    try {
      const pool = await getConnection();
      const today = new Date().toISOString().split('T')[0];

      const result = await pool.request()
        .input('agent_id', sql.BigInt, agentId)
        .input('today', sql.Date, new Date(today))
        .query(`
          SELECT
            COUNT(CASE WHEN statut = 'EN_ATTENTE' OR statut = 'PLANIFIE' THEN 1 END) AS rendez_vous_en_attente,
            COUNT(CASE WHEN statut = 'EN_COURS'   THEN 1 END) AS interventions_en_cours,
            COUNT(CASE WHEN statut IN ('CONFIRME','EN_ATTENTE','PLANIFIE')
                            AND CAST(date_heure AS DATE) = @today THEN 1 END) AS rendez_vous_aujourd_hui,
            COUNT(CASE WHEN statut = 'TERMINE'
                            AND CAST(date_heure AS DATE) = @today THEN 1 END) AS interventions_terminees
          FROM RendezVous
          WHERE agent_id = @agent_id
            OR agent_id IS NULL
        `);

      const recap = result.recordset[0] || {};

      const vehiclesToValidate = await pool.request().query(`
        SELECT COUNT(*) AS cnt
        FROM Vehicule
        WHERE statut_validation = 'EN_ATTENTE'
      `);

      const reclamations = await pool.request()
        .input('agent_id', sql.BigInt, agentId)
        .query(`
          SELECT COUNT(*) AS cnt
          FROM Reclamation
          WHERE (agent_id = @agent_id OR agent_id IS NULL)
            AND statut IN ('SOUMISE', 'OUVERTE', 'EN_COURS')
        `);

      return {
        rendez_vous_en_attente:  recap.rendez_vous_en_attente  || 0,
        interventions_en_cours:  recap.interventions_en_cours  || 0,
        rendez_vous_aujourd_hui: recap.rendez_vous_aujourd_hui || 0,
        interventions_terminees: recap.interventions_terminees || 0,
        reclamations_ouvertes:   reclamations.recordset[0].cnt || 0,
<<<<<<< HEAD
        vehicules_a_valider:     0, // Pas de validation dans script.sql
=======
        vehicules_a_valider:     vehiclesToValidate.recordset[0].cnt || 0,
        vehicules_a_valider:     vehiclesToValidate.recordset[0].cnt || 0,`Erreur récupération dashboard: ${error.message}`);
    }
  }

  // ============================================================
  // GESTION DES RENDEZ-VOUS
  // ============================================================

  static async getAppointmentsList(agentId, filters = {}) {
    try {
      const pool = await getConnection();

      let query = `
        SELECT
          r.id,
          r.client_id,
          r.vehicule_id,
          r.agence_id,
          r.agent_id,
          r.date_heure AS date_rendez_vous,
          r.statut,
          r.description,
          r.duree_estimee,
          r.heure_reelle_debut AS heure_debut_reelle,
          r.heure_reelle_fin AS heure_fin_reelle,
<<<<<<< HEAD
          r.raison_annulation AS motif_annulation,
=======
          CAST(NULL AS NVARCHAR(255)) AS motif_annulation,
          r.raison_annulation AS motif_annulation,       AS client_telephone,
          u.email            AS client_email,
          v.immatriculation,
          v.numero_chassis   AS vin,
          a.nom              AS agence_nom,
          a.ville            AS agence_ville,
          m.nom              AS marque_nom,
          mo.nom             AS modele_nom
        FROM RendezVous r
        JOIN Utilisateur u  ON u.id  = r.client_id
        JOIN Vehicule    v  ON v.id  = r.vehicule_id
        JOIN Agence      a  ON a.id  = r.agence_id
        JOIN Version     ve ON ve.id = v.version_id
        JOIN Modele      mo ON mo.id = ve.modele_id
        JOIN Marque      m  ON m.id  = mo.marque_id
<<<<<<< HEAD
        WHERE (r.agent_id = @agent_id OR r.agent_id IS NULL)
=======
        WHERE 1 = 1
>>>>>>> feat/agent-sav
      `;

      const request = pool.request()
        WHERE (r.agent_id = @agent_id OR r.agent_id IS NULL)'statut', sql.VarChar(20), filters.statut);
      }
      if (filters.fromDate) {
        query += ` AND CAST(r.date_heure AS DATE) >= @fromDate`;
        request.input('fromDate', sql.Date, new Date(filters.fromDate));
      }
      if (filters.toDate) {
        query += ` AND CAST(r.date_heure AS DATE) <= @toDate`;
        request.input('toDate', sql.Date, new Date(filters.toDate));
      }
      if (filters.agenceId) {
        query += ` AND r.agence_id = @agenceId`;
        request.input('agenceId', sql.BigInt, filters.agenceId);
      }

      query += ` ORDER BY r.date_heure DESC`;

      const result = await request.query(query);

      const appointments = await Promise.all(
        result.recordset.map(async (rdv) => {
          const interventions = await pool.request()
            .input('rdv_id', sql.BigInt, rdv.id)
            .query(`
              SELECT
                ir.id,
                ir.statut,
                ir.commentaire AS notes,
                sti.nom  AS sous_type_nom,
<<<<<<< HEAD
                ir.cout_reel AS prix,
=======
                CAST(NULL AS DECIMAL(10,2)) AS prix,
>>>>>>> feat/agent-sav
                ti.nom   AS type_nom,
                ti.delai_moyen
              FROM InterventionRDV ir
                ir.cout_reel AS prix,rdv, interventions: interventions.recordset };
        })
      );

      return appointments;
    } catch (error) {
      throw new Error(`Erreur récupération rendez-vous: ${error.message}`);
    }
  }

  static async confirmAppointment(appointmentId, agentId) {
    try {
      const pool = await getConnection();

      const check = await pool.request()
        .input('rdv_id', sql.BigInt, appointmentId)
        .query(`SELECT id, client_id, date_heure FROM RendezVous WHERE id = @rdv_id`);

      if (check.recordset.length === 0) {
        throw new Error('Rendez-vous non trouvé');
      }

      await pool.request()
        .input('rdv_id',   sql.BigInt,   appointmentId)
        .input('agent_id', sql.BigInt,   agentId)
        .input('statut',   sql.VarChar(20), 'CONFIRME')
        .query(`
          UPDATE RendezVous
          SET statut = @statut, agent_id = @agent_id, date_modification = GETDATE()
          WHERE id = @rdv_id
        `);

      const rdv = check.recordset[0];

      await pool.request()
        .input('client_id', sql.BigInt,          rdv.client_id)
        .input('titre',     sql.NVarChar(200),   'Rendez-vous confirmé')
        .input('message',   sql.NVarChar(sql.MAX), `Votre rendez-vous a été confirmé.`)
        .input('rdv_id',    sql.BigInt,           appointmentId)
        .query(`
          INSERT INTO Notification (utilisateur_id, titre, message, lu, type, entite_type, entite_id, date_envoi)
          VALUES (@client_id, @titre, @message, 0, 'PUSH', 'RDV', @rdv_id, GETDATE())
        `);

      return { id: appointmentId, statut: 'CONFIRME', agent_id: agentId };
    } catch (error) {
      throw new Error(`Erreur confirmation rendez-vous: ${error.message}`);
    }
  }

  static async startIntervention(appointmentId, agentId) {
    try {
      const pool = await getConnection();
      const now = new Date();

      const check = await pool.request()
        .input('rdv_id', sql.BigInt, appointmentId)
        .query(`SELECT id, statut FROM RendezVous WHERE id = @rdv_id`);

      if (check.recordset.length === 0) throw new Error('Rendez-vous non trouvé');

      await pool.request()
        .input('rdv_id',   sql.BigInt,    appointmentId)
        .input('agent_id', sql.BigInt,    agentId)
        .input('now',      sql.DateTime2, now)
        .input('statut',   sql.VarChar(20), 'EN_COURS')
        .query(`
          UPDATE RendezVous
          SET statut = @statut, heure_reelle_debut = @now, agent_id = @agent_id, date_modification = @now
          WHERE id = @rdv_id
        `);

      await pool.request()
        .input('rdv_id', sql.BigInt, appointmentId)
        .input('statut', sql.VarChar(20), 'EN_COURS')
        .input('now',    sql.DateTime2, now)
        .query(`UPDATE InterventionRDV SET statut = @statut, date_debut = @now WHERE rdv_id = @rdv_id`);

      return { id: appointmentId, statut: 'EN_COURS', heure_debut_reelle: now };
    } catch (error) {
      throw new Error(`Erreur démarrage intervention: ${error.message}`);
    }
  }

  static async finishIntervention(appointmentId, agentId, data) {
    try {
      const pool = await getConnection();
      const now = new Date();

      const rdvRes = await pool.request()
        .input('rdv_id', sql.BigInt, appointmentId)
        .query(`SELECT id, client_id FROM RendezVous WHERE id = @rdv_id`);

      if (rdvRes.recordset.length === 0) throw new Error('Rendez-vous non trouvé');
      const rdv = rdvRes.recordset[0];

      await pool.request()
        .input('rdv_id',       sql.BigInt,    appointmentId)
        .input('agent_id',     sql.BigInt,    agentId)
        .input('now',          sql.DateTime2, now)
        .input('statut',       sql.VarChar(20), 'TERMINE')
        .input('description',  sql.NVarChar(sql.MAX), data.notes || '')
        .query(`
          UPDATE RendezVous
          SET statut = @statut,
              heure_reelle_fin = @now,
              description = ISNULL(description, '') + CHAR(13) + @description,
              agent_id = @agent_id,
              date_modification = @now
          WHERE id = @rdv_id
        `);

      await pool.request()
        .input('rdv_id', sql.BigInt, appointmentId)
        .input('statut', sql.VarChar(20), 'TERMINEE')
        .input('now',    sql.DateTime2, now)
        .query(`UPDATE InterventionRDV SET statut = @statut, date_fin = @now WHERE rdv_id = @rdv_id`);

      await pool.request()
        .input('client_id', sql.BigInt,          rdv.client_id)
        .input('titre',     sql.NVarChar(100),   'Intervention terminée')
        .input('message',   sql.NVarChar(sql.MAX), 'Votre véhicule est prêt.')
        .input('rdv_id',    sql.BigInt,           appointmentId)
        .query(`
          INSERT INTO Notification (utilisateur_id, titre, message, lu, type, entite_type, entite_id, date_envoi)
          VALUES (@client_id, @titre, @message, 0, 'PUSH', 'RDV', @rdv_id, GETDATE())
        `);

      return { id: appointmentId, statut: 'TERMINE', heure_fin_reelle: now };
    } catch (error) {
      throw new Error(`Erreur fin intervention: ${error.message}`);
    }
  }

  static async updateAppointment(appointmentId, agentId, data) {
    try {
      const pool = await getConnection();
      
      const checkResult = await pool.request()
        .input('id', sql.BigInt, appointmentId)
        .query('SELECT * FROM RendezVous WHERE id = @id');
        
      if (checkResult.recordset.length === 0) {
        throw new Error('Rendez-vous non trouvé');
      }

      const request = pool.request()
        .input('id', sql.BigInt, appointmentId)
        .input('date_modification', sql.DateTime2, new Date());

      let updateQuery = 'UPDATE RendezVous SET date_modification = @date_modification';

      if (data.date_rendez_vous) {
        updateQuery += ', date_heure = @date_rendez_vous';
        request.input('date_rendez_vous', sql.DateTime2, new Date(data.date_rendez_vous));
      }
      if (data.statut) {
        updateQuery += ', statut = @statut';
        request.input('statut', sql.VarChar(20), data.statut);
      }
      if (data.description) {
        updateQuery += ', description = @description';
        request.input('description', sql.NVarChar(sql.MAX), data.description);
      }

      updateQuery += ' WHERE id = @id';
      await request.query(updateQuery);

      return { id: appointmentId, statut: data.statut || checkResult.recordset[0].statut };
    } catch (error) {
      throw new Error(`Erreur modification RDV: ${error.message}`);
    }
  }

  static async cancelAppointment(appointmentId, agentId, reason) {
    try {
      const pool = await getConnection();

      const check = await pool.request()
        .input('rdv_id', sql.BigInt, appointmentId)
        .query(`SELECT id, client_id FROM RendezVous WHERE id = @rdv_id`);

      if (check.recordset.length === 0) throw new Error('Rendez-vous non trouvé');
      const rdv = check.recordset[0];

      await pool.request()
        .input('rdv_id',   sql.BigInt,    appointmentId)
        .input('agent_id', sql.BigInt,    agentId)
        .input('now',      sql.DateTime2, new Date())
        .input('statut',   sql.VarChar(20), 'ANNULE')
        .input('raison',   sql.NVarChar(255), reason || 'Annulé par l\'agent')
        .query(`
          UPDATE RendezVous
          SET statut = @statut, 
              raison_annulation = @raison, 
              date_annulation = @now, 
              utilisateur_annulation = @agent_id,
              date_modification = @now
          WHERE id = @rdv_id
        `);

      await pool.request()
        .input('client_id', sql.BigInt,          rdv.client_id)
        .input('titre',     sql.NVarChar(100),   'Rendez-vous annulé')
        .input('message',   sql.NVarChar(sql.MAX), `Votre rendez-vous a été annulé par le SAV. Motif: ${reason}`)
        .input('rdv_id',    sql.BigInt,           appointmentId)
        .query(`
          INSERT INTO Notification (utilisateur_id, titre, message, lu, type, entite_type, entite_id, date_envoi)
          VALUES (@client_id, @titre, @message, 0, 'PUSH', 'RDV', @rdv_id, GETDATE())
        `);

      return { id: appointmentId, statut: 'ANNULE', raison_annulation: reason };
    } catch (error) {
      throw new Error(`Erreur annulation rendez-vous: ${error.message}`);
    }
  }

  // ============================================================
  // CLIENTS
  // ============================================================

  static async getClientProfile(clientId) {
    try {
      const pool = await getConnection();

      const userRes = await pool.request()
        .input('client_id', sql.BigInt, clientId)
        .query(`
          SELECT id, nom, prenom, email, telephone, code_client, adresse, actif, date_creation
          FROM Utilisateur
          WHERE id = @client_id AND type_utilisateur = 'CLIENT'
        `);

      if (userRes.recordset.length === 0) throw new Error('Client non trouvé');
      const client = userRes.recordset[0];

      const vehicules = await pool.request()
        .input('client_id', sql.BigInt, clientId)
        .query(`
          SELECT 
            v.id, v.immatriculation, v.numero_chassis as vin, v.annee, v.couleur,
            m.nom AS marque, mo.nom AS modele
          FROM Vehicule v
          JOIN Version ve ON ve.id = v.version_id
          JOIN Modele mo ON mo.id = ve.modele_id
          JOIN Marque m ON m.id = mo.marque_id
          WHERE v.client_id = @client_id
        `);

      const rdvs = await pool.request()
        .input('client_id', sql.BigInt, clientId)
        .query(`
          SELECT id, date_heure as date_rendez_vous, statut, description
          FROM RendezVous
          WHERE client_id = @client_id
          ORDER BY date_heure DESC
        `);

      const recs = await pool.request()
        .input('client_id', sql.BigInt, clientId)
        .query(`
          SELECT id, numero, objet as sujet, statut, date_soumission as date_creation
          FROM Reclamation
          WHERE client_id = @client_id
          ORDER BY date_soumission DESC
        `);

      return {
        ...client,
        vehicules: vehicules.recordset,
        historique_rdv: rdvs.recordset,
        reclamations: recs.recordset
      };
    } catch (error) {
      throw new Error(`Erreur profil client: ${error.message}`);
    }
  }

  // ============================================================
  // VEHICULES
  // ============================================================

  static async getAllVehicles(filters = {}) {
    try {
      const pool = await getConnection();
      let query = `
        SELECT
          v.id,
          v.client_id,
          v.immatriculation,
          v.numero_chassis as vin,
          v.annee,
          v.couleur,
          v.statut_validation,
          v.motif_refus,
          v.date_validation,
          v.agent_validateur_id,
          v.date_ajout as date_creation,
          u.nom AS client_nom,
          u.prenom AS client_prenom,
          u.email AS client_email,
          u.telephone AS client_telephone,
          m.nom AS marque_nom,
          mo.nom AS modele_nom,
          ve.nom AS version_nom
        FROM Vehicule v
        JOIN Utilisateur u ON u.id = v.client_id
        JOIN Version ve ON ve.id = v.version_id
        JOIN Modele mo ON mo.id = ve.modele_id
        JOIN Marque m ON m.id = mo.marque_id
        WHERE 1 = 1
      `;

      const request = pool.request();
      if (filters.statut) {
        query += ` AND v.statut_validation = @statut`;
        request.input('statut', sql.VarChar(20), filters.statut);
      }

      query += ` ORDER BY v.date_ajout DESC`;

      const result = await request.query(query);
      return result.recordset;
    } catch (error) {
      throw new Error(`Erreur liste véhicules: ${error.message}`);
    }
  }

  static async getVehiclesToValidate() {
    try {
      return await AgentDashboardService.getAllVehicles({ statut: 'EN_ATTENTE' });
    } catch (error) {
      throw new Error(`Erreur véhicules à valider: ${error.message}`);
    }
  }

  static async validateVehicle(vehicleId, agentId) {
    try {
      const pool = await getConnection();

      const existing = await pool.request()
        .input('vehicle_id', sql.BigInt, vehicleId)
        .query(`
          SELECT id, statut_validation
          FROM Vehicule
          WHERE id = @vehicle_id
        `);

      if (existing.recordset.length === 0) {
        throw new Error('Véhicule non trouvé');
      }

      await pool.request()
        .input('vehicle_id', sql.BigInt, vehicleId)
        .input('agent_id', sql.BigInt, agentId)
        .query(`
          UPDATE Vehicule
          SET
            statut_validation = 'VALIDE',
            motif_refus = NULL,
            date_validation = GETDATE(),
            agent_validateur_id = @agent_id
          WHERE id = @vehicle_id
        `);

      return {
        id: vehicleId,
        statut_validation: 'VALIDE',
        agent_validateur_id: agentId,
      };
    } catch (error) {
      throw new Error(`Erreur validation véhicule: ${error.message}`);
    }
  }

  static async rejectVehicle(vehicleId, agentId, reason) {
    try {
      const pool = await getConnection();

      const existing = await pool.request()
        .input('vehicle_id', sql.BigInt, vehicleId)
        .query(`
          SELECT id
          FROM Vehicule
          WHERE id = @vehicle_id
        `);

      if (existing.recordset.length === 0) {
        throw new Error('Véhicule non trouvé');
      }

      await pool.request()
        .input('vehicle_id', sql.BigInt, vehicleId)
        .input('agent_id', sql.BigInt, agentId)
        .input('motif_refus', sql.NVarChar(255), reason || 'Refusé par l\'agent SAV')
        .query(`
          UPDATE Vehicule
          SET
            statut_validation = 'REFUSE',
            motif_refus = @motif_refus,
            date_validation = GETDATE(),
            agent_validateur_id = @agent_id
          WHERE id = @vehicle_id
        `);

      return {
        id: vehicleId,
        statut_validation: 'REFUSE',
        motif_refus: reason || 'Refusé par l\'agent SAV',
        agent_validateur_id: agentId,
      };
    } catch (error) {
      throw new Error(`Erreur refus véhicule: ${error.message}`);
    }
  }

  // ============================================================
  // RECLAMATIONS
  // ============================================================

  static async getComplaints(agentId, statut) {
    try {
      const pool = await getConnection();
      let query = `
        SELECT
          r.id,
          r.client_id,
          r.agent_id,
          r.numero,
          r.objet as sujet,
          r.description,
          r.statut,
          r.date_soumission as date_creation,
          r.date_traitement as date_resolution,
          u.nom AS client_nom,
          u.prenom AS client_prenom,
          u.email AS client_email,
          u.telephone AS client_telephone,
          rdv.id AS rdv_id, 
          rdv.date_heure as date_rendez_vous
        FROM Reclamation r
        JOIN Utilisateur u ON u.id = r.client_id
        LEFT JOIN RendezVous rdv ON rdv.id = r.id -- FIXME if needed, script.sql doesn't have rendez_vous_id in Reclamation
        WHERE (r.agent_id = @agent_id OR r.agent_id IS NULL)
      `;

      const request = pool.request()
        .input('agent_id', sql.BigInt, agentId);

      if (statut) {
        query += ` AND r.statut = @statut`;
        request.input('statut', sql.VarChar(20), statut);
      }

      query += ` ORDER BY r.date_soumission DESC`;

      const result = await request.query(query);

      // Pas de table ReponseReclamation dans script.sql
      const complaints = result.recordset.map((rec) => {
        return { ...rec, reponses: [] };
      });

      return complaints;
    } catch (error) {
      throw new Error(`Erreur récupération réclamations: ${error.message}`);
    }
  }

  static async answerComplaint(complaintId, agentId, response) {
    throw new Error('Pas de table ReponseReclamation dans script.sql pour ' + complaintId);
  }

  static async updateComplaintStatus(complaintId, statut) {
    try {
      const pool = await getConnection();
      
      const res = await pool.request()
        .input('id', sql.BigInt, complaintId)
        .query('SELECT id FROM Reclamation WHERE id = @id');
        
      if (res.recordset.length === 0) throw new Error('Réclamation non trouvée');

      await pool.request()
        .input('id', sql.BigInt, complaintId)
        .input('statut', sql.VarChar(20), statut)
        .input('now', sql.DateTime2, new Date())
        .query(`
<<<<<<< HEAD
          UPDATE Reclamation
          SET statut = @statut,
              date_traitement = CASE WHEN @statut = 'EN_COURS' THEN ISNULL(date_traitement, @now) ELSE date_traitement END,
              date_cloture = CASE WHEN @statut IN ('TRAITEE', 'CLOTUREE') THEN @now ELSE NULL END
=======
          UPDATE Reclamation 
          SET statut = @statut,
              date_traitement = CASE WHEN @statut = 'EN_COURS' THEN ISNULL(date_traitement, @now) ELSE date_traitement END,
              date_cloture = CASE WHEN @statut IN ('RESOLUE', 'FERMEE', 'CLOTUREE') THEN @now ELSE NULL END
>>>>>>> feat/agent-sav
          WHERE id = @id
          UPDATE Reclamation
          SET statut = @statut,
              date_traitement = CASE WHEN @statut = 'EN_COURS' THEN ISNULL(date_traitement, @now) ELSE date_traitement END,
              date_cloture = CASE WHEN @statut IN ('TRAITEE', 'CLOTUREE', 'RESOLUE', 'FERMEE') THEN @now ELSE NULL END

<<<<<<< HEAD
  static async submitComplaint(clientId, { sujet, description }) {
    try {
      // Validate input parameters (clientId can be string or number from JWT)
      if (!clientId) {
        throw new Error('clientId invalide ou manquant');
      }

      const clientIdBigInt = BigInt(clientId);
      const pool = await getConnection();

      // Verify client exists
      const clientCheck = await pool.request()
        .input('client_id', sql.BigInt, clientIdBigInt)
        .query(`SELECT id FROM Utilisateur WHERE id = @client_id`);

      if (clientCheck.recordset.length === 0) {
        throw new Error('Client non trouvé');
      }
      // Generate SIMPLE numeric numero (YYYYMMDDHHMMSS + random)
      const now = new Date();
      const timestamp = now.getFullYear().toString() +
                       String(now.getMonth() + 1).padStart(2, '0') +
                       String(now.getDate()).padStart(2, '0') +
                       String(now.getHours()).padStart(2, '0') +
                       String(now.getMinutes()).padStart(2, '0') +
                       String(now.getSeconds()).padStart(2, '0');
      const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
      const numero = `${timestamp}${random}`;

      // Validate inputs
      if (!sujet || sujet.trim().length === 0) {
        throw new Error('Le sujet est requis');
      }
      if (!description || description.trim().length === 0) {
        throw new Error('La description est requise');
      }

      const sujetTrimmed = sujet.trim();
      const descriptionTrimmed = description.trim();

      if (sujetTrimmed.length > 200) {
        throw new Error('Le sujet ne doit pas dépasser 200 caractères');
      }

      // Insert complaint
      const result = await pool.request()
        .input('client_id', sql.BigInt, clientIdBigInt)
        .input('numero', sql.NVarChar(30), numero)
        .input('sujet', sql.NVarChar(200), sujetTrimmed)
        .input('description', sql.NVarChar(sql.MAX), descriptionTrimmed)
        .input('date_creation', sql.DateTime2, now)
        .query(`
          INSERT INTO Reclamation (client_id, numero, objet, description, statut, date_soumission)
          VALUES (@client_id, @numero, @sujet, @description, 'SOUMISE', @date_creation);
          SELECT CAST(SCOPE_IDENTITY() AS BIGINT) AS id;
        `);

      const complaintId = result.recordset?.[0]?.id;
      if (!complaintId) {
        throw new Error('Impossible de créer la réclamation (pas d\'ID retourné)');
      }

      console.log(`✅ Réclamation créée: ID=${complaintId}, client_id=${clientId}, numero=${numero}`);

      return {
        id: complaintId,
        numero,
        sujet: sujetTrimmed,
        description: descriptionTrimmed,
        statut: 'SOUMISE',
        date_creation: now.toISOString()
      };
    } catch (error) {
      console.error('❌ submitComplaint error:', error.message);
      throw new Error(`Erreur création réclamation: ${error.message}`);
    }
  }

  static async getClientComplaints(clientId) {
    try {
      if (!clientId) {
        throw new Error('clientId is required');
      }

      const clientIdBigInt = BigInt(clientId);
      const pool = await getConnection();
      const result = await pool.request()
        .input('client_id', sql.BigInt, clientIdBigInt)
        .query(`
          SELECT
            id,
            numero,
            objet as sujet,
            description,
            statut,
            date_soumission as date_creation,
            date_traitement,
            date_cloture
          FROM Reclamation
          WHERE client_id = @client_id
          ORDER BY date_soumission DESC
        `);

      console.log(`✅ Retrieved ${result.recordset.length} complaints for client ${clientId}`);
      return result.recordset;
    } catch (error) {
      console.error(`❌ getClientComplaints error for client ${clientId}:`, error.message);
      throw new Error(`Erreur récupération réclamations client: ${error.message}`);
    }
  }

=======
>>>>>>> feat/agent-sav
  // ============================================================
  // NOTIFICATIONS
  // ============================================================

  static async getNotifications(agentId) {
    try {
        .input('agent_id', sql.BigInt, agentId)
        .query(`
          SELECT TOP 20 id, titre, message, type, entite_type, entite_id, lu, date_envoi as date_creation
          FROM Notification
          WHERE utilisateur_id = @agent_id
          ORDER BY date_envoi DESC
        `);
      return result.recordset;
    } catch (error) {
      throw new Error(`Erreur notifications: ${error.message}`);
    }
  }

  static async markNotificationRead(notifId, agentId) {
    try {
      const pool = await getConnection();
      await pool.request()
        .input('notif_id',  sql.BigInt, notifId)
        .input('agent_id',  sql.BigInt, agentId)
        .query(`
          UPDATE Notification SET lu = 1
          WHERE id = @notif_id AND utilisateur_id = @agent_id
        `);
      return { success: true };
    } catch (error) {
      throw new Error(`Erreur marquage notification: ${error.message}`);
    }
  }

  static async markAllNotificationsRead(agentId) {
    try {
      const pool = await getConnection();
      await pool.request()
        .input('agent_id', sql.BigInt, agentId)
        .query(`UPDATE Notification SET lu = 1 WHERE utilisateur_id = @agent_id AND lu = 0`);
      return { success: true };
    } catch (error) {
      throw new Error(`Erreur marquage toutes notifications: ${error.message}`);
    }
  }

  // ============================================================
  // STATISTIQUES (AGENT)
  // ============================================================

  static async getMonthlyStatistics(agentId) {
    try {
      const pool = await getConnection();
      const today = new Date();
      const currentYear = today.getFullYear();

      // Rendez-vous par mois
      const rdvs = await pool.request()
        .input('agent_id', sql.BigInt, agentId)
        .input('year', sql.Int, currentYear)
        .query(`
          SELECT 
            MONTH(date_heure) as mois,
            COUNT(*) as total
          FROM RendezVous
          WHERE YEAR(date_heure) = @year
            AND (agent_id = @agent_id OR agent_id IS NULL)
          GROUP BY MONTH(date_heure)
          ORDER BY mois
        `);

      const appointmentsByMonth = Array(12).fill(0);
      rdvs.recordset.forEach(r => {
        appointmentsByMonth[r.mois - 1] = r.total;
      });

      // Interventions par type (Global, non filtré par mois pour simplifier)
      const intervs = await pool.request()
        .input('agent_id', sql.BigInt, agentId)
        .query(`
          SELECT 
            ti.nom AS label,
            COUNT(ir.id) AS value
          FROM InterventionRDV ir
          JOIN RendezVous r ON r.id = ir.rdv_id
          JOIN SousTypeIntervention sti ON sti.id = ir.sous_type_id
          JOIN TypeIntervention ti ON ti.id = sti.type_intervention_id
          WHERE r.agent_id = @agent_id
          GROUP BY ti.nom
        `);

      let interventionsByType = intervs.recordset;
      if (interventionsByType.length === 0) {
        interventionsByType = [
          { label: 'Révision', value: 0 },
          { label: 'Diagnostic', value: 0 },
          { label: 'Freinage', value: 0 }
        ];
      }

      // KPIs
      const kpisResult = await pool.request()
        .input('agent_id', sql.BigInt, agentId)
        .query(`
          SELECT 
            AVG(CAST(r.feedback_note AS FLOAT)) as note_moyenne
          FROM RendezVous r
          WHERE r.agent_id = @agent_id AND r.feedback_note IS NOT NULL
        `);

      return {
        appointmentsByMonth,
        interventionsByType,
        kpi: {
          satisfaction_rate: kpisResult.recordset[0]?.note_moyenne ? Math.round((kpisResult.recordset[0].note_moyenne / 5) * 100) : 0,
          average_resolution_time: 45 // TODO
        }
      };
    } catch (error) {
      throw new Error(`Erreur statistiques: ${error.message}`);
    }
  }
}

module.exports = AgentDashboardService;
