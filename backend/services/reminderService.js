const sql = require('mssql');
const { getConnection } = require('../config/database');

let smsService, emailService;

try {
  smsService = require('./smsService');
  emailService = require('./emailService');
  console.log('[ReminderService] Services de notification chargés');
} catch (error) {
  console.warn('[ReminderService] Services de notification non disponibles:', error.message);
}

// Envoyer les rappels 24h avant le rendez-vous
async function send24HourReminders() {
  try {
    const pool = await getConnection();
    
    // Récupérer les RDV dans 24h qui n'ont pas encore reçu de rappel
    const result = await pool.request()
      .query(`
        SELECT 
          r.id, r.date_heure,
          c.nom, c.prenom, c.telephone, c.email,
          a.nom as agence_nom, a.adresse as agence_adresse
        FROM RendezVous r
        JOIN Utilisateur c ON c.id = r.client_id
        JOIN Agence a ON a.id = r.agence_id
        WHERE r.statut = 'CONFIRME'
          AND r.rappel_24h_sent = 0
          AND r.date_heure >= DATEADD(HOUR, 23, GETDATE())
          AND r.date_heure <= DATEADD(HOUR, 25, GETDATE())
      `);

    console.log(`[Rappels 24h] ${result.recordset.length} rappels à envoyer`);

    for (const rdv of result.recordset) {
      try {
        const dateRdv = new Date(rdv.date_heure);
        const message = `Rappel: Votre rendez-vous SAV est prévu demain le ${dateRdv.toLocaleDateString('fr-FR')} à ${dateRdv.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} à ${rdv.agence_nom}. Merci de confirmer votre présence.`;

        // Envoyer SMS
        if (rdv.telephone && smsService) {
          await smsService.sendSMS(rdv.telephone, message);
        }

        // Envoyer Email
        if (rdv.email && emailService) {
          await emailService.sendEmail(
            rdv.email,
            'Rappel de rendez-vous SAV',
            `Bonjour ${rdv.prenom} ${rdv.nom},\n\n${message}\n\nCordialement,\nL'équipe STA Chery`
          );
        }

        // Marquer comme envoyé
        await pool.request()
          .input('rdv_id', sql.BigInt, rdv.id)
          .query('UPDATE RendezVous SET rappel_24h_sent = 1 WHERE id = @rdv_id');

        console.log(`[Rappels 24h] Envoyé pour RDV #${rdv.id}`);
      } catch (error) {
        console.error(`[Rappels 24h] Erreur pour RDV #${rdv.id}:`, error);
      }
    }
  } catch (error) {
    console.error('[Rappels 24h] Erreur globale:', error);
  }
}

// Envoyer les rappels 2h avant le rendez-vous
async function send2HourReminders() {
  try {
    const pool = await getConnection();
    
    // Récupérer les RDV dans 2h qui n'ont pas encore reçu de rappel
    const result = await pool.request()
      .query(`
        SELECT 
          r.id, r.date_heure,
          c.nom, c.prenom, c.telephone, c.email,
          a.nom as agence_nom, a.adresse as agence_adresse
        FROM RendezVous r
        JOIN Utilisateur c ON c.id = r.client_id
        JOIN Agence a ON a.id = r.agence_id
        WHERE r.statut = 'CONFIRME'
          AND r.rappel_2h_sent = 0
          AND r.date_heure >= DATEADD(HOUR, 1, GETDATE())
          AND r.date_heure <= DATEADD(HOUR, 3, GETDATE())
      `);

    console.log(`[Rappels 2h] ${result.recordset.length} rappels à envoyer`);

    for (const rdv of result.recordset) {
      try {
        const dateRdv = new Date(rdv.date_heure);
        const message = `Rappel: Votre rendez-vous SAV est dans 2 heures (${dateRdv.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}) à ${rdv.agence_nom}, ${rdv.agence_adresse}. À bientôt!`;

        // Envoyer SMS
        if (rdv.telephone && smsService) {
          await smsService.sendSMS(rdv.telephone, message);
        }

        // Marquer comme envoyé
        await pool.request()
          .input('rdv_id', sql.BigInt, rdv.id)
          .query('UPDATE RendezVous SET rappel_2h_sent = 1 WHERE id = @rdv_id');

        console.log(`[Rappels 2h] Envoyé pour RDV #${rdv.id}`);
      } catch (error) {
        console.error(`[Rappels 2h] Erreur pour RDV #${rdv.id}:`, error);
      }
    }
  } catch (error) {
    console.error('[Rappels 2h] Erreur globale:', error);
  }
}

// Démarrer le service de rappels (à exécuter toutes les heures)
function startReminderService() {
  if (!smsService || !emailService) {
    console.warn('🔔 Service de rappels: Services de notification non disponibles, rappels désactivés');
    return;
  }

  console.log('🔔 Service de rappels automatiques démarré');
  
  // Exécuter immédiatement
  send24HourReminders();
  send2HourReminders();
  
  // Puis toutes les heures
  setInterval(() => {
    send24HourReminders();
    send2HourReminders();
  }, 60 * 60 * 1000); // 1 heure
}

module.exports = {
  startReminderService,
  send24HourReminders,
  send2HourReminders,
};
