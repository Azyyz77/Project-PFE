const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Créer le dossier uploads s'il n'existe pas
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuration du stockage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Générer un nom unique avec timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

// Validation des types de fichiers
const fileFilter = (req, file, cb) => {
  // Types de fichiers autorisés
  const allowedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Type de fichier non autorisé: ${file.mimetype}`), false);
  }
};

// Configuration multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
    files: 5 // Maximum 5 fichiers à la fois
  }
});

// Middleware pour gérer les erreurs multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          message: 'Fichier trop volumineux. Taille maximum: 10MB'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          message: 'Trop de fichiers. Maximum: 5 fichiers'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          message: 'Champ de fichier inattendu'
        });
      default:
        return res.status(400).json({
          success: false,
          message: 'Erreur lors de l\'upload: ' + error.message
        });
    }
  }
  
  if (error.message.includes('Type de fichier non autorisé')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  next(error);
};

// Utilitaire pour calculer la taille en MB
const calculateSizeInMB = (sizeInBytes) => {
  return Math.round((sizeInBytes / (1024 * 1024)) * 100) / 100;
};

// Utilitaire pour valider les paramètres d'entité
const validateEntityParams = (req, res, next) => {
  const { entiteType, entiteId } = req.body;
  
  if (!entiteType || !entiteId) {
    return res.status(400).json({
      success: false,
      message: 'entiteType et entiteId sont requis'
    });
  }

  // Valider les types d'entité autorisés (selon la contrainte DB)
  const allowedEntityTypes = [
    'RECLAMATION',
    'RDV'
  ];

  if (!allowedEntityTypes.includes(entiteType)) {
    return res.status(400).json({
      success: false,
      message: `Type d'entité non autorisé: ${entiteType}`
    });
  }

  next();
};

module.exports = {
  upload,
  handleMulterError,
  calculateSizeInMB,
  validateEntityParams,
  uploadsDir
};