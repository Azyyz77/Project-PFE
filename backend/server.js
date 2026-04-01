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
const appointmentRoutes = require('./routes/appointmentRoutes');
const agentDashboardRoutes = require('./routes/agentDashboardRoutes');
const clientDashboardRoutes = require('./routes/clientDashboardRoutes');
const { getConnection } = require('./config/database');
const { initializeWhatsAppClient, getWhatsAppStatus } = require('./services/whatsappClient');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Documentation Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'STA Chery - API Documentation'
}));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/agent-dashboard', agentDashboardRoutes);
app.use('/api/client-dashboard', clientDashboardRoutes);

// Route d'accueil
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
app.listen(PORT, async () => {
  console.log(`\n🚀 Serveur monolithique démarré sur le port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`📚 Documentation: http://localhost:${PORT}/api-docs`);

  try {
    console.log('\n🔌 Connexion à la base de données...');
    await getConnection();
    console.log('✅ Base de données connectée avec succès!\n');
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error.message);
    console.error('⚠️  Le serveur démarre mais la BDD n\'est pas accessible.\n');
  }

  console.log('🟢 Initialisation de WhatsApp Web...');
  initializeWhatsAppClient();
});
