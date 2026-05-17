import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Alert, KeyboardAvoidingView, Platform, ScrollView,
  Image, Dimensions, StatusBar, Animated, Easing
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, borderRadius, fontSize, shadows } from '../styles/theme';
import { FacebookButton, FacebookInput } from '../components/facebook';

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  // Animation Values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const logoScale = useRef(new Animated.Value(0)).current;
  const bgAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Initial Entry Animations
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

    // Continuous Background Pulse
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
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" />
      
      {/* Animated Background Decorators */}
      <Animated.View style={[styles.backgroundDecorator, { transform: [{ scale: bgScale }] }]} />
      <Animated.View style={[styles.backgroundDecoratorSecondary, { transform: [{ scale: bgScale }, { translateY: slideAnim }] }]} />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            
            <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
              
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
                <Text style={styles.title}>Bon Retour</Text>
                <Text style={styles.subtitle}>Connectez-vous à votre espace</Text>
              </View>

              {/* Form Card */}
              <View style={styles.formCard}>
                <FacebookInput
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                />

                <FacebookInput
                  placeholder="Mot de passe"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />

                <FacebookButton
                  title="Se connecter"
                  onPress={handleLogin}
                  loading={loading}
                  disabled={loading}
                  fullWidth
                  variant="primary"
                  style={styles.primaryButton}
                />

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
    backgroundColor: '#ffffffff', // Very light modern gray
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
    justifyContent: 'center',
    padding: spacing.xl,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.xl,
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
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
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
  primaryButton: {
    height: 56,
    borderRadius: 16,
    marginTop: spacing.md,
    ...shadows.sm,
  },
  forgotLink: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  forgotLinkText: {
    color: colors.primary,
    fontSize: fontSize.base,
    fontWeight: '600',
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
  registerButton: {
    padding: spacing.md,
    alignItems: 'center',
  },
  registerButtonText: {
    color: colors.textSecondary,
    fontSize: fontSize.base,
  },
  registerButtonTextBold: {
    color: colors.primary,
    fontWeight: 'bold',
  },
});
