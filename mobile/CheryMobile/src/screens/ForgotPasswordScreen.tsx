import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import api from '../config/api';
import { colors, spacing, borderRadius, fontSize, shadows } from '../styles/theme';

export default function ForgotPasswordScreen({ navigation }: any) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStep1 = async () => {
    if (!email) { Alert.alert('Erreur', 'Veuillez entrer votre email'); return; }
    setLoading(true);
    try {
      await api.post('/users/forgot-password', { email });
      Alert.alert('Succès', 'Un code OTP a été envoyé sur votre WhatsApp');
      setStep(2);
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.error || 'Impossible d\'envoyer le code OTP');
    } finally { setLoading(false); }
  };

  const handleStep2 = async () => {
    if (!otp) { Alert.alert('Erreur', 'Veuillez entrer le code OTP'); return; }
    setLoading(true);
    try {
      const response = await api.post('/users/verify-otp', { email, otp });
      setResetToken(response.data.resetToken);
      Alert.alert('Succès', 'Code vérifié ! Vous pouvez maintenant réinitialiser votre mot de passe');
      setStep(3);
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.error || 'Code OTP invalide');
    } finally { setLoading(false); }
  };

  const handleStep3 = async () => {
    if (!newPassword || !confirmPassword) { Alert.alert('Erreur', 'Veuillez remplir tous les champs'); return; }
    if (newPassword !== confirmPassword) { Alert.alert('Erreur', 'Les mots de passe ne correspondent pas'); return; }
    if (newPassword.length < 6) { Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères'); return; }
    setLoading(true);
    try {
      await api.post('/users/reset-password', { resetToken, newPassword });
      Alert.alert('Succès', 'Mot de passe réinitialisé avec succès !', [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.error || 'Impossible de réinitialiser le mot de passe');
    } finally { setLoading(false); }
  };

  const stepLabels = ['Email', 'Vérification', 'Nouveau mot de passe'];

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>← Retour</Text>
        </TouchableOpacity>

        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>🔐</Text>
          </View>
        </View>

        <Text style={styles.title}>Mot de passe oublié</Text>
        <Text style={styles.subtitle}>
          {step === 1 && 'Entrez votre email pour recevoir un code'}
          {step === 2 && 'Vérifiez votre WhatsApp'}
          {step === 3 && 'Choisissez un nouveau mot de passe'}
        </Text>

        {/* Step Indicator */}
        <View style={styles.stepIndicator}>
          {[1, 2, 3].map((s, i) => (
            <React.Fragment key={s}>
              <View style={styles.stepItem}>
                <View style={[styles.stepDot, step >= s && styles.stepDotActive]}>
                  {step > s ? (
                    <Text style={styles.stepDotText}>✓</Text>
                  ) : (
                    <Text style={styles.stepDotText}>{s}</Text>
                  )}
                </View>
                <Text style={[styles.stepLabel, step >= s && styles.stepLabelActive]}>{stepLabels[i]}</Text>
              </View>
              {i < 2 && <View style={[styles.stepLine, step > s && styles.stepLineActive]} />}
            </React.Fragment>
          ))}
        </View>

        <View style={styles.formContainer}>
          {step === 1 && (
            <>
              <Text style={styles.helpText}>
                Nous vous enverrons un code de vérification sur votre WhatsApp
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
              <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleStep1} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Envoyer le code</Text>}
              </TouchableOpacity>
            </>
          )}

          {step === 2 && (
            <>
              <Text style={styles.helpText}>
                Entrez le code à 6 chiffres envoyé sur votre WhatsApp
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Code OTP (6 chiffres)"
                placeholderTextColor={colors.textMuted}
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
                editable={!loading}
              />
              <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleStep2} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Vérifier le code</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={styles.resendLink} onPress={handleStep1} disabled={loading}>
                <Text style={styles.resendLinkText}>Renvoyer le code</Text>
              </TouchableOpacity>
            </>
          )}

          {step === 3 && (
            <>
              <Text style={styles.helpText}>Choisissez un nouveau mot de passe sécurisé</Text>
              <TextInput
                style={styles.input}
                placeholder="Nouveau mot de passe (min. 6 caractères)"
                placeholderTextColor={colors.textMuted}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                editable={!loading}
              />
              <TextInput
                style={styles.input}
                placeholder="Confirmer le mot de passe"
                placeholderTextColor={colors.textMuted}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                editable={!loading}
              />
              <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleStep3} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Réinitialiser</Text>}
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { flexGrow: 1, padding: spacing.xxl, paddingTop: 60 },
  backBtn: { marginBottom: spacing.xxl },
  backBtnText: { color: colors.primary, fontSize: fontSize.md, fontWeight: '600' },
  logoContainer: { alignItems: 'center', marginBottom: spacing.xxl },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
    ...shadows.lg,
  },
  logoText: { fontSize: 40 },
  title: { fontSize: fontSize.xxxl, fontWeight: 'bold', textAlign: 'center', color: colors.textPrimary, marginBottom: spacing.sm },
  subtitle: { fontSize: fontSize.base, textAlign: 'center', color: colors.textSecondary, marginBottom: spacing.xxl },
  stepIndicator: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', marginBottom: spacing.xxxl },
  stepItem: { alignItems: 'center', width: 80 },
  stepDot: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.border,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: spacing.xs,
  },
  stepDotActive: { backgroundColor: colors.primary },
  stepDotText: { color: colors.textWhite, fontSize: fontSize.sm, fontWeight: 'bold' },
  stepLabel: { fontSize: fontSize.xs, color: colors.textMuted, textAlign: 'center' },
  stepLabelActive: { color: colors.primary, fontWeight: '600' },
  stepLine: { flex: 1, height: 2, backgroundColor: colors.border, marginTop: 15 },
  stepLineActive: { backgroundColor: colors.primary },
  helpText: {
    backgroundColor: colors.blue, padding: spacing.md, borderRadius: borderRadius.sm,
    color: '#1E40AF', fontSize: fontSize.base, marginBottom: spacing.xl,
  },
  formContainer: {},
  input: {
    backgroundColor: colors.surface, padding: spacing.lg, borderRadius: borderRadius.md,
    marginBottom: spacing.lg, fontSize: fontSize.md, borderWidth: 1, borderColor: colors.border,
    color: colors.textPrimary,
  },
  button: {
    backgroundColor: colors.primary, padding: spacing.lg, borderRadius: borderRadius.md,
    alignItems: 'center', marginTop: spacing.md, ...shadows.sm,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: colors.textWhite, fontSize: fontSize.md, fontWeight: '600' },
  resendLink: { alignItems: 'center', marginTop: spacing.xl },
  resendLinkText: { color: colors.primary, fontSize: fontSize.base, fontWeight: '600' },
});
