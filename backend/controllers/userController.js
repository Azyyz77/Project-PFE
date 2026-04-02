const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getConnection, sql } = require('../config/database');
const { sendWhatsAppMessage } = require('../services/whatsappClient');

const otpStore = new Map();

const formatToE164 = (telephone) => {
  if (!telephone) return '';
  const raw = String(telephone).replace(/\s+/g, '');
  if (raw.startsWith('+')) return raw;

  // Default to Tunisia country code when not provided.
  if (/^0\d+$/.test(raw)) return `+216${raw.slice(1)}`;
  if (/^\d+$/.test(raw)) return `+216${raw}`;
  return raw;
};

const isValidE164 = (telephone) => /^\+[1-9]\d{7,14}$/.test(telephone);

const register = async (req, res) => {
  try {
    const { prenom, nom, telephone, email, password, type_utilisateur } = req.body;

    if (!prenom || !nom || !telephone || !email || !password) {
      return res.status(400).json({
        error: 'Tous les champs sont obligatoires',
        required: ['prenom', 'nom', 'telephone', 'email', 'password']
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Format email invalide' });
    }

    const normalizedPhone = formatToE164(telephone);
    if (!isValidE164(normalizedPhone)) {
      return res.status(400).json({
        error: 'Numéro de téléphone invalide. Utilisez un format international, ex: +21624770580',
      });
    }

    const typeUtilisateur = type_utilisateur || 'CLIENT';
    const validTypes = ['CLIENT', 'AGENT', 'ADMIN', 'DIRECTION'];
    if (!validTypes.includes(typeUtilisateur)) {
      return res.status(400).json({ error: 'Type utilisateur invalide', validTypes });
    }

    const pool = await getConnection();

    const checkResult = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT id FROM Utilisateur WHERE email = @email');

    if (checkResult.recordset.length > 0) {
      return res.status(409).json({ error: 'Cet email est déjà utilisé' });
    }

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

    const result = await pool.request()
      .input('nom', sql.NVarChar, nom)
      .input('prenom', sql.NVarChar, prenom)
      .input('telephone', sql.NVarChar, normalizedPhone)
      .input('email', sql.NVarChar, email)
      .input('mot_de_passe', sql.NVarChar, mot_de_passe)
      .input('role_id', sql.BigInt, role_id)
      .query(insertQuery);

    const newUser = result.recordset[0];

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user: {
        id: newUser.id,
        prenom: newUser.prenom,
        nom: newUser.nom,
        email: newUser.email,
        telephone: newUser.telephone,
        role: typeUtilisateur,
        actif: newUser.actif,
        date_creation: newUser.date_creation
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({ error: 'Erreur lors de l\'inscription', message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    const pool = await getConnection();

    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query(`
        SELECT u.id, u.prenom, u.nom, u.email, u.telephone, u.mot_de_passe,
               u.actif, u.date_creation, u.role_id,
               ISNULL(r.nom, 'CLIENT') AS role_nom
        FROM Utilisateur u
        LEFT JOIN Role r ON r.id = u.role_id
        WHERE u.email = @email
      `);

    if (result.recordset.length === 0) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const user = result.recordset[0];

    if (!user.actif) {
      return res.status(403).json({ error: 'Compte désactivé. Contactez l\'administrateur.' });
    }

    // Use role_nom as role (from Role table join)

    const isPasswordValid = await bcrypt.compare(password, user.mot_de_passe);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role_nom },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

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
        date_creation: user.date_creation
      }
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ error: 'Erreur lors de la connexion', message: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await getConnection();

    const result = await pool.request()
      .input('id', sql.BigInt, id)
      .query(`
        SELECT u.id, u.prenom, u.nom, u.email, u.telephone, u.actif, u.date_creation,
               r.nom AS role_nom
        FROM Utilisateur u
        JOIN Role r ON r.id = u.role_id
        WHERE u.id = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({ user: result.recordset[0] });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'utilisateur', message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email requis' });

    const pool = await getConnection();
    const result = await pool
      .request()
      .input('email', sql.NVarChar, email)
      .query('SELECT id, telephone FROM Utilisateur WHERE email = @email AND actif = 1');

    if (result.recordset.length === 0) {
      return res.json({ message: 'Si cet email existe, un code de vérification WhatsApp a été envoyé au numéro associé.' });
    }

    const user = result.recordset[0];
    const phone = formatToE164(user.telephone);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 10 * 60 * 1000;

    otpStore.set(email, {
      otp,
      expiry,
      userId: user.id,
      telephone: phone,
    });

    await sendWhatsAppMessage(
      phone,
      `STA Chery Tunisia\nVotre code de verification est: ${otp}\nCe code expire dans 10 minutes.`
    );

    res.json({
      message: 'Si cet email existe, un code de vérification WhatsApp a été envoyé au numéro associé.',
      telephone_hint: user.telephone
        ? `***${user.telephone.slice(-3)}`
        : undefined,
    });
  } catch (error) {
    if (String(error.message || '').toLowerCase().includes('qr code')) {
      return res.status(400).json({
        error: 'WhatsApp Web n\'est pas prêt. Scannez le QR code affiché dans le terminal backend.',
      });
    }
    console.error('Erreur forgotPassword:', error);
    res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Email et OTP requis' });

    const pool = await getConnection();
    const result = await pool
      .request()
      .input('email', sql.NVarChar, email)
      .query('SELECT id, telephone FROM Utilisateur WHERE email = @email AND actif = 1');

    if (result.recordset.length === 0) {
      return res.status(400).json({ error: 'Aucun utilisateur actif trouvé pour cet email' });
    }

    const user = result.recordset[0];
    const stored = otpStore.get(email);
    if (!stored) {
      return res.status(400).json({ error: 'Aucun code OTP demandé pour cet email' });
    }

    if (Date.now() > stored.expiry) {
      otpStore.delete(email);
      return res.status(400).json({ error: 'Code OTP expiré. Veuillez recommencer.' });
    }

    if (stored.userId !== user.id || stored.otp !== String(otp)) {
      return res.status(400).json({ error: 'Code OTP incorrect ou expiré' });
    }

    const resetToken = jwt.sign(
      { userId: user.id, email, purpose: 'reset_password' },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    otpStore.delete(email);
    res.json({ message: 'OTP vérifié avec succès', resetToken });
  } catch (error) {
    console.error('Erreur verifyOtp:', error);
    res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    if (!resetToken || !newPassword)
      return res.status(400).json({ error: 'Token et nouveau mot de passe requis' });
    if (newPassword.length < 8)
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 8 caractères' });

    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch {
      return res.status(400).json({ error: 'Token de réinitialisation invalide ou expiré' });
    }

    if (decoded.purpose !== 'reset_password') {
      return res.status(400).json({ error: 'Token invalide' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    const pool = await getConnection();
    await pool
      .request()
      .input('id', sql.BigInt, decoded.userId)
      .input('mot_de_passe', sql.NVarChar, hashed)
      .query('UPDATE Utilisateur SET mot_de_passe = @mot_de_passe WHERE id = @id');

    res.json({ message: 'Mot de passe réinitialisé avec succès' });
  } catch (error) {
    console.error('Erreur resetPassword:', error);
    res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    if (String(req.user.id) !== String(id)) {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    const { prenom, nom, telephone } = req.body;
    if (!prenom || !nom || !telephone) {
      return res.status(400).json({ error: 'Prénom, nom et téléphone sont requis' });
    }

    const normalizedPhone = formatToE164(telephone);
    if (!isValidE164(normalizedPhone)) {
      return res.status(400).json({
        error: 'Numéro de téléphone invalide. Utilisez un format international, ex: +21624770580',
      });
    }

    const pool = await getConnection();

    if (req.user.role === 'CLIENT') {
      const validatedVehicleResult = await pool
        .request()
        .input('id', sql.BigInt, id)
        .query(`
          SELECT COUNT(*) AS validated_count
          FROM Vehicule
          WHERE client_id = @id
            AND statut_validation = 'VALIDE'
        `);

      const validatedCount = validatedVehicleResult.recordset[0]?.validated_count || 0;
      if (validatedCount === 0) {
        return res.status(403).json({
          error: 'Validation véhicule requise',
          message: 'Votre profil ne peut être complété qu\'après validation de votre véhicule par un agent SAV.'
        });
      }
    }

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

    res.json({ message: 'Profil mis à jour avec succès', user: result.recordsets[1][0] });
  } catch (error) {
    console.error('Erreur updateProfile:', error);
    res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    if (String(req.user.id) !== String(id)) {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Mot de passe actuel et nouveau mot de passe requis' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Le nouveau mot de passe doit contenir au moins 8 caractères' });
    }

    const pool = await getConnection();
    const result = await pool
      .request()
      .input('id', sql.BigInt, id)
      .query('SELECT mot_de_passe FROM Utilisateur WHERE id = @id');

    if (result.recordset.length === 0)
      return res.status(404).json({ error: 'Utilisateur non trouvé' });

    const isValid = await bcrypt.compare(currentPassword, result.recordset[0].mot_de_passe);
    if (!isValid) return res.status(400).json({ error: 'Mot de passe actuel incorrect' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await pool
      .request()
      .input('id', sql.BigInt, id)
      .input('mot_de_passe', sql.NVarChar, hashed)
      .query('UPDATE Utilisateur SET mot_de_passe = @mot_de_passe WHERE id = @id');

    res.json({ message: 'Mot de passe modifié avec succès' });
  } catch (error) {
    console.error('Erreur changePassword:', error);
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
};
