/**
 * Auth utilities - Form validation and helpers
 */

// Validation patterns
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const phoneRegex = /^(\+216|0)?[2-9]\d{7}$/; // Tunisia phone format

// Validation functions
export function validateEmail(email: string): string | null {
  if (!email.trim()) return 'L\'email est obligatoire';
  if (!emailRegex.test(email)) return 'Format d\'email invalide';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Le mot de passe est obligatoire';
  if (password.length < 8) return 'Le mot de passe doit contenir au moins 8 caractères';
  return null;
}

export function validatePhone(phone: string): string | null {
  if (!phone.trim()) return 'Le téléphone est obligatoire';
  if (!phoneRegex.test(phone)) return 'Numéro de téléphone invalide (format Tunisie)';
  return null;
}

export function validateName(name: string, fieldName: string = 'Nom'): string | null {
  if (!name.trim()) return `${fieldName} est obligatoire`;
  if (name.trim().length < 2) return `${fieldName} doit contenir au moins 2 caractères`;
  return null;
}

export function validatePasswordMatch(password: string, confirmPassword: string): string | null {
  if (password !== confirmPassword) return 'Les mots de passe ne correspondent pas';
  return null;
}

export function validateOtp(otp: string[]): string | null {
  const code = otp.join('');
  if (code.length !== 6) return 'Veuillez entrer le code à 6 chiffres';
  if (!/^\d{6}$/.test(code)) return 'Le code doit contenir uniquement des chiffres';
  return null;
}

// Form state types
export interface LoginFormState {
  email: string;
  password: string;
}

export interface RegisterFormState {
  prenom: string;
  nom: string;
  telephone: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordFormState {
  email: string;
}

export interface ResetPasswordFormState {
  password: string;
  confirmPassword: string;
}

export interface SelfProfileFormState {
  prenom: string;
  nom: string;
  telephone: string;
}

// Empty states
export const EMPTY_LOGIN_FORM: LoginFormState = {
  email: '',
  password: '',
};

export const EMPTY_REGISTER_FORM: RegisterFormState = {
  prenom: '',
  nom: '',
  telephone: '',
  email: '',
  password: '',
  confirmPassword: '',
};

export const EMPTY_FORGOT_PASSWORD_FORM: ForgotPasswordFormState = {
  email: '',
};

export const EMPTY_RESET_PASSWORD_FORM: ResetPasswordFormState = {
  password: '',
  confirmPassword: '',
};

// Form validators
export function validateLoginForm(form: LoginFormState): Record<string, string> {
  const errors: Record<string, string> = {};

  const emailError = validateEmail(form.email);
  if (emailError) errors.email = emailError;

  const passwordError = validatePassword(form.password);
  if (passwordError) errors.password = passwordError;

  return errors;
}

export function validateRegisterForm(form: RegisterFormState): Record<string, string> {
  const errors: Record<string, string> = {};

  const prenomError = validateName(form.prenom, 'Prénom');
  if (prenomError) errors.prenom = prenomError;

  const nomError = validateName(form.nom, 'Nom');
  if (nomError) errors.nom = nomError;

  const phoneError = validatePhone(form.telephone);
  if (phoneError) errors.telephone = phoneError;

  const emailError = validateEmail(form.email);
  if (emailError) errors.email = emailError;

  const passwordError = validatePassword(form.password);
  if (passwordError) errors.password = passwordError;

  const passwordMatchError = validatePasswordMatch(form.password, form.confirmPassword);
  if (passwordMatchError) errors.confirmPassword = passwordMatchError;

  return errors;
}

export function validateForgotPasswordForm(form: ForgotPasswordFormState): Record<string, string> {
  const errors: Record<string, string> = {};

  const emailError = validateEmail(form.email);
  if (emailError) errors.email = emailError;

  return errors;
}

export function validateResetPasswordForm(form: ResetPasswordFormState): Record<string, string> {
  const errors: Record<string, string> = {};

  const passwordError = validatePassword(form.password);
  if (passwordError) errors.password = passwordError;

  const passwordMatchError = validatePasswordMatch(form.password, form.confirmPassword);
  if (passwordMatchError) errors.confirmPassword = passwordMatchError;

  return errors;
}

export function validateProfileForm(form: SelfProfileFormState): Record<string, string> {
  const errors: Record<string, string> = {};

  const prenomError = validateName(form.prenom, 'Prénom');
  if (prenomError) errors.prenom = prenomError;

  const nomError = validateName(form.nom, 'Nom');
  if (nomError) errors.nom = nomError;

  const phoneError = validatePhone(form.telephone);
  if (phoneError) errors.telephone = phoneError;

  return errors;
}
