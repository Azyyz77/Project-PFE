/**
 * Module de validation centralisé pour éviter les doublons
 */

const { getConnection, sql } = require('../config/database');

/**
 * Vérifier l'unicité d'un champ dans une table
 * @param {string} table - Nom de la table
 * @param {string} field - Nom du champ à vérifier
 * @param {any} value - Valeur à vérifier
 * @param {number|null} excludeId - ID à exclure (pour les mises à jour)
 * @param {object} additionalConditions - Conditions supplémentaires {field: value}
 * @returns {Promise<{exists: boolean, duplicate: object|null}>}
 */
async function checkUniqueness(table, field, value, excludeId = null, additionalConditions = {}) {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return { exists: false, duplicate: null };
  }

  const pool = await getConnection();
  let query = `SELECT id, * FROM ${table} WHERE `;
  
  // Condition principale
  if (typeof value === 'string') {
    query += `LOWER(${field}) = LOWER(@value)`;
  } else {
    query += `${field} = @value`;
  }

  const request = pool.request().input('value', value);

  // Exclure un ID spécifique (pour les mises à jour)
  if (excludeId) {
    query += ' AND id != @excludeId';
    request.input('excludeId', sql.BigInt, excludeId);
  }

  // Conditions supplémentaires
  Object.keys(additionalConditions).forEach((key, index) => {
    query += ` AND ${key} = @condition${index}`;
    request.input(`condition${index}`, additionalConditions[key]);
  });

  const result = await request.query(query);
  
  return {
    exists: result.recordset.length > 0,
    duplicate: result.recordset[0] || null
  };
}

/**
 * Vérifier les doublons pour email
 */
async function checkEmailUniqueness(table, email, excludeId = null) {
  if (!email || !email.trim()) {
    return { exists: false, duplicate: null };
  }

  return checkUniqueness(table, 'email', email.trim().toLowerCase(), excludeId);
}

/**
 * Vérifier les doublons pour téléphone
 */
async function checkPhoneUniqueness(table, phone, excludeId = null) {
  if (!phone || !phone.trim()) {
    return { exists: false, duplicate: null };
  }

  // Nettoyer le téléphone (enlever espaces et caractères spéciaux)
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  return checkUniqueness(table, 'telephone', cleanPhone, excludeId);
}

/**
 * Vérifier les doublons pour immatriculation
 */
async function checkImmatriculationUniqueness(immatriculation, excludeId = null) {
  if (!immatriculation || !immatriculation.trim()) {
    return { exists: false, duplicate: null };
  }

  return checkUniqueness('Vehicule', 'immatriculation', immatriculation.trim().toUpperCase(), excludeId);
}

/**
 * Vérifier les doublons pour nom (case-insensitive)
 */
async function checkNameUniqueness(table, field, name, excludeId = null, additionalConditions = {}) {
  if (!name || !name.trim()) {
    return { exists: false, duplicate: null };
  }

  return checkUniqueness(table, field, name.trim(), excludeId, additionalConditions);
}

/**
 * Vérifier les doublons combinés (ex: nom + prénom dans même agence)
 */
async function checkCombinedUniqueness(table, fields, values, excludeId = null) {
  const pool = await getConnection();
  let query = `SELECT id, * FROM ${table} WHERE `;
  
  const conditions = fields.map((field, index) => {
    if (typeof values[index] === 'string') {
      return `LOWER(${field}) = LOWER(@value${index})`;
    }
    return `${field} = @value${index}`;
  });
  
  query += conditions.join(' AND ');

  const request = pool.request();
  fields.forEach((field, index) => {
    request.input(`value${index}`, values[index]);
  });

  if (excludeId) {
    query += ' AND id != @excludeId';
    request.input('excludeId', sql.BigInt, excludeId);
  }

  const result = await request.query(query);
  
  return {
    exists: result.recordset.length > 0,
    duplicate: result.recordset[0] || null
  };
}

/**
 * Formater un message d'erreur de doublon
 */
function formatDuplicateError(fieldName, existingRecord = null) {
  let message = `Un enregistrement avec ce ${fieldName} existe déjà`;
  
  if (existingRecord) {
    if (existingRecord.nom && existingRecord.prenom) {
      message += ` : ${existingRecord.prenom} ${existingRecord.nom}`;
    } else if (existingRecord.nom) {
      message += ` : ${existingRecord.nom}`;
    } else if (existingRecord.titre) {
      message += ` : ${existingRecord.titre}`;
    }
  }
  
  return message;
}

/**
 * Valider et nettoyer un email
 */
function validateEmail(email) {
  if (!email || !email.trim()) {
    return { valid: true, cleaned: null }; // Email optionnel
  }

  const cleaned = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(cleaned)) {
    return { valid: false, cleaned: null, error: 'Format email invalide' };
  }

  if (cleaned.length > 100) {
    return { valid: false, cleaned: null, error: 'Email trop long (max 100 caractères)' };
  }

  return { valid: true, cleaned };
}

/**
 * Valider et nettoyer un téléphone tunisien
 */
function validatePhone(phone) {
  if (!phone || !phone.trim()) {
    return { valid: true, cleaned: null }; // Téléphone optionnel
  }

  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // Format tunisien: +216XXXXXXXX ou 216XXXXXXXX ou XXXXXXXX
  const phoneRegex = /^(\+216|216)?[2-9]\d{7}$/;
  
  if (!phoneRegex.test(cleaned)) {
    return { valid: false, cleaned: null, error: 'Format téléphone invalide (ex: +216 XX XXX XXX)' };
  }

  return { valid: true, cleaned };
}

/**
 * Valider une date (ne doit pas être dans le futur)
 */
function validateDate(date, fieldName = 'date') {
  if (!date) {
    return { valid: true, cleaned: null }; // Date optionnelle
  }

  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (selectedDate > today) {
    return { valid: false, cleaned: null, error: `La ${fieldName} ne peut pas être dans le futur` };
  }

  const minDate = new Date('1950-01-01');
  if (selectedDate < minDate) {
    return { valid: false, cleaned: null, error: 'Date invalide' };
  }

  return { valid: true, cleaned: date };
}

/**
 * Valider une chaîne de caractères
 */
function validateString(str, fieldName, minLength = 2, maxLength = 100, required = true) {
  if (!str || !str.trim()) {
    if (required) {
      return { valid: false, cleaned: null, error: `${fieldName} est requis` };
    }
    return { valid: true, cleaned: null };
  }

  const cleaned = str.trim();

  if (cleaned.length < minLength) {
    return { valid: false, cleaned: null, error: `${fieldName} doit contenir au moins ${minLength} caractères` };
  }

  if (cleaned.length > maxLength) {
    return { valid: false, cleaned: null, error: `${fieldName} ne peut pas dépasser ${maxLength} caractères` };
  }

  return { valid: true, cleaned };
}

/**
 * Valider un nombre
 */
function validateNumber(num, fieldName, min = null, max = null, required = true) {
  if (num === null || num === undefined || num === '') {
    if (required) {
      return { valid: false, cleaned: null, error: `${fieldName} est requis` };
    }
    return { valid: true, cleaned: null };
  }

  const parsed = Number(num);

  if (isNaN(parsed)) {
    return { valid: false, cleaned: null, error: `${fieldName} doit être un nombre` };
  }

  if (min !== null && parsed < min) {
    return { valid: false, cleaned: null, error: `${fieldName} doit être au moins ${min}` };
  }

  if (max !== null && parsed > max) {
    return { valid: false, cleaned: null, error: `${fieldName} ne peut pas dépasser ${max}` };
  }

  return { valid: true, cleaned: parsed };
}

module.exports = {
  checkUniqueness,
  checkEmailUniqueness,
  checkPhoneUniqueness,
  checkImmatriculationUniqueness,
  checkNameUniqueness,
  checkCombinedUniqueness,
  formatDuplicateError,
  validateEmail,
  validatePhone,
  validateDate,
  validateString,
  validateNumber
};
