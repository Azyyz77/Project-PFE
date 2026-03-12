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
            first_name: { type: 'string' },
            last_name: { type: 'string' },
            phone: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: {
              type: 'string',
              enum: ['CLIENT', 'ADMIN', 'AGENT_SAV', 'RESPONSABLE_ATELIER']
            },
            is_active: { type: 'boolean' },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        RegisterRequest: {
          type: 'object',
          required: ['first_name', 'last_name', 'phone', 'email', 'password'],
          properties: {
            first_name: { type: 'string', example: 'Ahmed' },
            last_name: { type: 'string', example: 'Ben Ali' },
            phone: { type: 'string', example: '21698765432' },
            email: { type: 'string', format: 'email', example: 'ahmed@example.com' },
            password: { type: 'string', format: 'password', example: 'password123' },
            role: {
              type: 'string',
              enum: ['CLIENT', 'ADMIN', 'AGENT_SAV', 'RESPONSABLE_ATELIER'],
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
            user_id: { type: 'integer' },
            registration_number: { type: 'string' },
            vin: { type: 'string' },
            carte_grise_code: { type: 'string' },
            brand: { type: 'string' },
            model: { type: 'string' },
            version: { type: 'string' },
            color: { type: 'string' },
            year: { type: 'integer' },
            mileage: { type: 'integer' },
            created_at: { type: 'string', format: 'date-time' }
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
      { name: 'Vehicles', description: 'Gestion des véhicules' }
    ]
  },
  apis: ['./routes/*.js', './server.js']
};

module.exports = swaggerJsdoc(options);
