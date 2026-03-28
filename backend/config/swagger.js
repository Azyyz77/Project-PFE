const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'STA Chery Tunisia - API',
      version: '1.0.0',
      description: 'API monolithique pour le système SAV - Authentification et Véhicules',
      contact: {
        name: 'Dali - PFE 2026',
        email: 'contact@sta-chery.tn'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Serveur de développement'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            prenom: { type: 'string' },
            nom: { type: 'string' },
            telephone: { type: 'string' },
            email: { type: 'string', format: 'email' },
            type_utilisateur: {
              type: 'string',
              enum: ['CLIENT', 'AGENT', 'ADMIN', 'DIRECTION']
            },
            actif: { type: 'boolean' },
            date_creation: { type: 'string', format: 'date-time' }
          }
        },
        RegisterRequest: {
          type: 'object',
          required: ['prenom', 'nom', 'telephone', 'email', 'password'],
          properties: {
            prenom: { type: 'string', example: 'Ahmed' },
            nom: { type: 'string', example: 'Ben Ali' },
            telephone: { type: 'string', example: '+21698765432' },
            email: { type: 'string', format: 'email', example: 'ahmed@example.com' },
            password: { type: 'string', format: 'password', example: 'password123' },
            type_utilisateur: {
              type: 'string',
              enum: ['CLIENT', 'AGENT', 'ADMIN', 'DIRECTION'],
              default: 'CLIENT'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'ahmed@example.com' },
            password: { type: 'string', format: 'password', example: 'password123' }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            token: { type: 'string' },
            user: { $ref: '#/components/schemas/User' }
          }
        },
        Vehicle: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            client_id: { type: 'integer' },
            version_id: { type: 'integer' },
            immatriculation: { type: 'string', maxLength: 20 },
            numero_chassis: { type: 'string', maxLength: 17 },
            couleur: { type: 'string', maxLength: 50 },
            annee: { type: 'integer' },
            date_ajout: { type: 'string', format: 'date-time' },
            marque_nom: { type: 'string' },
            modele_nom: { type: 'string' },
            version_nom: { type: 'string' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    },
    tags: [
      { name: 'Authentication', description: 'Inscription et connexion' },
      { name: 'Users', description: 'Gestion des utilisateurs' },
      { name: 'Vehicles', description: 'Gestion des véhicules' },
      { name: 'Appointments', description: 'Gestion des rendez-vous SAV' }
    ]
  },
  apis: ['./routes/*.js', './server.js']
};

module.exports = swaggerJsdoc(options);
