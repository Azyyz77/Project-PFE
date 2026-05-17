import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Alert, ScrollView, KeyboardAvoidingView, Platform,
  Image, Dimensions, StatusBar, Animated, Easing
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, borderRadius, fontSize, shadows } from '../styles/theme';
import { FacebookButton, FacebookInput } from '../components/facebook';

const { width, height } = Dimensions.get('window');

export default function RegisterScreen({ navigation }: any) {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  // Animation Values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const logoScale = useRef(new Animated.Value(0)).current;
  const bgAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(bgAnim, {
          toValue: 1,
          duration: 3500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bgAnim, {
          toValue: 0,
          duration: 3500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const bgScale = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05]
  });

  const handleRegister = async () => {
    if (!nom || !prenom || !email || !telephone || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);
    try {
      await register({ nom, prenom, email, telephone, password });
      Alert.alert(
        'Succès',
        'Compte créé avec succès. Veuillez vérifier votre WhatsApp pour le code de vérification puis connectez-vous.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Échec de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" />
      
      {/* Animated Background Decorators */}
      <Animated.View style={[styles.backgroundDecorator, { transform: [{ scale: bgScale }] }]} />
      <Animated.View style={[styles.backgroundDecoratorSecondary, { transform: [{ scale: bgScale }, { translateY: slideAnim }] }]} />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
              
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.logoContainer}>
                  <Animated.View style={[styles.logoCircle, { transform: [{ scale: logoScale }] }]}>
                    <Image 
                      source={require('../../assets/icon.png')} 
                      style={styles.logoImage} 
                      resizeMode="contain" 
                    />
                  </Animated.View>
                </View>
                <Text style={styles.title}>Créer un compte</Text>
                <Text style={styles.subtitle}>Rejoignez Chery Service</Text>
              </View>

              {/* Form Card */}
              <View style={styles.formCard}>
                <View style={styles.inputRow}>
                  <View style={styles.inputHalf}>
                    <FacebookInput
                      label="Nom"
                      placeholder="Nom"
                      value={nom}
                      onChangeText={setNom}
                    />
                  </View>
                  <View style={styles.inputHalf}>
                    <FacebookInput
                      label="Prénom"
                      placeholder="Prénom"
                      value={prenom}
                      onChangeText={setPrenom}
                    />
                  </View>
                </View>

                <FacebookInput
                  label="Email"
                  placeholder="exemple@email.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                />

                <FacebookInput
                  label="Téléphone"
                  placeholder="+216 XX XXX XXX"
                  value={telephone}
                  onChangeText={setTelephone}
                  keyboardType="phone-pad"
                />

                <FacebookInput
                  label="Mot de passe"
                  placeholder="Minimum 6 caractères"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />

                <FacebookInput
                  label="Confirmer le mot de passe"
                  placeholder="Retapez votre mot de passe"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />

                <FacebookButton
                  title="S'inscrire"
                  onPress={handleRegister}
                  loading={loading}
                  disabled={loading}
                  fullWidth
                  variant="primary"
                  style={styles.primaryButton}
                />

                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>ou</Text>
                  <View style={styles.dividerLine} />
                </View>

                <TouchableOpacity 
                  style={styles.loginButton}
                  onPress={() => navigation.navigate('Login')}
                >
                  <Text style={styles.loginButtonText}>
                    Déjà un compte ? <Text style={styles.loginButtonTextBold}>Se connecter</Text>
                  </Text>
                </TouchableOpacity>
              </View>
              
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FAFBFC', // Very light modern gray
  },
  backgroundDecorator: {
    position: 'absolute',
    top: -height * 0.15,
    left: -width * 0.1,
    width: width * 1.2,
    height: height * 0.45,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: width * 0.6,
    borderBottomRightRadius: width * 0.6,
    opacity: 0.95,
  },
  backgroundDecoratorSecondary: {
    position: 'absolute',
    top: -height * 0.05,
    right: -width * 0.2,
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: colors.primaryDark,
    opacity: 0.25,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.md,
  },
  logoContainer: {
    padding: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 100,
    marginBottom: spacing.lg,
  },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
  },
  logoImage: {
    width: 54,
    height: 54,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.surface,
    marginBottom: spacing.xs,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    fontWeight: '500',
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: spacing.xl,
    ...shadows.lg,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  inputHalf: {
    flex: 1,
  },
  primaryButton: {
    height: 56,
    borderRadius: 16,
    marginTop: spacing.md,
    ...shadows.sm,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: spacing.lg,
    color: colors.textMuted,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  loginButton: {
    padding: spacing.md,
    alignItems: 'center',
  },
  loginButtonText: {
    color: colors.textSecondary,
    fontSize: fontSize.base,
  },
  loginButtonTextBold: {
    color: colors.primary,
    fontWeight: 'bold',
  },
});
