import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, borderRadius, fontSize, shadows } from '../styles/theme';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Échec de la connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>🚗</Text>
          </View>
        </View>

        <Text style={styles.title}>Chery Service</Text>
        <Text style={styles.subtitle}>Connectez-vous à votre compte</Text>

        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            placeholderTextColor={colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Se connecter</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.forgotLink}
            onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.forgotLinkText}>Mot de passe oublié ?</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerButtonText}>
              Pas de compte ? <Text style={styles.registerButtonTextBold}>S'inscrire</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, justifyContent: 'center', padding: spacing.xxl },
  logoContainer: { alignItems: 'center', marginBottom: spacing.xxl },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.primary, justifyContent: 'center',
    alignItems: 'center', ...shadows.lg,
  },
  logoText: { fontSize: 40 },
  title: { fontSize: fontSize.xxxl, fontWeight: 'bold', textAlign: 'center', marginBottom: spacing.sm, color: colors.textPrimary },
  subtitle: { fontSize: fontSize.base, textAlign: 'center', marginBottom: spacing.xxxl, color: colors.textSecondary },
  formContainer: { width: '100%' },
  input: {
    backgroundColor: colors.surface, padding: spacing.lg,
    borderRadius: borderRadius.md, marginBottom: spacing.lg,
    fontSize: fontSize.md, borderWidth: 1, borderColor: colors.border,
    color: colors.textPrimary,
  },
  button: {
    backgroundColor: colors.primary, padding: spacing.lg,
    borderRadius: borderRadius.md, alignItems: 'center',
    marginTop: spacing.md, ...shadows.sm,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: colors.textWhite, fontSize: fontSize.md, fontWeight: '600' },
  forgotLink: { alignItems: 'center', marginTop: spacing.lg },
  forgotLinkText: { color: colors.primary, fontSize: fontSize.base, fontWeight: '500' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.xxl },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { marginHorizontal: spacing.lg, color: colors.textMuted, fontSize: fontSize.sm },
  registerButton: { padding: spacing.md, alignItems: 'center' },
  registerButtonText: { color: colors.textSecondary, fontSize: fontSize.base },
  registerButtonTextBold: { color: colors.primary, fontWeight: 'bold' },
});
