/**
 * @fileoverview Contrôleur pour la gestion des utilisateurs
 * Gère l'authentification, l'inscription, la réinitialisation de mot de passe
 * et la mise à jour des profils utilisateurs
 * 
 * @module controllers/userController
 * @requires bcryptjs - Hachage des mots de passe
 * @requires jsonwebtoken - Génération et vérification des tokens JWT
 * @requires ../config/database - Connexion à la base de données SQL Server
 * @requires ../services/whatsappClient - Envoi de messages WhatsApp (OTP)
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getConnection, sql } = require('../config/database');
const { sendWhatsAppMessage } = require('../services/whatsappClient');

/**
 * Stockage temporaire des codes OTP
 * Structure: Map<email, { otp, expiry, userId, telephone }>
 * @type {Map<string, {otp: string, expiry: number, userId: number, telephone: string}>}
 */
const otpStore = new Map();

/**
 * Formate un numéro de téléphone au format E.164 international
 * Ajoute automatiquement le code pays tunisien (+216) si nécessaire
 * 
 * @param {string} telephone - Numéro de téléphone à formater
 * @returns {string} Numéro formaté au format E.164 (ex: +21612345678)
 * 
 * @example
 * formatToE164('24770580')      // '+21624770580'
 * formatToE164('024770580')     // '+21624770580'
 * formatToE164('+21624770580')  // '+21624770580'
 */
const formatToE164 = (telephone) => {
  if (!telephone) return '';
  const raw = String(telephone).replace(/\s+/g, '');
  if (raw.startsWith('+')) return raw;

  // Ajouter le code pays tunisien par défaut
  if (/^0\d+$/.test(raw)) return `+216${raw.slice(1)}`;
  if (/^\d+$/.test(raw)) return `+216${raw}`;
  return raw;
};

/**
 * Vérifie si un numéro de téléphone est au format E.164 valide
 * Format: +[code pays][numéro] (8-15 chiffres après le +)
 * 
 * @param {string} telephone - Numéro à vérifier
 * @returns {boolean} true si le format est valide
 * 
 * @example
 * isValidE164('+21624770580')  // true
 * isValidE164('24770580')      // false
 * isValidE164('+1234')         // false (trop court)
 */
const isValidE164 = (telephone) => /^\+[1-9]\d{7,14}$/.test(telephone);

/**
 * Inscription d'un nouvel utilisateur
 * 
 * Processus:
 * 1. Validation des champs requis
 * 2. Validation du format email
 * 3. Normalisation et validation du téléphone
 * 4. Vérification du rôle
 * 5. Vérification de l'unicité de l'email
 * 6. Récupération de l'ID du rôle depuis la table Role
 * 7. Hachage du mot de passe (bcrypt, 10 rounds)
 * 8. Insertion en base de données
 * 
 * @async
 * @param {Object} req - Requête Express
 * @param {Object} req.body - Corps de la requête
 * @param {string} req.body.prenom - Prénom de l'utilisateur
 * @param {string} req.body.nom - Nom de l'utilisateur
 * @param {string} req.body.telephone - Numéro de téléphone
 * @param {string} req.body.email - Adresse email
 * @param {string} req.body.password - Mot de passe (min 8 caractères)
 * @param {string} [req.body.role='CLIENT'] - Rôle (CLIENT, AGENT, ADMIN, DIRECTION)
 * @param {Object} res - Réponse Express
 * 
 * @returns {Promise<void>}
 * @throws {400} Champs manquants ou invalides
 * @throws {409} Email déjà utilisé
 * @throws {500} Erreur serveur ou rôle introuvable
 * 
 * @example
 * POST /api/users/register
 * {
 *   "prenom": "Ahmed",
 *   "nom": "Ben Ali",
 *   "telephone": "+21624770580",
 *   "email": "ahmed@example.com",
 *   "password": "password123",
 *   "role": "CLIENT"
 * }
 * 
 * Response 201:
 * {
 *   "message": "Utilisateur créé avec succès",
 *   "user": {
 *     "id": 1,
 *     "prenom": "Ahmed",
 *     "nom": "Ben Ali",
 *     "email": "ahmed@example.com",
 *     "telephone": "+21624770580",
 *     "role": "CLIENT",
 *     "actif": true,
 *     "date_creation": "2024-01-15T10:30:00.000Z"
 *   }
 * }
 */
const register = async (req, res) => {
  try {
    const { prenom, nom, telephone, email, password, role } = req.body;

    // Validation des champs requis
    if (!prenom || !nom || !telephone || !email || !password) {
      return res.status(400).json({
        error: 'Tous les champs sont obligatoires',
        required: ['prenom', 'nom', 'telephone', 'email', 'password']
      });
    }

    // Validation du format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Format email invalide' });
    }

    // Normalisation et validation du téléphone
    const normalizedPhone = formatToE164(telephone);
    if (!isValidE164(normalizedPhone)) {
      return res.status(400).json({
        error: 'Numéro de téléphone invalide. Utilisez un format international, ex: +21624770580',
      });
    }

    // Validation du rôle
    const typeUtilisateur = role || 'CLIENT';
    const validTypes = ['CLIENT', 'AGENT', 'ADMIN', 'DIRECTION'];
    if (!validTypes.includes(typeUtilisateur)) {
      return res.status(400).json({ error: 'Type utilisateur invalide', validTypes });
    }

    const pool = await getConnection();

    // Vérifier si l'email existe déjà
    const checkEmailResult = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT id FROM Utilisateur WHERE email = @email');

    if (checkEmailResult.recordset.length > 0) {
      return res.status(409).json({ error: 'Cet email est déjà utilisé' });
    }

    // Vérifier si le numéro de téléphone existe déjà
    const checkPhoneResult = await pool.request()
      .input('telephone', sql.NVarChar, normalizedPhone)
      .query('SELECT id FROM Utilisateur WHERE telephone = @telephone');

    if (checkPhoneResult.recordset.length > 0) {
      return res.status(409).json({ error: 'Ce numéro de téléphone est déjà utilisé' });
    }

    // SQL (SELECT): récupérer l'identifiant du rôle depuis la table Role.
    // Paramètre: @rolenom. Résultat attendu: une ligne contenant l'id du rôle.
    const roleResult = await pool.request()
      .input('rolenom', sql.NVarChar, typeUtilisateur)
      .query('SELECT id FROM Role WHERE nom = @rolenom');

    if (roleResult.recordset.length === 0) {
      return res.status(500).json({ error: 'Rôle introuvable en base' });
    }
    const role_id = roleResult.recordset[0].id;

    const mot_de_passe = await bcrypt.hash(password, 10);

    const insertQuery = `
      INSERT INTO Utilisateur (nom, prenom, telephone, email, mot_de_passe, actif, date_creation, role_id)
      OUTPUT INSERTED.id, INSERTED.nom, INSERTED.prenom, INSERTED.email,
             INSERTED.telephone, INSERTED.actif, INSERTED.date_creation
      VALUES (@nom, @prenom, @telephone, @email, @mot_de_passe, 1, GETDATE(), @role_id)
    `;

    // SQL (INSERT ... OUTPUT): créer l'utilisateur puis retourner la ligne insérée.
    // Paramètres: @nom, @prenom, @telephone, @email, @mot_de_passe, @role_id.
    const result = await pool.request()
      .input('nom', sql.NVarChar, nom)
      .input('prenom', sql.NVarChar, prenom)
      .input('telephone', sql.NVarChar, normalizedPhone)
      .input('email', sql.NVarChar, email)
      .input('mot_de_passe', sql.NVarChar, mot_de_passe)
      .input('role_id', sql.BigInt, role_id)
      .query(insertQuery);

    const newUser = result.recordset[0];

    // Générer un OTP pour vérifier le téléphone
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Stocker l'OTP
    otpStore.set(`verify_${newUser.id}`, {
      otp,
      expiry,
      userId: newUser.id,
      telephone: normalizedPhone,
    });

    // Envoyer le code par WhatsApp
    try {
      await sendWhatsAppMessage(
        normalizedPhone,
        `STA Chery Tunisia\nBienvenue! Votre code de vérification est: ${otp}\nCe code expire dans 10 minutes.`
      );
    } catch (whatsappError) {
      console.error('Erreur envoi WhatsApp:', whatsappError);
      // On continue même si WhatsApp échoue
    }

    res.status(201).json({
      message: 'Utilisateur créé avec succès. Un code de vérification a été envoyé par WhatsApp.',
      user: {
        id: newUser.id,
        prenom: newUser.prenom,
        nom: newUser.nom,
        email: newUser.email,
        telephone: newUser.telephone,
        role: typeUtilisateur,
        actif: newUser.actif,
        telephone_verifie: false,
        date_creation: newUser.date_creation
      },
      verification_required: true
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({ error: 'Erreur lors de l\'inscription', message: error.message });
  }
};

/**
 * Authentifie un utilisateur et retourne un JWT.
 *
 * Étapes:
 * 1. Vérifier la présence de l'email et du mot de passe.
 * 2. Récupérer l'utilisateur (avec rôle) depuis la base.
 * 3. Vérifier l'existence du compte et son statut actif.
 * 4. Vérifier le mot de passe avec bcrypt.
 * 5. Générer un token JWT contenant id, email et rôle.
 * 6. Retourner le token et les informations utilisateur.
 *
 * @async
 * @param {Object} req - Requête Express
 * @param {Object} req.body - Corps de requête
 * @param {string} req.body.email - Email de connexion
 * @param {string} req.body.password - Mot de passe en clair
 * @param {Object} res - Réponse Express
 * @returns {Promise<void>}
 * @throws {400} Email ou mot de passe manquant
 * @throws {401} Identifiants incorrects
 * @throws {403} Compte désactivé
 * @throws {500} Erreur serveur
 */
const login = async (req, res) => {
  try {
    // Extraire les informations de connexion.
    const { email, password } = req.body;

    // Vérifier les champs obligatoires.
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    // Ouvrir une connexion à la base de données.
    const pool = await getConnection();

    // Récupérer l'utilisateur avec son rôle (fallback CLIENT si rôle null).
    // SQL (SELECT + LEFT JOIN): lire les données de connexion et le rôle par email.
    // Paramètre: @email. Résultat attendu: 0 ou 1 utilisateur.
    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query(`
        SELECT u.id, u.prenom, u.nom, u.email, u.telephone, u.mot_de_passe,
               u.actif, u.date_creation, u.role_id, u.telephone_verifie,
               ISNULL(r.nom, 'CLIENT') AS role_nom
        FROM Utilisateur u
        LEFT JOIN Role r ON r.id = u.role_id
        WHERE u.email = @email
      `);

    // Aucun compte trouvé pour cet email.
    if (result.recordset.length === 0) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    // Extraire l'utilisateur trouvé.
    const user = result.recordset[0];

    // Bloquer la connexion si le compte est désactivé.
    if (!user.actif) {
      return res.status(403).json({ error: 'Compte désactivé. Contactez l\'administrateur.' });
    }

    // Comparer le mot de passe fourni avec le hash stocké.
    const isPasswordValid = await bcrypt.compare(password, user.mot_de_passe);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    // Générer un JWT signé pour l'authentification côté client.
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role_nom,
        telephone_verifie: user.telephone_verifie || false
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Retourner le token et le profil utilisateur.
    res.json({
      message: 'Connexion réussie',
      token,
      user: {
        id: user.id,
        prenom: user.prenom,
        nom: user.nom,
        email: user.email,
        telephone: user.telephone,
        role: user.role_nom,
        telephone_verifie: user.telephone_verifie || false,
        date_creation: user.date_creation
      }
    });
  } catch (error) {
    // Journaliser l'erreur côté serveur.
    console.error('Erreur lors de la connexion:', error);

    // Retourner une erreur interne.
    res.status(500).json({ error: 'Erreur lors de la connexion', message: error.message });
  }
};
/**
 * Récupère les informations d'un utilisateur à partir de son identifiant.
 *
 * Cette route retourne les données de profil non sensibles (aucun mot de passe),
 * ainsi que le nom du rôle associé à l'utilisateur.
 *
 * Étapes:
 * 1. Lire l'identifiant depuis les paramètres de route.
 * 2. Interroger la base en joignant Utilisateur et Role.
 * 3. Retourner 404 si l'utilisateur n'existe pas.
 * 4. Retourner l'objet utilisateur si trouvé.
 *
 * @async
 * @param {Object} req - Requête Express
 * @param {Object} req.params - Paramètres de route
 * @param {string|number} req.params.id - ID de l'utilisateur
 * @param {Object} res - Réponse Express
 * @returns {Promise<void>}
 * @throws {404} Utilisateur non trouvé
 * @throws {500} Erreur serveur lors de la récupération
 */
const getUserById = async (req, res) => {
  try {
    // Extraire l'identifiant de l'utilisateur depuis l'URL (ex: /users/:id).
    const { id } = req.params;

    // Obtenir une connexion SQL active vers la base de données.
    const pool = await getConnection();

    // Préparer et exécuter la requête paramétrée pour éviter l'injection SQL.
    // La jointure avec Role permet de renvoyer le nom du rôle (role_nom).
    // SQL (SELECT + JOIN): récupérer le profil utilisateur par id avec le nom du rôle.
    // Paramètre: @id. Résultat attendu: 0 ou 1 ligne.
    const result = await pool.request()
      .input('id', sql.BigInt, id)
      .query(`
        SELECT u.id, u.prenom, u.nom, u.email, u.telephone, u.actif, u.date_creation,
               r.nom AS role_nom
        FROM Utilisateur u
        JOIN Role r ON r.id = u.role_id
        WHERE u.id = @id
      `);

    // Vérifier si la requête a retourné au moins une ligne.
    if (result.recordset.length === 0) {
      // Retourner une erreur 404 si l'utilisateur demandé est introuvable.
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Retourner l'utilisateur trouvé (sans mot de passe dans la sélection SQL).
    res.json({ user: result.recordset[0] });
  } catch (error) {
    // Journaliser l'erreur côté serveur pour faciliter le diagnostic.
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);

    // Retourner une réponse générique 500 côté API.
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'utilisateur', message: error.message });
  }
};
/**
 * Étape 1 du processus de réinitialisation de mot de passe.
 *
 * Processus global de reset en 3 étapes:
 * 1. forgotPassword: l'utilisateur envoie son email, un OTP est généré et envoyé via WhatsApp.
 * 2. verifyOtp: l'utilisateur valide l'OTP reçu, un resetToken est généré.
 * 3. resetPassword: l'utilisateur envoie resetToken + nouveau mot de passe.
 *
 * Bonnes pratiques appliquées ici:
 * - Réponse générique quand l'email n'existe pas (évite l'énumération des comptes).
 * - OTP temporaire stocké en mémoire avec date d'expiration.
 * - Envoi du code via WhatsApp vers le numéro associé au compte.
 *
 * @async
 * @param {Object} req - Requête Express
 * @param {Object} req.body - Corps de requête
 * @param {string} req.body.email - Email du compte
 * @param {Object} res - Réponse Express
 * @returns {Promise<void>}
 * @throws {400} Email manquant ou WhatsApp non prêt (QR code requis)
 * @throws {500} Erreur serveur
 */
const forgotPassword = async (req, res) => {
  // Démarrer l'étape 1: génération et envoi d'un OTP de vérification.
  try {
    // Lire l'email saisi par l'utilisateur depuis le corps de la requête.
    const { email } = req.body;

    // Refuser la requête si l'email est absent.
    if (!email) return res.status(400).json({ error: 'Email requis' });

    // Ouvrir une connexion SQL.
    const pool = await getConnection();

    // Rechercher l'utilisateur actif correspondant à l'email.
    // On récupère l'id et le téléphone pour envoyer l'OTP.
    // SQL (SELECT): filtrer par email et actif=1 pour autoriser le flux OTP.
    const result = await pool
      .request()
      .input('email', sql.NVarChar, email)
      .query('SELECT id, telephone FROM Utilisateur WHERE email = @email AND actif = 1');

    // Si l'email n'est pas trouvé, répondre de façon neutre pour ne rien divulguer.
    if (result.recordset.length === 0) {
      return res.json({ message: 'Si cet email existe, un code de vérification WhatsApp a été envoyé au numéro associé.' });
    }

    // Récupérer la première ligne de résultat (utilisateur trouvé).
    const user = result.recordset[0];

    // Normaliser le numéro de téléphone en format E.164.
    const phone = formatToE164(user.telephone);

    // Générer un OTP aléatoire à 6 chiffres.
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Définir l'expiration de l'OTP à 10 minutes à partir de maintenant.
    const expiry = Date.now() + 10 * 60 * 1000;

    // Enregistrer l'OTP en mémoire, indexé par email.
    // Données stockées: code, expiration, identifiant utilisateur, téléphone.
    otpStore.set(email, {
      otp,
      expiry,
      userId: user.id,
      telephone: phone,
    });

    // Envoyer le code OTP par WhatsApp au numéro associé au compte.
    await sendWhatsAppMessage(
      phone,
      `STA Chery Tunisia\nVotre code de verification est: ${otp}\nCe code expire dans 10 minutes.`
    );

    // Retourner une réponse (toujours générique) avec un indice de téléphone masqué.
    res.json({
      message: 'Si cet email existe, un code de vérification WhatsApp a été envoyé au numéro associé.',
      telephone_hint: user.telephone
        ? `***${user.telephone.slice(-3)}`
        : undefined,
    });
  } catch (error) {
    // Gérer explicitement le cas où WhatsApp Web n'est pas initialisé (QR non scanné).
    if (String(error.message || '').toLowerCase().includes('qr code')) {
      return res.status(400).json({
        error: 'WhatsApp Web n\'est pas prêt. Scannez le QR code affiché dans le terminal backend.',
      });
    }

    // Journaliser l'erreur côté serveur.
    console.error('Erreur forgotPassword:', error);

    // Retourner une erreur interne côté API.
    res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
};

/**
 * Étape 2 du processus de réinitialisation de mot de passe.
 *
 * Cette fonction valide le code OTP envoyé via WhatsApp.
 * Si la vérification réussit, elle génère un token temporaire
 * dédié à la réinitialisation du mot de passe.
 *
 * @async
 * @param {Object} req - Requête Express
 * @param {Object} req.body - Corps de requête
 * @param {string} req.body.email - Email de l'utilisateur
 * @param {string|number} req.body.otp - Code OTP reçu
 * @param {Object} res - Réponse Express
 * @returns {Promise<void>}
 * @throws {400} Données invalides, OTP absent/invalide/expiré
 * @throws {500} Erreur serveur
 */
const verifyOtp = async (req, res) => {
  try {
    // Lire l'email et le code OTP fournis par l'utilisateur.
    const { email, otp } = req.body;

    // Exiger les deux champs pour continuer.
    if (!email || !otp) return res.status(400).json({ error: 'Email et OTP requis' });

    // Vérifier que l'utilisateur actif existe toujours en base.
    const pool = await getConnection();
    // SQL (SELECT): relire l'utilisateur actif par email avant de valider l'OTP.
    const result = await pool
      .request()
      .input('email', sql.NVarChar, email)
      .query('SELECT id, telephone FROM Utilisateur WHERE email = @email AND actif = 1');

    // Refuser si aucun utilisateur actif ne correspond à cet email.
    if (result.recordset.length === 0) {
      return res.status(400).json({ error: 'Aucun utilisateur actif trouvé pour cet email' });
    }

    // Récupérer l'utilisateur et l'OTP stocké en mémoire.
    const user = result.recordset[0];
    const stored = otpStore.get(email);

    // Aucun OTP n'a été demandé pour cet email.
    if (!stored) {
      return res.status(400).json({ error: 'Aucun code OTP demandé pour cet email' });
    }

    // Invalider un OTP expiré puis demander de recommencer.
    if (Date.now() > stored.expiry) {
      otpStore.delete(email);
      return res.status(400).json({ error: 'Code OTP expiré. Veuillez recommencer.' });
    }

    // Vérifier que l'OTP correspond au bon utilisateur et à la bonne valeur.
    if (stored.userId !== user.id || stored.otp !== String(otp)) {
      return res.status(400).json({ error: 'Code OTP incorrect ou expiré' });
    }

    // Générer un token court (15 min) autorisé uniquement pour reset_password.
    const resetToken = jwt.sign(
      { userId: user.id, email, purpose: 'reset_password' },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    // Supprimer l'OTP pour empêcher toute réutilisation.
    otpStore.delete(email);

    // Retourner le token de réinitialisation au client.
    res.json({ message: 'OTP vérifié avec succès', resetToken });
  } catch (error) {
    // Logger l'erreur pour investigation.
    console.error('Erreur verifyOtp:', error);

    // Retourner une erreur interne standard.
    res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
};

/**
 * Étape 3 du processus de réinitialisation de mot de passe.
 *
 * Cette fonction valide le resetToken émis après OTP, vérifie le nouveau
 * mot de passe puis enregistre son hash en base de données.
 *
 * @async
 * @param {Object} req - Requête Express
 * @param {Object} req.body - Corps de requête
 * @param {string} req.body.resetToken - Token de réinitialisation
 * @param {string} req.body.newPassword - Nouveau mot de passe
 * @param {Object} res - Réponse Express
 * @returns {Promise<void>}
 * @throws {400} Données manquantes, token invalide, mot de passe trop court
 * @throws {500} Erreur serveur
 */
const resetPassword = async (req, res) => {
  try {
    // Lire le token de reset et le nouveau mot de passe.
    const { resetToken, newPassword } = req.body;

    // Exiger les deux champs obligatoires.
    if (!resetToken || !newPassword)
      return res.status(400).json({ error: 'Token et nouveau mot de passe requis' });

    // Imposer une politique minimale de longueur.
    if (newPassword.length < 8)
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 8 caractères' });

    // Vérifier et décoder le token JWT de réinitialisation.
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch {
      return res.status(400).json({ error: 'Token de réinitialisation invalide ou expiré' });
    }

    // Vérifier l'usage prévu du token (protection contre mauvaise réutilisation).
    if (decoded.purpose !== 'reset_password') {
      return res.status(400).json({ error: 'Token invalide' });
    }

    // Hacher le nouveau mot de passe avant stockage.
    const hashed = await bcrypt.hash(newPassword, 10);

    // Mettre à jour le mot de passe en base pour l'utilisateur concerné.
    const pool = await getConnection();
    // SQL (UPDATE): remplacer le hash du mot de passe pour l'id ciblé.
    // Paramètres: @id (utilisateur), @mot_de_passe (nouveau hash).
    await pool
      .request()
      .input('id', sql.BigInt, decoded.userId)
      .input('mot_de_passe', sql.NVarChar, hashed)
      .query('UPDATE Utilisateur SET mot_de_passe = @mot_de_passe WHERE id = @id');

    // Confirmer la réussite de la réinitialisation.
    res.json({ message: 'Mot de passe réinitialisé avec succès' });
  } catch (error) {
    // Logger côté serveur.
    console.error('Erreur resetPassword:', error);

    // Retourner une erreur interne.
    res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
};

/**
 * Met à jour les informations de profil d'un utilisateur.
 *
 * Règles métier:
 * - Un utilisateur ne peut modifier que son propre profil.
 * - Les champs prenom, nom et telephone sont obligatoires.
 * - Le téléphone doit être valide au format E.164.
 * - Pour un CLIENT, au moins un véhicule doit être validé avant finalisation.
 *
 * @async
 * @param {Object} req - Requête Express
 * @param {Object} req.params - Paramètres de route
 * @param {string|number} req.params.id - ID utilisateur ciblé
 * @param {Object} req.user - Utilisateur authentifié (injecté par middleware)
 * @param {Object} req.body - Données de profil
 * @param {string} req.body.prenom - Nouveau prénom
 * @param {string} req.body.nom - Nouveau nom
 * @param {string} req.body.telephone - Nouveau téléphone
 * @param {Object} res - Réponse Express
 * @returns {Promise<void>}
 * @throws {400} Données invalides
 * @throws {403} Non autorisé ou prérequis métier non respecté
 * @throws {500} Erreur serveur
 */
const updateProfile = async (req, res) => {
  try {
    // Lire l'identifiant cible du profil.
    const { id } = req.params;

    // Empêcher un utilisateur de modifier le profil d'un autre utilisateur.
    if (String(req.user.id) !== String(id)) {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    // Lire les champs modifiables du profil.
    const { prenom, nom, telephone } = req.body;

    // Vérifier les champs obligatoires.
    if (!prenom || !nom || !telephone) {
      return res.status(400).json({ error: 'Prénom, nom et téléphone sont requis' });
    }

    // Normaliser et valider le numéro de téléphone.
    const normalizedPhone = formatToE164(telephone);
    if (!isValidE164(normalizedPhone)) {
      return res.status(400).json({
        error: 'Numéro de téléphone invalide. Utilisez un format international, ex: +21624770580',
      });
    }

    // Ouvrir la connexion à la base.
    const pool = await getConnection();

    // Appliquer la règle métier spécifique aux clients.
    if (req.user.role === 'CLIENT') {
      // SQL (SELECT COUNT): compter les véhicules validés du client.
      // Paramètre: @id. Résultat attendu: validated_count >= 0.
      const validatedVehicleResult = await pool
        .request()
        .input('id', sql.BigInt, id)
        .query(`
          SELECT COUNT(*) AS validated_count
          FROM Vehicule
          WHERE client_id = @id
            AND statut_validation = 'VALIDE'
        `);

      // Lire le nombre de véhicules validés (0 par défaut).
      const validatedCount = validatedVehicleResult.recordset[0]?.validated_count || 0;

      // Bloquer la finalisation du profil si aucun véhicule n'est validé.
      if (validatedCount === 0) {
        return res.status(403).json({
          error: 'Validation véhicule requise',
          message: 'Votre profil ne peut être complété qu\'après validation de votre véhicule par un agent SAV.'
        });
      }
    }

    // Mettre à jour le profil puis relire l'utilisateur mis à jour en une seule requête.
    // SQL (UPDATE puis SELECT):
    // 1) mettre à jour prenom/nom/telephone dans Utilisateur;
    // 2) relire la ligne mise à jour avec le rôle pour la réponse API.
    const result = await pool
      .request()
      .input('id', sql.BigInt, id)
      .input('prenom', sql.NVarChar, prenom)
      .input('nom', sql.NVarChar, nom)
      .input('telephone', sql.NVarChar, normalizedPhone)
      .query(`
        UPDATE Utilisateur SET prenom = @prenom, nom = @nom, telephone = @telephone WHERE id = @id;
        SELECT u.id, u.prenom, u.nom, u.email, u.telephone, u.actif, u.date_creation, r.nom AS role_nom
        FROM Utilisateur u
        LEFT JOIN Role r ON r.id = u.role_id
        WHERE u.id = @id
      `);

    // Retourner le profil actualisé.
    res.json({ message: 'Profil mis à jour avec succès', user: result.recordsets[1][0] });
  } catch (error) {
    // Logger l'erreur serveur.
    console.error('Erreur updateProfile:', error);

    // Réponse d'erreur interne standard.
    res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
};

/**
 * Permet à un utilisateur connecté de changer son mot de passe.
 *
 * Étapes:
 * 1. Vérifier que l'utilisateur agit sur son propre compte.
 * 2. Vérifier présence/validité des mots de passe.
 * 3. Vérifier le mot de passe actuel.
 * 4. Hacher et enregistrer le nouveau mot de passe.
 *
 * @async
 * @param {Object} req - Requête Express
 * @param {Object} req.params - Paramètres de route
 * @param {string|number} req.params.id - ID utilisateur
 * @param {Object} req.user - Utilisateur authentifié
 * @param {Object} req.body - Corps de requête
 * @param {string} req.body.currentPassword - Mot de passe actuel
 * @param {string} req.body.newPassword - Nouveau mot de passe
 * @param {Object} res - Réponse Express
 * @returns {Promise<void>}
 * @throws {400} Données invalides ou mot de passe actuel incorrect
 * @throws {403} Non autorisé
 * @throws {404} Utilisateur introuvable
 * @throws {500} Erreur serveur
 */
const changePassword = async (req, res) => {
  try {
    // Extraire l'ID utilisateur cible.
    const { id } = req.params;

    // Interdire la modification du mot de passe d'un autre utilisateur.
    if (String(req.user.id) !== String(id)) {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    // Lire les mots de passe envoyé par le client.
    const { currentPassword, newPassword } = req.body;

    // Exiger les champs obligatoires.
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Mot de passe actuel et nouveau mot de passe requis' });
    }

    // Vérifier la politique minimale sur le nouveau mot de passe.
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Le nouveau mot de passe doit contenir au moins 8 caractères' });
    }

    // Charger le hash actuel depuis la base.
    const pool = await getConnection();
    // SQL (SELECT): lire le hash actuel pour valider currentPassword.
    const result = await pool
      .request()
      .input('id', sql.BigInt, id)
      .query('SELECT mot_de_passe FROM Utilisateur WHERE id = @id');

    // Retourner 404 si le compte n'existe pas.
    if (result.recordset.length === 0)
      return res.status(404).json({ error: 'Utilisateur non trouvé' });

    // Comparer le mot de passe actuel saisi avec le hash stocké.
    const isValid = await bcrypt.compare(currentPassword, result.recordset[0].mot_de_passe);
    if (!isValid) return res.status(400).json({ error: 'Mot de passe actuel incorrect' });

    // Hacher le nouveau mot de passe puis sauvegarder en base.
    const hashed = await bcrypt.hash(newPassword, 10);
    // SQL (UPDATE): enregistrer le nouveau hash du mot de passe.
    await pool
      .request()
      .input('id', sql.BigInt, id)
      .input('mot_de_passe', sql.NVarChar, hashed)
      .query('UPDATE Utilisateur SET mot_de_passe = @mot_de_passe WHERE id = @id');

    // Confirmer la mise à jour au client.
    res.json({ message: 'Mot de passe modifié avec succès' });
  } catch (error) {
    // Logger l'erreur.
    console.error('Erreur changePassword:', error);

    // Retourner une erreur interne standard.
    res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
};

/**
 * Renvoyer un code OTP pour vérifier le téléphone
 */
const resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email requis' });
    }

    const pool = await getConnection();
    
    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT id, telephone, telephone_verifie FROM Utilisateur WHERE email = @email AND actif = 1');

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const user = result.recordset[0];

    if (user.telephone_verifie) {
      return res.status(400).json({ error: 'Téléphone déjà vérifié' });
    }

    // Générer un nouvel OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 10 * 60 * 1000;

    otpStore.set(`verify_${user.id}`, {
      otp,
      expiry,
      userId: user.id,
      telephone: user.telephone,
    });

    // Envoyer par WhatsApp
    await sendWhatsAppMessage(
      user.telephone,
      `STA Chery Tunisia\nVotre nouveau code de vérification est: ${otp}\nCe code expire dans 10 minutes.`
    );

    res.json({
      message: 'Code de vérification renvoyé par WhatsApp',
      telephone_hint: user.telephone ? `***${user.telephone.slice(-3)}` : undefined,
    });
  } catch (error) {
    console.error('Erreur resendVerificationCode:', error);
    res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
};

/**
 * Vérifier le code OTP du téléphone
 */
const verifyPhoneNumber = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email et code OTP requis' });
    }

    const pool = await getConnection();
    
    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT id, telephone_verifie FROM Utilisateur WHERE email = @email AND actif = 1');

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const user = result.recordset[0];

    if (user.telephone_verifie) {
      return res.status(400).json({ error: 'Téléphone déjà vérifié' });
    }

    // Récupérer l'OTP stocké
    const stored = otpStore.get(`verify_${user.id}`);

    if (!stored) {
      return res.status(400).json({ error: 'Aucun code de vérification trouvé. Veuillez demander un nouveau code.' });
    }

    // Vérifier l'expiration
    if (Date.now() > stored.expiry) {
      otpStore.delete(`verify_${user.id}`);
      return res.status(400).json({ error: 'Code OTP expiré. Veuillez demander un nouveau code.' });
    }

    // Vérifier le code
    if (stored.otp !== String(otp)) {
      return res.status(400).json({ error: 'Code OTP incorrect' });
    }

    // Marquer le téléphone comme vérifié
    await pool.request()
      .input('id', sql.BigInt, user.id)
      .query('UPDATE Utilisateur SET telephone_verifie = 1 WHERE id = @id');

    // Supprimer l'OTP
    otpStore.delete(`verify_${user.id}`);

    res.json({ 
      message: 'Téléphone vérifié avec succès! Vous pouvez maintenant prendre des rendez-vous.',
      verified: true
    });
  } catch (error) {
    console.error('Erreur verifyPhoneNumber:', error);
    res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
};

module.exports = {
  register,
  login,
  getUserById,
  forgotPassword,
  verifyOtp,
  resetPassword,
  updateProfile,
  changePassword,
  resendVerificationCode,
  verifyPhoneNumber,
};
