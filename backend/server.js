/**
 * SERVEUR MONOLITHIQUE - STA Chery Tunisia
 *
 * Ce serveur unique regroupe toutes les fonctionnalités:
 * - Authentification et gestion des utilisateurs (/api/users)
 * - Gestion des véhicules (/api/vehicles)
 *
 * Port: 3000
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const userRoutes = require('./routes/userRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const vehicleHistoryRoutes = require('./routes/vehicleHistoryRoutes');
const vehicleValidationRoutes = require('./routes/vehicleValidationRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const appointmentFeedbackRoutes = require('./routes/appointmentFeedbackRoutes');
const interventionCatalogRoutes = require('./routes/interventionCatalogRoutes');
const agentDashboardRoutes = require('./routes/agentDashboardRoutes');
const clientDashboardRoutes = require('./routes/clientDashboardRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const adminUserRoutes = require('./routes/adminUserRoutes');
const adminOrdersRoutes = require('./routes/adminOrdersRoutes');
const adminReportsRoutes = require('./routes/adminReportsRoutes');
const adminCatalogRoutes = require('./routes/adminCatalogRoutes');
const adminMessagesRoutes = require('./routes/adminMessagesRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const statusRoutes = require('./routes/statusRoutes');
const aiAssistantRoutes = require('./routes/aiAssistantRoutes');
const packageRoutes = require('./routes/packageRoutes');
const documentRoutes = require('./routes/documentRoutes');
const timeSlotRoutes = require('./routes/timeSlotRoutes');
const promotionRoutes = require('./routes/promotionRoutes');
const attachmentRoutes = require('./routes/attachmentRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const colorRoutes = require('./routes/colorRoutes');
const planningRoutes = require('./routes/planningRoutes');
const agencyRoutes = require('./routes/agencyRoutes');
const diagnosticRoutes = require('./routes/diagnosticRoutes');
const predefinedProblemRoutes = require('./routes/predefinedProblemRoutes');
const directionStatsRoutes = require('./routes/directionStatsRoutes');
const moderationRoutes = require('./routes/moderationRoutes');
const debugRoutes = require('./routes/debugRoutes');
const workerRoutes = require('./routes/workerRoutes');
const vehiclePromotionRoutes = require('./routes/vehiclePromotionRoutes');
const appointmentHistoryRoutes = require('./routes/appointmentHistoryRoutes');
const informationRoutes = require('./routes/informationRoutes');
const repairOrderRoutes = require('./routes/repairOrderRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const { getConnection } = require('./config/database');
const { ensureVehicleValidationSchema } = require('./config/ensureVehicleValidationSchema');
const { initializeWhatsAppClient, getWhatsAppStatus } = require('./services/whatsappClient');
const { startReminderService } = require('./services/reminderService');
const chatbotRoute = require('./routes/chatbot');

const app = express();
const PORT = process.env.PORT || 3000;
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const axios = require("axios");

// Security Middlewares (Section 8 QA Report)
// 1. Helmet for HTTP header security (XSS protection, etc.)
app.use(helmet());

// 2. CORS configuration (Restricting origins to frontend domain)
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// 3. Global Rate Limiting to prevent brute-force and DDoS
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api', apiLimiter);

// 4. Stricter Rate Limiting for auth routes (brute-force credential stuffing)
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 20, // start blocking after 20 requests
  message: 'Too many login attempts from this IP, please try again after an hour'
});
app.use('/api/users/login', authLimiter);
app.use('/api/users/register', authLimiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});


// PUBLIC ROUTES (No authentication required)
// These must be registered BEFORE any auth middleware
app.use('/api/chatbot', chatbotRoute);

// Documentation Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'STA Chery - API Documentation'
}));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/vehicules', vehicleRoutes);
app.use('/api/vehicles', vehicleHistoryRoutes);
app.use('/api/agent/vehicles', vehicleValidationRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api', appointmentFeedbackRoutes); // Reverted back to '/api' so routes like /appointments/:id/feedback work correctly
app.use('/api/catalog', interventionCatalogRoutes);
app.use('/api/catalogue', interventionCatalogRoutes);
app.use('/api/agent-dashboard', agentDashboardRoutes);
app.use('/api/client-dashboard', clientDashboardRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/admin/orders', adminOrdersRoutes);
app.use('/api/admin/reports', adminReportsRoutes);
app.use('/api/admin/catalog', adminCatalogRoutes);
app.use('/api/admin/messages', adminMessagesRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin/statuses', statusRoutes);
app.use('/api/ai-assistant', aiAssistantRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/timeslots', timeSlotRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/attachments', attachmentRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/colors', colorRoutes);
app.use('/api/agent/planning', planningRoutes);
app.use('/api/admin/agencies', agencyRoutes);
app.use('/api/agent/diagnostics', diagnosticRoutes);
app.use('/api/admin/problems', predefinedProblemRoutes);
app.use('/api/direction/stats', directionStatsRoutes);
app.use('/api/moderation', moderationRoutes);
app.use('/api/debug', debugRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/vehicle-promotions', vehiclePromotionRoutes);
app.use('/api/appointments', appointmentHistoryRoutes);
app.use('/api/information', informationRoutes);
app.use('/api/repair-orders', repairOrderRoutes);
app.use('/api/invoices', invoiceRoutes);
// En haut avec les autres require
const detectRoutes = require('./routes/detectRoutes');

// Avec les autres app.use
app.use('/api/detect', detectRoutes);// Route d'accueil
app.get('/', (req, res) => {
  res.json({
    service: 'Backend Monolithique - STA Chery Tunisia',
    version: '1.0.0',
    status: 'UP',
    documentation: `http://localhost:${PORT}/api-docs`,
    endpoints: {
      health: 'GET /health',
      register: 'POST /api/users/register',
      login: 'POST /api/users/login',
      getUser: 'GET /api/users/:id (JWT requis)',
      addVehicle: 'POST /api/vehicles (JWT requis)',
      getUserVehicles: 'GET /api/vehicles/user/:userId (JWT requis)',
      getVehicle: 'GET /api/vehicles/:id (JWT requis)',
      createAppointment: 'POST /api/appointments (JWT requis)',
      myAppointments: 'GET /api/appointments/my (JWT requis)',
      appointmentSlots: 'GET /api/appointments/slots?agenceId=&date=YYYY-MM-DD (JWT requis)'
    },
    timestamp: new Date().toISOString()
  });
});

// Route de santé
app.get('/health', (req, res) => {
  res.json({
    service: 'backend-monolithique',
    status: 'UP',
    whatsapp: getWhatsAppStatus(),
    timestamp: new Date().toISOString()
  });
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    path: req.path
  });
});

// Gestion globale des erreurs
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err);
  res.status(500).json({
    error: 'Erreur interne du serveur',
    message: err.message
  });
});




// Démarrage du serveur
if (require.main === module) {
  app.listen(PORT, async () => {
    console.log(`\n🚀 Serveur monolithique démarré sur le port ${PORT}`);
    console.log(`📍 http://localhost:${PORT}`);
    console.log(`📚 Documentation: http://localhost:${PORT}/api-docs`);

    try {
      console.log('\n🔌 Connexion à la base de données...');
      await getConnection();
      await ensureVehicleValidationSchema();
      console.log('✅ Base de données connectée avec succès!\n');
    } catch (error) {
      console.error('❌ Erreur de connexion à la base de données:', error.message);
      console.error('⚠️  Le serveur démarre mais la BDD n\'est pas accessible.\n');
    }

    console.log('🟢 Initialisation de WhatsApp Web...');
    initializeWhatsAppClient();
    
    console.log('🔔 Démarrage du service de rappels automatiques...');
    startReminderService();
  });
}

module.exports = app;

// ============================================
// Configuration du modèle AI Local (node-llama-cpp)
// DÉSACTIVÉ - Utilisez Hugging Face Space à la place
// ============================================
/*
const {LlamaModel, LlamaContext, LlamaChatSession} = require("node-llama-cpp");

let aiSession = null;

async function initializeAIModel() {
  try {
    console.log('📦 Chargement du modèle GGUF...');
    
    const model = new LlamaModel({
      modelPath: path.join(__dirname, "qwen2.5-3b-instruct.Q4_K_M.gguf")
    });

    const context = new LlamaContext({model});
    aiSession = new LlamaChatSession({
      context,
      systemPrompt: "Tu es l'assistant SAV officiel de Chery Tunisie. Réponds en français ou arabe tunisien de manière professionnelle et utile."
    });

    console.log('✅ Modèle AI chargé avec succès!\n');
  } catch (error) {
    console.error('❌ Erreur lors du chargement du modèle AI:', error.message);
    console.error('⚠️  Le serveur continue sans AI locale.\n');
  }
}

// Route pour le chat AI local
app.post("/chat", async (req, res) => {
  try {
    if (!aiSession) {
      return res.status(503).json({ 
        error: 'Service AI non disponible',
        message: 'Le modèle AI n\'est pas encore chargé'
      });
    }

    const userMsg = req.body.message || req.body.question;
    
    if (!userMsg) {
      return res.status(400).json({ 
        error: 'Message requis',
        message: 'Veuillez fournir un message ou une question'
      });
    }

    console.log('[AI Local] Question:', userMsg);
    const response = await aiSession.prompt(userMsg);
    
    res.json({ 
      reponse: response,
      reply: response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[AI Local] Erreur:', error);
    res.status(500).json({ 
      error: 'Erreur AI',
      message: error.message 
    });
  }
});
*/


