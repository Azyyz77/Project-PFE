import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated, StatusBar, Dimensions, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { colors, spacing, shadows } from '../styles/theme';
import SimpleSidebar from '../components/SimpleSidebar';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const { vehicles, appointments, notifications, loadBookingData } = useData();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const insets = useSafeAreaInsets();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 40, friction: 6, useNativeDriver: true }),
    ]).start();
  }, []);

  const shortcuts = [
    { id: 'Vehicles', title: 'Véhicules', icon: 'car-outline', color: '#3B82F6', bg: '#EFF6FF', screen: 'Vehicles' },
    { id: 'Appointments', title: 'Rendez-vous', icon: 'calendar-outline', color: '#EF4444', bg: '#FEF2F2', screen: 'Appointments' },
    { id: 'Complaints', title: 'Réclamations', icon: 'warning-outline', color: '#F97316', bg: '#FFF7ED', screen: 'Complaints' },
    { id: 'RepairOrders', title: 'Commandes', icon: 'bag-handle-outline', color: '#10B981', bg: '#ECFDF5', screen: 'RepairOrders' },
    { id: 'Invoices', title: 'Factures', icon: 'document-text-outline', color: '#A855F7', bg: '#FAF5FF', screen: 'Invoices' },
    { id: 'Assurances', title: 'Assurances', icon: 'shield-checkmark-outline', color: '#3B82F6', bg: '#EFF6FF', screen: 'Assurances' },
  ];

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F6F9" />
      
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => setSidebarVisible(true)}>
            <View style={styles.avatarWrap}>
              <Image source={require('../../assets/icon.png')} style={styles.avatarImg} />
            </View>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>STA Premium Service</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Notifications')}>
            <Ionicons name="notifications-outline" size={20} color="#111827" />
            {notifications.filter((n: any) => !n.lu).length > 0 && <View style={styles.notifDot} />}
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="search-outline" size={20} color="#111827" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          
          {/* Quick Search & Actions Card */}
          <View style={styles.searchCard}>
            <View style={styles.searchInputArea}>
              <View style={styles.searchAvatarWrap}>
                <Image source={require('../../assets/icon.png')} style={styles.searchAvatarImg} />
              </View>
              <View style={styles.searchPlaceholderBox}>
                <Text style={styles.searchPlaceholderText}>Quel service recherchez-vous ?</Text>
              </View>
            </View>
            
            <View style={styles.searchActionsContainer}>
              <TouchableOpacity 
                style={styles.searchActionBtn}
                onPress={() => { loadBookingData(); navigation.navigate('BookAppointmentStep1'); }}>
                <Feather name="calendar" size={18} color="#111827" />
                <Text style={styles.searchActionText}>Prendre RDV</Text>
              </TouchableOpacity>
              
              <View style={styles.verticalDivider} />
              
              <TouchableOpacity 
                style={styles.searchActionBtn}
                onPress={() => navigation.navigate('AddVehicle')}>
                <Ionicons name="car-outline" size={20} color="#111827" />
                <Text style={styles.searchActionText}>Ajouter véhicule</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Mes Véhicules */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mes Véhicules</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Vehicles')}>
              <Text style={styles.seeAllText}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.vehiclesScroll}
          >
            {vehicles.length > 0 ? vehicles.map((v: any, index: number) => (
              <View key={index} style={styles.vehicleCard}>
                <View style={styles.vehicleImagePlaceholder}>
                  <Ionicons name="car" size={60} color="#E5E7EB" />
                  <View style={styles.optimalBadge}>
                    <Text style={styles.optimalBadgeText}>ÉTAT OPTIMAL</Text>
                  </View>
                </View>
                <View style={styles.vehicleInfo}>
                  <Text style={styles.vehicleName}>{v.marque} {v.modele}</Text>
                  <Text style={styles.vehicleSub}>Immat : {v.immatriculation}</Text>
                </View>
              </View>
            )) : (
              <TouchableOpacity 
                style={[styles.vehicleCard, styles.emptyVehicleCard]}
                onPress={() => navigation.navigate('AddVehicle')}>
                <View style={styles.emptyVehicleIconWrap}>
                  <Ionicons name="add" size={32} color={colors.primary} />
                </View>
                <Text style={styles.vehicleName}>Ajouter un véhicule</Text>
                <Text style={styles.vehicleSub}>Enregistrez votre voiture</Text>
              </TouchableOpacity>
            )}
          </ScrollView>

          {/* Raccourcis */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Raccourcis</Text>
          </View>
          
          <View style={styles.shortcutsGrid}>
            {shortcuts.map((s, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.shortcutCard}
                onPress={() => navigation.navigate(s.screen)}>
                <View style={[styles.shortcutIconWrap, { backgroundColor: s.bg }]}>
                  <Ionicons name={s.icon as any} size={24} color={s.color} />
                </View>
                <Text style={styles.shortcutText}>{s.title}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Support Card */}
          <View style={styles.supportCard}>
            <View style={styles.supportHeaderRow}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={styles.supportTitle}>Besoin d'assistance ?</Text>
                <Text style={styles.supportDesc}>
                  Nos experts STA sont disponibles 24/7 pour vous accompagner dans vos démarches.
                </Text>
              </View>
              <View style={styles.headsetWrap}>
                <Ionicons name="headset" size={24} color="#111827" />
              </View>
            </View>
            
            <View style={styles.supportButtonsRow}>
              <TouchableOpacity style={styles.callBtn}>
                <Ionicons name="call-outline" size={18} color="#111827" style={{ marginRight: 8 }} />
                <Text style={styles.callBtnText}>Appeler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.chatBtn} onPress={() => navigation.navigate('Chatbot')}>
                <Ionicons name="chatbubble-ellipses-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.chatBtnText}>Chat Live</Text>
              </TouchableOpacity>
            </View>
          </View>

        </Animated.View>
      </ScrollView>

      <SimpleSidebar
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        navigation={navigation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F4F6F9', // Light gray/blue matching the image
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    marginRight: 10,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    backgroundColor: '#D1D5DB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  
  // Search Card
  searchCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    ...shadows.sm,
  },
  searchInputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchAvatarWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    marginRight: 12,
  },
  searchAvatarImg: {
    width: '100%',
    height: '100%',
    backgroundColor: '#D1D5DB',
  },
  searchPlaceholderBox: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  searchPlaceholderText: {
    color: '#6B7280',
    fontSize: 14,
  },
  searchActionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
  },
  searchActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  searchActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  verticalDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E5E7EB',
  },

  // Sections
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },

  // Vehicles
  vehiclesScroll: {
    paddingBottom: 10,
    gap: 16,
  },
  vehicleCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: width * 0.75,
    overflow: 'hidden',
    ...shadows.sm,
  },
  emptyVehicleCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    minHeight: 180,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#F3F4F6',
    borderStyle: 'dashed',
  },
  emptyVehicleIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  vehicleImagePlaceholder: {
    height: 140,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  optimalBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  optimalBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: 0.5,
  },
  vehicleInfo: {
    padding: 16,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  vehicleSub: {
    fontSize: 13,
    color: '#6B7280',
  },

  // Shortcuts
  shortcutsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  shortcutCard: {
    width: '31%', // 3 columns
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
    ...shadows.sm,
  },
  shortcutIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  shortcutText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },

  // Support Card
  supportCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    ...shadows.sm,
  },
  supportHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  supportTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  supportDesc: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 20,
  },
  headsetWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  supportButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  callBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#EEF2F6',
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  chatBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#000',
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});
