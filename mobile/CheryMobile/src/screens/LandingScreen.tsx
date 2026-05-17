import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, StatusBar, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, shadows } from '../styles/theme';
import { FacebookButton } from '../components/facebook';

const { width, height } = Dimensions.get('window');

export default function LandingScreen({ navigation }: any) {
  // Animation Values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoScale = useRef(new Animated.Value(0)).current;
  
  // Staggered card animations
  const card1Anim = useRef(new Animated.Value(0)).current;
  const card2Anim = useRef(new Animated.Value(0)).current;
  const card3Anim = useRef(new Animated.Value(0)).current;
  
  // Continuous background animation
  const bgAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Initial Entry Animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Staggered Cards Entry
    Animated.stagger(150, [
      Animated.timing(card1Anim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(card2Anim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(card3Anim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // 3. Continuous Background Pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(bgAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bgAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Interpolated background animation
  const bgScale = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05]
  });

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" />
      
      {/* Background Decorators (Animated) */}
      <Animated.View style={[styles.backgroundDecorator, { transform: [{ scale: bgScale }] }]} />
      <Animated.View style={[styles.backgroundDecoratorSecondary, { transform: [{ scale: bgScale }, { translateY: slideAnim }] }]} />

      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          
          {/* HEADER */}
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
            <Text style={styles.title}>Chery Service</Text>
            <Text style={styles.subtitle}>L'excellence de l'entretien,{"\n"}dans votre poche.</Text>
          </View>

          {/* FEATURES / CARDS */}
          <View style={styles.cardsContainer}>
            <Animated.View style={[styles.card, { opacity: card1Anim, transform: [{ translateY: card1Anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
                <Text style={styles.cardIcon}>📅</Text>
              </View>
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardTitle}>Rendez-vous Facile</Text>
                <Text style={styles.cardDescription}>Réservez en quelques clics</Text>
              </View>
            </Animated.View>

            <Animated.View style={[styles.card, { opacity: card2Anim, transform: [{ translateY: card2Anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
                <Text style={styles.cardIcon}>🔧</Text>
              </View>
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardTitle}>Suivi en Direct</Text>
                <Text style={styles.cardDescription}>L'état de votre véhicule</Text>
              </View>
            </Animated.View>

            <Animated.View style={[styles.card, { opacity: card3Anim, transform: [{ translateY: card3Anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
                <Text style={styles.cardIcon}>📄</Text>
              </View>
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardTitle}>Historique & Factures</Text>
                <Text style={styles.cardDescription}>Tous vos documents centralisés</Text>
              </View>
            </Animated.View>
          </View>

          {/* FOOTER BUTTONS */}
          <View style={styles.footer}>
            <FacebookButton
              title="Se Connecter"
              onPress={() => navigation.navigate('Login')}
              variant="primary"
              fullWidth
              style={styles.primaryButton}
            />
            <FacebookButton
              title="Créer un compte"
              onPress={() => navigation.navigate('Register')}
              variant="outline"
              fullWidth
              style={styles.secondaryButton}
            />
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FAFBFC', // Modern off-white background
  },
  backgroundDecorator: {
    position: 'absolute',
    top: -height * 0.2,
    left: -width * 0.1,
    width: width * 1.2,
    height: height * 0.55,
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
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  logoContainer: {
    padding: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 100,
    marginBottom: spacing.lg,
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
  },
  logoImage: {
    width: 60,
    height: 60,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    color: colors.surface,
    marginBottom: spacing.xs,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },
  cardsContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 20,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  cardIcon: {
    fontSize: 24,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  footer: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  primaryButton: {
    height: 56,
    borderRadius: 16,
    ...shadows.md,
  },
  secondaryButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 0,
    ...shadows.sm,
  },
});
