/**
 * CONTROLLER: Agent Dashboard Controller (complet)
 * NOTE: Role authorization is handled by authorizeRoles middleware
 */

const AgentDashboardService = require('../services/agentDashboardService');

class AgentDashboardController {

  // ── Dashboard summary ──────────────────────────────────────
  static async getSummary(req, res) {
    try {
      const data = await AgentDashboardService.getDashboardSummary(req.user.id);
      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // ── Rendez-vous ────────────────────────────────────────────
  static async getAppointments(req, res) {
    try {
      const { statut, fromDate, toDate, agenceId } = req.query;
      const data = await AgentDashboardService.getAppointmentsList(req.user.id, {
        statut, fromDate, toDate,
        agenceId: agenceId ? parseInt(agenceId) : null
      });
      res.json({ success: true, count: data.length, data });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async confirmAppointment(req, res) {
    try {
      const data = await AgentDashboardService.confirmAppointment(
        parseInt(req.params.appointmentId), req.user.id
      );
      res.json({ success: true, message: 'Rendez-vous confirmé', data });
    } catch (err) {
      res.status(err.message.includes('non trouvé') ? 404 : 500).json({ error: err.message });
    }
  }

  static async updateAppointment(req, res) {
    try {
      const data = await AgentDashboardService.updateAppointment(
        parseInt(req.params.appointmentId), req.user.id, req.body
      );
      res.json({ success: true, message: 'Rendez-vous modifié', data });
    } catch (err) {
      res.status(err.message.includes('non trouvé') ? 404 : 500).json({ error: err.message });
    }
  }

  static async startIntervention(req, res) {
    try {
      const data = await AgentDashboardService.startIntervention(
        parseInt(req.params.appointmentId), req.user.id
      );
      res.json({ success: true, message: 'Intervention démarrée', data });
    } catch (err) {
      res.status(err.message.includes('non trouvé') ? 404 : 500).json({ error: err.message });
    }
  }

  static async finishIntervention(req, res) {
    try {
      const data = await AgentDashboardService.finishIntervention(
        parseInt(req.params.appointmentId), req.user.id, req.body
      );
      res.json({ success: true, message: 'Intervention terminée', data });
    } catch (err) {
      res.status(err.message.includes('non trouvé') ? 404 : 500).json({ error: err.message });
    }
  }

  static async cancelAppointment(req, res) {
    try {
      const data = await AgentDashboardService.cancelAppointment(
        parseInt(req.params.appointmentId), req.user.id, req.body.reason
      );
      res.json({ success: true, message: 'Rendez-vous annulé', data });
    } catch (err) {
      res.status(err.message.includes('non trouvé') ? 404 : 500).json({ error: err.message });
    }
  }

  // ── Clients ────────────────────────────────────────────────
  static async getClientProfile(req, res) {
    try {
      const data = await AgentDashboardService.getClientProfile(parseInt(req.params.clientId));
      res.json({ success: true, data });
    } catch (err) {
      res.status(err.message.includes('non trouvé') ? 404 : 500).json({ error: err.message });
    }
  }

  // ── Véhicules ──────────────────────────────────────────────
  static async getAllVehicles(req, res) {
    try {
      const data = await AgentDashboardService.getAllVehicles({ statut: req.query.statut });
      res.json({ success: true, count: data.length, data });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getVehiclesToValidate(req, res) {
    try {
      const data = await AgentDashboardService.getVehiclesToValidate();
      res.json({ success: true, count: data.length, data });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async validateVehicle(req, res) {
    try {
      const data = await AgentDashboardService.validateVehicle(
        parseInt(req.params.vehicleId), req.user.id
      );
      res.json({ success: true, message: 'Véhicule validé', data });
    } catch (err) {
      res.status(err.message.includes('non trouvé') ? 404 : 500).json({ error: err.message });
    }
  }

  static async rejectVehicle(req, res) {
    try {
      const data = await AgentDashboardService.rejectVehicle(
        parseInt(req.params.vehicleId), req.user.id, req.body.reason
      );
      res.json({ success: true, message: 'Véhicule refusé', data });
    } catch (err) {
      res.status(err.message.includes('non trouvé') ? 404 : 500).json({ error: err.message });
    }
  }

  // ── Réclamations ───────────────────────────────────────────
  static async getComplaints(req, res) {
    try {
      const data = await AgentDashboardService.getComplaints(req.user.id, req.query.statut);
      res.json({ success: true, count: data.length, data });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async answerComplaint(req, res) {
    if (!req.body.response?.trim()) {
      return res.status(400).json({ error: 'La réponse est requise' });
    }
    try {
      const data = await AgentDashboardService.answerComplaint(
        parseInt(req.params.complaintId), req.user.id, req.body.response
      );
      res.json({ success: true, message: 'Réponse ajoutée', data });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async updateComplaintStatus(req, res) {
    const validStatuts = ['SOUMISE', 'OUVERTE', 'EN_COURS', 'TRAITEE', 'RESOLUE', 'FERMEE', 'CLOTUREE'];
    if (!validStatuts.includes(req.body.statut)) {
      return res.status(400).json({ error: `Statut invalide. Valeurs: ${validStatuts.join(', ')}` });
    }
    try {
      const data = await AgentDashboardService.updateComplaintStatus(
        parseInt(req.params.complaintId), req.body.statut
      );
      res.json({ success: true, message: `Statut mis à jour: ${req.body.statut}`, data });
    } catch (err) {
      res.status(err.message.includes('non trouvée') ? 404 : 500).json({ error: err.message });
    }
  }

  static async resolveComplaint(req, res) {
    try {
      const data = await AgentDashboardService.resolveComplaint(parseInt(req.params.complaintId));
      res.json({ success: true, message: 'Réclamation résolue', data });
    } catch (err) {
      res.status(err.message.includes('non trouvée') ? 404 : 500).json({ error: err.message });
    }
  }

  // ── Notifications ──────────────────────────────────────────
  static async getNotifications(req, res) {
    try {
      const data = await AgentDashboardService.getNotifications(req.user.id);
      res.json({ success: true, count: data.length, data });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async markNotificationRead(req, res) {
    try {
      const data = await AgentDashboardService.markNotificationRead(
        parseInt(req.params.notifId), req.user.id
      );
      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async markAllNotificationsRead(req, res) {
    try {
      const data = await AgentDashboardService.markAllNotificationsRead(req.user.id);
      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // ── Statistiques ───────────────────────────────────────────
  static async getStatistics(req, res) {
    try {
      const data = await AgentDashboardService.getMonthlyStatistics(req.user.id);
      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = AgentDashboardController;
