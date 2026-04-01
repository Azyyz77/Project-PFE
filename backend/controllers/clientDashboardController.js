/**
 * CONTROLLER: Client Dashboard Controller
 */

const AgentDashboardService = require('../services/agentDashboardService');

class ClientDashboardController {

  static #forbidden(res) {
    return res.status(403).json({ error: 'Accès non autorisé' });
  }

  // ── Réclamations ───────────────────────────────────────────

  static async submitComplaint(req, res) {
    try {
      console.log('📨 submitComplaint called - req.user:', req.user);

      if (!req.user?.id) {
        console.error('❌ Missing authentication: req.user.id not found');
        return res.status(401).json({ error: 'Authentification requise' });
      }

      const { sujet, description } = req.body;
      
      console.log('📝 Complaint data received:', { sujet: sujet?.substring(0, 50), description: description?.substring(0, 50) });

      if (!sujet?.trim() || !description?.trim()) {
        console.error('❌ Validation failed: missing sujet or description');
        return res.status(400).json({ error: 'Le sujet et la description sont requis' });
      }

      const complaint = await AgentDashboardService.submitComplaint(Number(req.user.id), {
        sujet,
        description
      });

      console.log('✅ Complaint submitted successfully:', complaint.id);
      res.status(201).json({ success: true, message: 'Réclamation créée avec succès', data: complaint });
    } catch (err) {
      console.error('❌ submitComplaint controller error:', err.message, err.stack);
      const status = err.message.includes('non trouvé') ? 404 : 500;
      res.status(status).json({ error: err.message });
    }
  }

  static async getComplaints(req, res) {
    try {
      console.log('📋 getComplaints called - req.user:', req.user);

      if (!req.user?.id) {
        console.error('❌ Missing authentication: req.user.id not found');
        return res.status(401).json({ error: 'Authentification requise' });
      }

      const complaints = await AgentDashboardService.getClientComplaints(req.user.id);
      console.log(`✅ Found ${complaints.length} complaints for client ${req.user.id}`);
      res.json({ success: true, count: complaints.length, data: complaints });
    } catch (err) {
      console.error('❌ getComplaints error:', err.message, err.stack);
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = ClientDashboardController;
