import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Modal,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import api from './src/config/api';
import { User } from './src/types';

type Screen = 'login' | 'register' | 'forgotPassword' | 'home' | 'vehicles' | 'appointments' | 'profile' | 'bookAppointment' | 'addVehicle' | 'complaints' | 'orders' | 'notifications' | 'appointmentFeedback';

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  
  // Form states for booking appointment
  const [agencies, setAgencies] = useState<any[]>([]);
  const [interventions, setInterventions] = useState<any[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [selectedAgencyId, setSelectedAgencyId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedInterventionId, setSelectedInterventionId] = useState('');
  const [appointmentNotes, setAppointmentNotes] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  
  // Form states for adding vehicle (using version catalog)
  const [brands, setBrands] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]); // This will store the full versions catalog
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [selectedModelName, setSelectedModelName] = useState('');
  const [selectedVersionId, setSelectedVersionId] = useState('');
  const [immatriculation, setImmatriculation] = useState('');
  const [annee, setAnnee] = useState('');
  const [kilometrage, setKilometrage] = useState('');
  const [couleur, setCouleur] = useState('');
  const [numeroSerie, setNumeroSerie] = useState('');
  
  // Form states for complaint
  const [complaintSubject, setComplaintSubject] = useState('');
  const [complaintDescription, setComplaintDescription] = useState('');
  
  // Feedback states
  const [selectedAppointmentForFeedback, setSelectedAppointmentForFeedback] = useState<any>(null);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');

  // Register form states
  const [registerNom, setRegisterNom] = useState('');
  const [registerPrenom, setRegisterPrenom] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerTelephone, setRegisterTelephone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');

  // Forgot password states
  const [forgotPasswordStep, setForgotPasswordStep] = useState<1 | 2 | 3>(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const checkAuth = async () => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      const userStr = await SecureStore.getItemAsync('user');
      
      if (token && userStr) {
        setToken(token);
        setUser(JSON.parse(userStr));
        setCurrentScreen('home');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setChecking(false);
    }
  };

  const loadUserData = async () => {
    setLoadingData(true);
    try {
      console.log('Loading data for user:', user?.id);
      
      // Load vehicles - extract from nested structure
      try {
        const vehiclesRes = await api.get(`/vehicles/user/${user?.id}`);
        console.log('Vehicles response:', vehiclesRes.data);
        const vehiclesData = vehiclesRes.data.vehicles || vehiclesRes.data;
        setVehicles(Array.isArray(vehiclesData) ? vehiclesData : []);
      } catch (vehicleError: any) {
        console.error('Vehicle error:', vehicleError.response?.status, vehicleError.response?.data);
        setVehicles([]);
      }

      // Load appointments - extract from nested structure
      try {
        const appointmentsRes = await api.get('/appointments/my');
        console.log('Appointments response:', appointmentsRes.data);
        const appointmentsData = appointmentsRes.data.appointments || appointmentsRes.data;
        setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
      } catch (aptError: any) {
        console.error('Appointment error:', aptError.response?.status, aptError.response?.data);
        setAppointments([]);
      }
      
      // Load complaints
      try {
        const complaintsRes = await api.get('/complaints/my-complaints');
        const complaintsData = complaintsRes.data;
        setComplaints(Array.isArray(complaintsData) ? complaintsData : []);
      } catch (error: any) {
        console.error('Complaints error:', error);
        setComplaints([]);
      }
      
      // Load orders
      try {
        const ordersRes = await api.get('/client/orders');
        const ordersData = ordersRes.data.orders || ordersRes.data;
        setOrders(Array.isArray(ordersData) ? ordersData : []);
      } catch (error: any) {
        console.error('Orders error:', error);
        setOrders([]);
      }
      
      // Load notifications
      try {
        const notificationsRes = await api.get('/notifications');
        const notificationsData = notificationsRes.data.notifications || notificationsRes.data;
        setNotifications(Array.isArray(notificationsData) ? notificationsData : []);
      } catch (error: any) {
        console.error('Notifications error:', error);
        setNotifications([]);
      }
    } catch (error: any) {
      console.error('Failed to load user data:', error.response?.data || error.message);
      Alert.alert('Erreur', 'Impossible de charger les données');
    } finally {
      setLoadingData(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/users/login', { email, password });
      const { token, user: userData } = response.data;
      
      await SecureStore.setItemAsync('authToken', token);
      await SecureStore.setItemAsync('user', JSON.stringify(userData));
      
      setToken(token);
      setUser(userData);
      setCurrentScreen('home');
    } catch (error: any) {
      Alert.alert(
        'Erreur',
        error.response?.data?.message || 'Échec de la connexion'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!registerNom || !registerPrenom || !registerEmail || !registerTelephone || !registerPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    if (registerPassword.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);
    try {
      await api.post('/users/register', {
        nom: registerNom,
        prenom: registerPrenom,
        email: registerEmail,
        telephone: registerTelephone,
        password: registerPassword,
      });
      
      Alert.alert('Succès', 'Compte créé avec succès! Vous pouvez maintenant vous connecter.', [
        { text: 'OK', onPress: () => setCurrentScreen('login') }
      ]);
      
      // Reset form
      setRegisterNom('');
      setRegisterPrenom('');
      setRegisterEmail('');
      setRegisterTelephone('');
      setRegisterPassword('');
      setRegisterConfirmPassword('');
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Échec de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordStep1 = async () => {
    if (!forgotEmail) {
      Alert.alert('Erreur', 'Veuillez entrer votre email');
      return;
    }

    setLoading(true);
    try {
      await api.post('/users/forgot-password', { email: forgotEmail });
      Alert.alert('Succès', 'Un code OTP a été envoyé sur votre WhatsApp');
      setForgotPasswordStep(2);
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.error || 'Impossible d\'envoyer le code OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      Alert.alert('Erreur', 'Veuillez entrer le code OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/users/verify-otp', { 
        email: forgotEmail, 
        otp 
      });
      setResetToken(response.data.resetToken);
      Alert.alert('Succès', 'Code vérifié! Vous pouvez maintenant réinitialiser votre mot de passe');
      setForgotPasswordStep(3);
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.error || 'Code OTP invalide');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmNewPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);
    try {
      await api.post('/users/reset-password', {
        resetToken,
        newPassword,
      });
      
      Alert.alert('Succès', 'Mot de passe réinitialisé avec succès!', [
        { 
          text: 'OK', 
          onPress: () => {
            // Reset forgot password form
            setForgotPasswordStep(1);
            setForgotEmail('');
            setOtp('');
            setResetToken('');
            setNewPassword('');
            setConfirmNewPassword('');
            setCurrentScreen('login');
          }
        }
      ]);
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.error || 'Impossible de réinitialiser le mot de passe');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('authToken');
    await SecureStore.deleteItemAsync('user');
    setToken(null);
    setUser(null);
    setEmail('');
    setPassword('');
    setCurrentScreen('login');
    setVehicles([]);
    setAppointments([]);
    setComplaints([]);
    setOrders([]);
    setNotifications([]);
  };
  
  const loadBookingData = async () => {
    if (!token) return;
    try {
      const [agenciesRes, interventionsRes, versionsRes] = await Promise.all([
        api.get('/appointments/agencies'),
        api.get('/appointments/interventions'),
        api.get('/vehicles/catalog/versions')
      ]);
      
      // Extract data from nested responses
      setAgencies(agenciesRes.data.agencies || agenciesRes.data);
      setInterventions(interventionsRes.data.interventions || interventionsRes.data);
      
      // Extract brands from versions catalog
      const versions = versionsRes.data.versions || versionsRes.data;
      const uniqueBrands = Array.from(
        new Set(versions.map((v: any) => JSON.stringify({ id: v.marque_id, nom: v.marque_nom })))
      ).map((str: any) => JSON.parse(str));
      setBrands(uniqueBrands);
      
      // Store full versions catalog for filtering models
      setModels(versions);
    } catch (error: any) {
      console.error('Failed to load booking data:', error);
      Alert.alert('Erreur', 'Impossible de charger les données de réservation');
    }
  };
  
  const loadAvailableSlots = async (agencyId: string, date: string) => {
    if (!agencyId || !date) return;
    
    setLoadingSlots(true);
    try {
      const response = await api.get('/appointments/slots', {
        params: { agenceId: agencyId, date: date }
      });
      const slots = response.data.slots || response.data;
      setAvailableSlots(Array.isArray(slots) ? slots : []);
    } catch (error: any) {
      console.error('Failed to load slots:', error);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };
  
  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(dateStr);
    setSelectedTime('');
    setShowCalendar(false);
    
    if (selectedAgencyId) {
      loadAvailableSlots(selectedAgencyId, dateStr);
    }
  };
  
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days: Array<{ date: Date | null; dateStr: string | null; day: number | null }> = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ date: null, dateStr: null, day: null });
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      days.push({ date, dateStr, day });
    }
    
    return days;
  };
  
  const isDateInPast = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };
  
  const handleBookAppointment = async () => {
    if (!selectedVehicleId || !selectedAgencyId || !selectedDate || !selectedTime || !selectedInterventionId) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    setLoading(true);
    try {
      const dateTime = `${selectedDate}T${selectedTime}:00`;
      await api.post('/appointments', {
        vehicule_id: Number(selectedVehicleId),
        agence_id: Number(selectedAgencyId),
        date_heure: dateTime,
        description: appointmentNotes || undefined,
        sous_type_ids: [Number(selectedInterventionId)]
      });
      
      Alert.alert('Succès', 'Rendez-vous réservé avec succès');
      setCurrentScreen('appointments');
      loadUserData();
      // Reset form
      setSelectedVehicleId('');
      setSelectedAgencyId('');
      setSelectedDate('');
      setSelectedTime('');
      setSelectedInterventionId('');
      setAppointmentNotes('');
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Impossible de réserver le rendez-vous');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddVehicle = async () => {
    // Validate all required fields
    const errors: string[] = [];
    
    if (!selectedBrandId) {
      errors.push('• Veuillez sélectionner une marque');
    }
    if (!selectedModelName) {
      errors.push('• Veuillez sélectionner un modèle');
    }
    if (!selectedVersionId) {
      errors.push('• Veuillez sélectionner une version');
    }
    if (!immatriculation.trim()) {
      errors.push('• L\'immatriculation est obligatoire');
    }
    if (!numeroSerie.trim()) {
      errors.push('• Le numéro de châssis est obligatoire');
    }
    if (!annee.trim()) {
      errors.push('• L\'année est obligatoire');
    }
    
    if (errors.length > 0) {
      Alert.alert('Champs manquants', errors.join('\n'));
      return;
    }
    
    // Validate immatriculation format
    const tunisRegex = /^(\d{1,3})\s*تونس\s*(\d{1,3})$/u;
    const ntRegex = /^(\d{1,5})\s*ن\.ت$/u;
    const trimmedImmat = immatriculation.trim();
    
    if (!tunisRegex.test(trimmedImmat) && !ntRegex.test(trimmedImmat)) {
      Alert.alert(
        'Format d\'immatriculation invalide',
        'L\'immatriculation doit être au format:\n\n' +
        '• Tunis: "123 تونس 456"\n' +
        '  (1 à 3 chiffres, تونس, 1 à 3 chiffres)\n\n' +
        '• NT: "12345 ن.ت"\n' +
        '  (1 à 5 chiffres, ن.ت)\n\n' +
        'Utilisez les boutons "+ تونس" ou "+ ن.ت" pour faciliter la saisie.'
      );
      return;
    }
    
    // Validate numero_chassis length
    if (numeroSerie.trim().length > 17) {
      Alert.alert('Numéro de châssis invalide', 'Le numéro de châssis ne doit pas dépasser 17 caractères.');
      return;
    }
    
    // Validate annee
    const yearNum = Number(annee);
    if (isNaN(yearNum) || yearNum < 1950 || yearNum > 2100) {
      Alert.alert('Année invalide', 'L\'année doit être entre 1950 et 2100.');
      return;
    }
    
    // Validate couleur length if provided
    if (couleur && couleur.trim().length > 50) {
      Alert.alert('Couleur invalide', 'La couleur ne doit pas dépasser 50 caractères.');
      return;
    }
    
    setLoading(true);
    try {
      await api.post('/vehicles', {
        version_id: Number(selectedVersionId),
        immatriculation: trimmedImmat,
        numero_chassis: numeroSerie.trim(),
        annee: yearNum,
        couleur: couleur ? couleur.trim() : undefined
      });
      
      Alert.alert(
        'Succès', 
        'Véhicule ajouté avec succès!\n\nIl sera visible après validation par un agent SAV.',
        [{ text: 'OK', onPress: () => setCurrentScreen('vehicles') }]
      );
      loadUserData();
      // Reset form
      setSelectedBrandId('');
      setSelectedModelName('');
      setSelectedVersionId('');
      setImmatriculation('');
      setAnnee('');
      setKilometrage('');
      setCouleur('');
      setNumeroSerie('');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Impossible d\'ajouter le véhicule';
      Alert.alert('Erreur', errorMsg);
      console.error('Add vehicle error:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateComplaint = async () => {
    if (!complaintSubject || !complaintDescription) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    
    setLoading(true);
    try {
      await api.post('/complaints', {
        sujet: complaintSubject,
        description: complaintDescription
      });
      
      Alert.alert('Succès', 'Réclamation créée avec succès');
      setCurrentScreen('complaints');
      loadUserData();
      // Reset form
      setComplaintSubject('');
      setComplaintDescription('');
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Impossible de créer la réclamation');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmitFeedback = async () => {
    if (feedbackRating === 0) {
      Alert.alert('Erreur', 'Veuillez sélectionner une note');
      return;
    }
    
    if (!selectedAppointmentForFeedback) return;
    
    setLoading(true);
    try {
      await api.post(`/appointments/${selectedAppointmentForFeedback.id}/feedback`, {
        note: feedbackRating,
        commentaire: feedbackComment || undefined
      });
      
      Alert.alert('Succès', 'Merci pour votre feedback!');
      setCurrentScreen('appointments');
      loadUserData();
      // Reset form
      setSelectedAppointmentForFeedback(null);
      setFeedbackRating(0);
      setFeedbackComment('');
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || error.response?.data?.error || 'Impossible de soumettre le feedback');
    } finally {
      setLoading(false);
    }
  };
  
  const handleMarkNotificationAsRead = async (notificationId: number) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      // Update local state
      setNotifications(notifications.map((n: any) => 
        n.id === notificationId ? { ...n, lu: true } : n
      ));
    } catch (error: any) {
      console.error('Failed to mark notification as read:', error);
    }
  };
  
  const handleMarkAllNotificationsAsRead = async () => {
    try {
      await api.put('/notifications/mark-all-read');
      // Update local state
      setNotifications(notifications.map((n: any) => ({ ...n, lu: true })));
      Alert.alert('Succès', 'Toutes les notifications ont été marquées comme lues');
    } catch (error: any) {
      Alert.alert('Erreur', 'Impossible de marquer les notifications comme lues');
    }
  };

  if (checking) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Login Screen
  if (currentScreen === 'login') {
    return (
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Chery Service</Text>
          <Text style={styles.subtitle}>Connexion</Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Se connecter</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.forgotPasswordLink}
            onPress={() => setCurrentScreen('forgotPassword')}
          >
            <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.registerLink}
            onPress={() => setCurrentScreen('register')}
          >
            <Text style={styles.registerLinkText}>
              Pas de compte ? <Text style={styles.registerLinkTextBold}>S'inscrire</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // Register Screen
  if (currentScreen === 'register') {
    return (
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Chery Service</Text>
          <Text style={styles.subtitle}>Créer un compte</Text>

          <TextInput
            style={styles.input}
            placeholder="Nom"
            value={registerNom}
            onChangeText={setRegisterNom}
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Prénom"
            value={registerPrenom}
            onChangeText={setRegisterPrenom}
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={registerEmail}
            onChangeText={setRegisterEmail}
            keyboardType="email-address"
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Téléphone"
            value={registerTelephone}
            onChangeText={setRegisterTelephone}
            keyboardType="phone-pad"
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Mot de passe (min. 6 caractères)"
            value={registerPassword}
            onChangeText={setRegisterPassword}
            secureTextEntry
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Confirmer le mot de passe"
            value={registerConfirmPassword}
            onChangeText={setRegisterConfirmPassword}
            secureTextEntry
            editable={!loading}
          />

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>S'inscrire</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.registerLink}
            onPress={() => setCurrentScreen('login')}
          >
            <Text style={styles.registerLinkText}>
              Déjà un compte ? <Text style={styles.registerLinkTextBold}>Se connecter</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // Forgot Password Screen
  if (currentScreen === 'forgotPassword') {
    return (
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity 
            style={styles.backButtonContainer}
            onPress={() => {
              setCurrentScreen('login');
              setForgotPasswordStep(1);
              setForgotEmail('');
              setOtp('');
              setResetToken('');
              setNewPassword('');
              setConfirmNewPassword('');
            }}
          >
            <Text style={styles.backButtonText}>← Retour</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Mot de passe oublié</Text>
          <Text style={styles.subtitle}>
            {forgotPasswordStep === 1 && 'Entrez votre email'}
            {forgotPasswordStep === 2 && 'Vérifiez votre WhatsApp'}
            {forgotPasswordStep === 3 && 'Nouveau mot de passe'}
          </Text>

          {/* Step Indicator */}
          <View style={styles.stepIndicator}>
            <View style={[styles.stepDot, forgotPasswordStep >= 1 && styles.stepDotActive]}>
              <Text style={styles.stepDotText}>1</Text>
            </View>
            <View style={[styles.stepLine, forgotPasswordStep >= 2 && styles.stepLineActive]} />
            <View style={[styles.stepDot, forgotPasswordStep >= 2 && styles.stepDotActive]}>
              <Text style={styles.stepDotText}>2</Text>
            </View>
            <View style={[styles.stepLine, forgotPasswordStep >= 3 && styles.stepLineActive]} />
            <View style={[styles.stepDot, forgotPasswordStep >= 3 && styles.stepDotActive]}>
              <Text style={styles.stepDotText}>3</Text>
            </View>
          </View>

          {/* Step 1: Enter Email */}
          {forgotPasswordStep === 1 && (
            <>
              <Text style={styles.helpText}>
                Nous vous enverrons un code de vérification sur votre WhatsApp
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={forgotEmail}
                onChangeText={setForgotEmail}
                keyboardType="email-address"
                editable={!loading}
              />
              <TouchableOpacity 
                style={[styles.button, loading && styles.buttonDisabled]} 
                onPress={handleForgotPasswordStep1}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Envoyer le code</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {/* Step 2: Verify OTP */}
          {forgotPasswordStep === 2 && (
            <>
              <Text style={styles.helpText}>
                Entrez le code à 6 chiffres envoyé sur votre WhatsApp
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Code OTP (6 chiffres)"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
                editable={!loading}
              />
              <TouchableOpacity 
                style={[styles.button, loading && styles.buttonDisabled]} 
                onPress={handleVerifyOtp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Vérifier le code</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.resendLink}
                onPress={handleForgotPasswordStep1}
                disabled={loading}
              >
                <Text style={styles.resendLinkText}>Renvoyer le code</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Step 3: Reset Password */}
          {forgotPasswordStep === 3 && (
            <>
              <Text style={styles.helpText}>
                Choisissez un nouveau mot de passe sécurisé
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Nouveau mot de passe (min. 6 caractères)"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                editable={!loading}
              />
              <TextInput
                style={styles.input}
                placeholder="Confirmer le mot de passe"
                value={confirmNewPassword}
                onChangeText={setConfirmNewPassword}
                secureTextEntry
                editable={!loading}
              />
              <TouchableOpacity 
                style={[styles.button, loading && styles.buttonDisabled]} 
                onPress={handleResetPassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Réinitialiser</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // Home Screen
  if (currentScreen === 'home') {
    const unreadNotifications = notifications.filter((n: any) => !n.lu).length;
    const today = new Date();
    const dateStr = today.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

    return (
      <View style={styles.container}>
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {/* Modern Welcome Banner */}
          <View style={styles.modernBanner}>
            <View style={styles.bannerContent}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>
                  {user?.prenom?.[0]}{user?.nom?.[0]}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.bannerGreeting}>Bienvenue, {user?.prenom}! 👋</Text>
                <Text style={styles.bannerSubtext}>Gérez vos véhicules et rendez-vous</Text>
              </View>
            </View>
            
            {/* Quick Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{vehicles.length}</Text>
                <Text style={styles.statLabel}>Véhicules</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{appointments.length}</Text>
                <Text style={styles.statLabel}>RDV</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{unreadNotifications}</Text>
                <Text style={styles.statLabel}>Notifications</Text>
              </View>
            </View>
          </View>

          <View style={{ padding: 20 }}>
            {/* Quick Action Cards */}
            <View style={styles.actionCardsContainer}>
              <TouchableOpacity 
                style={[styles.actionCard, { backgroundColor: '#10B981' }]}
                onPress={() => {
                  loadBookingData();
                  setCurrentScreen('bookAppointment');
                }}
              >
                <Text style={styles.actionCardIcon}>📅</Text>
                <Text style={styles.actionCardTitle}>Réserver un RDV</Text>
                <Text style={styles.actionCardSubtitle}>Planifiez votre service</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionCard, { backgroundColor: '#3B82F6' }]}
                onPress={() => {
                  loadBookingData();
                  setCurrentScreen('addVehicle');
                }}
              >
                <Text style={styles.actionCardIcon}>🚗</Text>
                <Text style={styles.actionCardTitle}>Ajouter véhicule</Text>
                <Text style={styles.actionCardSubtitle}>Enregistrez un nouveau</Text>
              </TouchableOpacity>
            </View>

            {/* Service Menu Grid */}
            <Text style={styles.sectionTitle}>Services</Text>
            <View style={styles.serviceGrid}>
              <TouchableOpacity
                style={styles.serviceCard}
                onPress={() => setCurrentScreen('vehicles')}
              >
                <View style={[styles.serviceIconContainer, { backgroundColor: '#EDE9FE' }]}>
                  <Text style={styles.serviceIcon}>🚗</Text>
                </View>
                <Text style={styles.serviceTitle}>Véhicules</Text>
                <Text style={styles.serviceCount}>{vehicles.length}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.serviceCard}
                onPress={() => setCurrentScreen('appointments')}
              >
                <View style={[styles.serviceIconContainer, { backgroundColor: '#DBEAFE' }]}>
                  <Text style={styles.serviceIcon}>📅</Text>
                </View>
                <Text style={styles.serviceTitle}>Rendez-vous</Text>
                <Text style={styles.serviceCount}>{appointments.length}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.serviceCard}
                onPress={() => setCurrentScreen('complaints')}
              >
                <View style={[styles.serviceIconContainer, { backgroundColor: '#FEF3C7' }]}>
                  <Text style={styles.serviceIcon}>📝</Text>
                </View>
                <Text style={styles.serviceTitle}>Réclamations</Text>
                <Text style={styles.serviceCount}>{complaints.length}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.serviceCard}
                onPress={() => setCurrentScreen('orders')}
              >
                <View style={[styles.serviceIconContainer, { backgroundColor: '#D1FAE5' }]}>
                  <Text style={styles.serviceIcon}>🔧</Text>
                </View>
                <Text style={styles.serviceTitle}>Commandes</Text>
                <Text style={styles.serviceCount}>{orders.length}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.serviceCard}
                onPress={() => setCurrentScreen('notifications')}
              >
                <View style={[styles.serviceIconContainer, { backgroundColor: '#FED7AA' }]}>
                  <Text style={styles.serviceIcon}>🔔</Text>
                  {unreadNotifications > 0 && (
                    <View style={styles.notificationBadge}>
                      <Text style={styles.notificationBadgeText}>{unreadNotifications}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.serviceTitle}>Notifications</Text>
                <Text style={styles.serviceCount}>{notifications.length}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.serviceCard}
                onPress={() => setCurrentScreen('profile')}
              >
                <View style={[styles.serviceIconContainer, { backgroundColor: '#E0E7FF' }]}>
                  <Text style={styles.serviceIcon}>👤</Text>
                </View>
                <Text style={styles.serviceTitle}>Profil</Text>
                <Text style={styles.serviceCount}>—</Text>
              </TouchableOpacity>
            </View>

            {/* Logout Button */}
            <TouchableOpacity style={styles.modernLogoutButton} onPress={handleLogout}>
              <Text style={styles.modernLogoutText}>🚪 Déconnexion</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Vehicles Screen
  if (currentScreen === 'vehicles') {
    return (
      <View style={styles.container}>
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => setCurrentScreen('home')}>
            <Text style={styles.backButton}>← Retour</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mes Véhicules</Text>
          <TouchableOpacity onPress={loadUserData} disabled={loadingData}>
            <Text style={styles.backButton}>🔄</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollContent}>
          {loadingData ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={styles.emptyText}>Chargement...</Text>
            </View>
          ) : vehicles.length === 0 ? (
            <View style={styles.modernEmptyState}>
              <View style={styles.emptyIconCircle}>
                <Text style={styles.emptyIcon}>🚗</Text>
              </View>
              <Text style={styles.emptyTitle}>Aucun véhicule</Text>
              <Text style={styles.emptySubtitle}>Ajoutez votre premier véhicule pour commencer</Text>
              <TouchableOpacity 
                style={styles.modernButton} 
                onPress={() => {
                  loadBookingData();
                  setCurrentScreen('addVehicle');
                }}
              >
                <Text style={styles.modernButtonText}>+ Ajouter un véhicule</Text>
              </TouchableOpacity>
            </View>
          ) : (
            vehicles.map((vehicle, index) => (
              <View key={index} style={styles.modernCard}>
                <View style={styles.vehicleCardHeader}>
                  <View style={styles.vehicleIconCircle}>
                    <Text style={styles.vehicleIcon}>🚗</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.vehicleCardTitle}>
                      {vehicle.marque} {vehicle.modele}
                    </Text>
                    <View style={styles.vehicleBadgeRow}>
                      {vehicle.annee && (
                        <View style={styles.vehicleBadge}>
                          <Text style={styles.vehicleBadgeText}>{vehicle.annee}</Text>
                        </View>
                      )}
                      {vehicle.couleur && (
                        <View style={styles.vehicleBadge}>
                          <Text style={styles.vehicleBadgeText}>{vehicle.couleur}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
                <View style={styles.vehicleCardDetails}>
                  <View style={styles.vehicleDetailRow}>
                    <Text style={styles.vehicleDetailLabel}>📋 Immatriculation</Text>
                    <Text style={styles.vehicleDetailValue}>{vehicle.immatriculation}</Text>
                  </View>
                  {vehicle.kilometrage && (
                    <View style={styles.vehicleDetailRow}>
                      <Text style={styles.vehicleDetailLabel}>🛣️ Kilométrage</Text>
                      <Text style={styles.vehicleDetailValue}>{vehicle.kilometrage} km</Text>
                    </View>
                  )}
                  {vehicle.numero_chassis && (
                    <View style={styles.vehicleDetailRow}>
                      <Text style={styles.vehicleDetailLabel}>🔢 Châssis</Text>
                      <Text style={styles.vehicleDetailValue}>{vehicle.numero_chassis}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    );
  }

  // Appointments Screen
  if (currentScreen === 'appointments') {
    return (
      <View style={styles.container}>
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => setCurrentScreen('home')}>
            <Text style={styles.backButton}>← Retour</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Rendez-vous</Text>
          <TouchableOpacity onPress={loadUserData} disabled={loadingData}>
            <Text style={styles.backButton}>🔄</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollContent}>
          {loadingData ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={styles.emptyText}>Chargement...</Text>
            </View>
          ) : appointments.length === 0 ? (
            <View style={styles.modernEmptyState}>
              <View style={styles.emptyIconCircle}>
                <Text style={styles.emptyIcon}>📅</Text>
              </View>
              <Text style={styles.emptyTitle}>Aucun rendez-vous</Text>
              <Text style={styles.emptySubtitle}>Réservez votre premier rendez-vous de service</Text>
              <TouchableOpacity 
                style={styles.modernButton} 
                onPress={() => {
                  loadBookingData();
                  setCurrentScreen('bookAppointment');
                }}
              >
                <Text style={styles.modernButtonText}>+ Réserver un RDV</Text>
              </TouchableOpacity>
            </View>
          ) : (
            appointments.map((apt, index) => {
              const aptDate = apt.date_heure ? new Date(apt.date_heure) : null;
              const statusColors: Record<string, { bg: string; text: string }> = {
                PLANIFIE: { bg: '#DBEAFE', text: '#1E40AF' },
                CONFIRME: { bg: '#DBEAFE', text: '#1E40AF' },
                EN_COURS: { bg: '#FEF3C7', text: '#92400E' },
                TERMINE: { bg: '#D1FAE5', text: '#065F46' },
                ANNULE: { bg: '#FEE2E2', text: '#991B1B' },
              };
              const statusStyle = statusColors[apt.statut] || statusColors.PLANIFIE;
              
              return (
                <View key={index} style={styles.modernCard}>
                  <View style={styles.appointmentHeader}>
                    <View style={styles.appointmentDateBox}>
                      <Text style={styles.appointmentDay}>
                        {aptDate ? aptDate.getDate() : '—'}
                      </Text>
                      <Text style={styles.appointmentMonth}>
                        {aptDate ? aptDate.toLocaleDateString('fr-FR', { month: 'short' }) : '—'}
                      </Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.appointmentTitle}>{apt.agence_nom}</Text>
                      <Text style={styles.appointmentTime}>
                        🕐 {aptDate ? aptDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : 'Heure non définie'}
                      </Text>
                    </View>
                    <View style={[styles.appointmentStatusBadge, { backgroundColor: statusStyle.bg }]}>
                      <Text style={[styles.appointmentStatusText, { color: statusStyle.text }]}>
                        {apt.statut}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.appointmentDetails}>
                    <View style={styles.appointmentDetailRow}>
                      <Text style={styles.appointmentDetailIcon}>🚗</Text>
                      <Text style={styles.appointmentDetailText}>
                        {apt.marque_nom} {apt.modele_nom} • {apt.immatriculation}
                      </Text>
                    </View>
                  </View>
                  
                  {apt.statut === 'TERMINE' && !apt.feedback_soumis && (
                    <TouchableOpacity
                      style={[styles.modernButton, { backgroundColor: '#F59E0B', marginTop: 12 }]}
                      onPress={() => {
                        setSelectedAppointmentForFeedback(apt);
                        setCurrentScreen('appointmentFeedback');
                      }}
                    >
                      <Text style={styles.modernButtonText}>⭐ Évaluer ce rendez-vous</Text>
                    </TouchableOpacity>
                  )}
                  
                  {apt.feedback_soumis && (
                    <View style={styles.feedbackSubmittedBadge}>
                      <Text style={styles.feedbackSubmittedText}>✓ Feedback soumis</Text>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </ScrollView>
      </View>
    );
  }

  // Profile Screen
  if (currentScreen === 'profile') {
    return (
      <View style={styles.container}>
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => setCurrentScreen('home')}>
            <Text style={styles.backButton}>← Retour</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mon Profil</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView style={styles.scrollContent}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>👤 Informations personnelles</Text>
            <Text style={styles.cardDetail}>Nom: {user?.nom}</Text>
            <Text style={styles.cardDetail}>Prénom: {user?.prenom}</Text>
            <Text style={styles.cardDetail}>Email: {user?.email}</Text>
            <Text style={styles.cardDetail}>Téléphone: {user?.telephone}</Text>
            <Text style={styles.cardDetail}>Rôle: {user?.role}</Text>
          </View>
        </ScrollView>
      </View>
    );
  }
  
  // Book Appointment Screen
  if (currentScreen === 'bookAppointment') {
    const validVehicles = vehicles.filter((v: any) => v.statut_validation === 'VALIDE');
    
    return (
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => setCurrentScreen('home')}>
            <Text style={styles.backButton}>← Retour</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Réserver un RDV</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView style={styles.scrollContent}>
          {validVehicles.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>⚠️</Text>
              <Text style={styles.emptyText}>Aucun véhicule validé</Text>
              <Text style={[styles.cardDetail, { textAlign: 'center', marginTop: 10 }]}>
                Vous devez avoir un véhicule validé pour réserver un rendez-vous
              </Text>
            </View>
          ) : (
            <View style={styles.formContainer}>
              <Text style={styles.formLabel}>Véhicule *</Text>
              <View style={styles.pickerContainer}>
                {validVehicles.map((vehicle: any) => (
                  <TouchableOpacity
                    key={vehicle.id}
                    style={[
                      styles.pickerOption,
                      selectedVehicleId === String(vehicle.id) && styles.pickerOptionSelected
                    ]}
                    onPress={() => setSelectedVehicleId(String(vehicle.id))}
                  >
                    <Text style={styles.pickerOptionText}>
                      {vehicle.marque} {vehicle.modele} - {vehicle.immatriculation}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.formLabel}>Agence *</Text>
              <View style={styles.pickerContainer}>
                {agencies.map((agency: any) => (
                  <TouchableOpacity
                    key={agency.id}
                    style={[
                      styles.pickerOption,
                      selectedAgencyId === String(agency.id) && styles.pickerOptionSelected
                    ]}
                    onPress={() => {
                      setSelectedAgencyId(String(agency.id));
                      // Reload slots if date is already selected
                      if (selectedDate) {
                        loadAvailableSlots(String(agency.id), selectedDate);
                      }
                    }}
                  >
                    <Text style={styles.pickerOptionText}>{agency.nom} - {agency.ville}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.formLabel}>Type d'intervention *</Text>
              <View style={styles.pickerContainer}>
                {interventions.map((type: any) => 
                  type.sous_types?.map((subType: any) => (
                    <TouchableOpacity
                      key={subType.id}
                      style={[
                        styles.pickerOption,
                        selectedInterventionId === String(subType.id) && styles.pickerOptionSelected
                      ]}
                      onPress={() => setSelectedInterventionId(String(subType.id))}
                    >
                      <Text style={styles.pickerOptionText}>
                        {type.nom} - {subType.nom}
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>

              <Text style={styles.formLabel}>Date *</Text>
              <TouchableOpacity
                style={[styles.input, { justifyContent: 'center' }]}
                onPress={() => setShowCalendar(true)}
              >
                <Text style={{ color: selectedDate ? '#333' : '#999' }}>
                  {selectedDate ? new Date(selectedDate + 'T12:00:00').toLocaleDateString('fr-FR') : 'Sélectionner une date'}
                </Text>
              </TouchableOpacity>

              {/* Custom Calendar Modal */}
              <Modal
                visible={showCalendar}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowCalendar(false)}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.calendarModal}>
                    <View style={styles.calendarHeader}>
                      <TouchableOpacity
                        onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                      >
                        <Text style={styles.calendarNavButton}>←</Text>
                      </TouchableOpacity>
                      <Text style={styles.calendarTitle}>
                        {currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                      </Text>
                      <TouchableOpacity
                        onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                      >
                        <Text style={styles.calendarNavButton}>→</Text>
                      </TouchableOpacity>
                    </View>
                    
                    <View style={styles.calendarWeekDays}>
                      {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map((day, i) => (
                        <Text key={i} style={styles.weekDayText}>{day}</Text>
                      ))}
                    </View>
                    
                    <View style={styles.calendarDays}>
                      {getDaysInMonth(currentMonth).map((item, index) => {
                        if (!item.date || !item.dateStr) {
                          return <View key={`empty-${index}`} style={styles.calendarDay} />;
                        }
                        
                        const isPast = isDateInPast(item.dateStr);
                        const isSelected = selectedDate === item.dateStr;
                        const isToday = item.dateStr === new Date().toISOString().split('T')[0];
                        
                        return (
                          <TouchableOpacity
                            key={item.dateStr}
                            style={[
                              styles.calendarDay,
                              isSelected && styles.calendarDaySelected,
                              isToday && !isSelected && styles.calendarDayToday,
                              isPast && styles.calendarDayDisabled
                            ]}
                            onPress={() => !isPast && handleDateSelect(item.dateStr!)}
                            disabled={isPast}
                          >
                            <Text style={[
                              styles.calendarDayText,
                              isSelected && styles.calendarDayTextSelected,
                              isPast && styles.calendarDayTextDisabled
                            ]}>
                              {item.day}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                    
                    <TouchableOpacity
                      style={styles.calendarCloseButton}
                      onPress={() => setShowCalendar(false)}
                    >
                      <Text style={styles.calendarCloseButtonText}>Fermer</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>

              {selectedDate && selectedAgencyId && (
                <>
                  <Text style={styles.formLabel}>Heure *</Text>
                  {loadingSlots ? (
                    <View style={{ padding: 20, alignItems: 'center' }}>
                      <ActivityIndicator size="small" color="#007AFF" />
                      <Text style={{ marginTop: 10, color: '#666' }}>Chargement des créneaux...</Text>
                    </View>
                  ) : availableSlots.length === 0 ? (
                    <View style={{ padding: 20, backgroundColor: '#FFF3CD', borderRadius: 8 }}>
                      <Text style={{ color: '#856404', textAlign: 'center' }}>
                        Aucun créneau disponible pour cette date
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.slotsContainer}>
                      {availableSlots.map((slot: any, index: number) => (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.slotButton,
                            slot.is_full && styles.slotButtonDisabled,
                            selectedTime === slot.label && styles.slotButtonSelected
                          ]}
                          onPress={() => !slot.is_full && setSelectedTime(slot.label)}
                          disabled={slot.is_full}
                        >
                          <Text style={[
                            styles.slotButtonText,
                            slot.is_full && styles.slotButtonTextDisabled,
                            selectedTime === slot.label && styles.slotButtonTextSelected
                          ]}>
                            {slot.label}
                          </Text>
                          {slot.is_full && (
                            <Text style={styles.slotFullText}>Complet</Text>
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </>
              )}

              <Text style={styles.formLabel}>Notes (optionnel)</Text>
              <TextInput
                style={[styles.input, { height: 80 }]}
                placeholder="Informations supplémentaires..."
                value={appointmentNotes}
                onChangeText={setAppointmentNotes}
                multiline
              />

              <TouchableOpacity 
                style={[styles.button, loading && styles.buttonDisabled]} 
                onPress={handleBookAppointment}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Réserver</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
  
  // Add Vehicle Screen
  if (currentScreen === 'addVehicle') {
    // Filter models based on selected brand
    const filteredModels = selectedBrandId
      ? Array.from(
          new Set(
            models
              .filter((v: any) => String(v.marque_id) === selectedBrandId)
              .map((v: any) => v.modele_nom)
          )
        )
      : [];
    
    // Filter versions based on selected brand and model
    const filteredVersions = selectedBrandId && selectedModelName
      ? models.filter(
          (v: any) => 
            String(v.marque_id) === selectedBrandId && 
            v.modele_nom === selectedModelName
        )
      : [];
    
    return (
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => setCurrentScreen('home')}>
            <Text style={styles.backButton}>← Retour</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ajouter un véhicule</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView style={styles.scrollContent}>
          <View style={styles.formContainer}>
            <View style={{ backgroundColor: '#FFF3CD', padding: 12, borderRadius: 8, marginBottom: 20 }}>
              <Text style={{ fontSize: 12, color: '#856404', fontWeight: '600' }}>
                ℹ️ Tous les champs marqués d'un astérisque (*) sont obligatoires
              </Text>
            </View>
            
            <Text style={[styles.formLabel, !selectedBrandId && { color: '#FF3B30' }]}>
              Marque * {!selectedBrandId && '(Requis)'}
            </Text>
            <View style={styles.pickerContainer}>
              {brands.map((brand: any) => (
                <TouchableOpacity
                  key={brand.id}
                  style={[
                    styles.pickerOption,
                    selectedBrandId === String(brand.id) && styles.pickerOptionSelected
                  ]}
                  onPress={() => {
                    setSelectedBrandId(String(brand.id));
                    setSelectedModelName('');
                    setSelectedVersionId('');
                  }}
                >
                  <Text style={styles.pickerOptionText}>{brand.nom}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {selectedBrandId && filteredModels.length > 0 && (
              <>
                <Text style={[styles.formLabel, !selectedModelName && { color: '#FF3B30' }]}>
                  Modèle * {!selectedModelName && '(Requis)'}
                </Text>
                <View style={styles.pickerContainer}>
                  {filteredModels.map((modelName: string, index: number) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.pickerOption,
                        selectedModelName === modelName && styles.pickerOptionSelected
                      ]}
                      onPress={() => {
                        setSelectedModelName(modelName);
                        setSelectedVersionId('');
                      }}
                    >
                      <Text style={styles.pickerOptionText}>{modelName}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {selectedModelName && filteredVersions.length > 0 && (
              <>
                <Text style={[styles.formLabel, !selectedVersionId && { color: '#FF3B30' }]}>
                  Version * {!selectedVersionId && '(Requis)'}
                </Text>
                <View style={styles.pickerContainer}>
                  {filteredVersions.map((version: any) => (
                    <TouchableOpacity
                      key={version.version_id}
                      style={[
                        styles.pickerOption,
                        selectedVersionId === String(version.version_id) && styles.pickerOptionSelected
                      ]}
                      onPress={() => setSelectedVersionId(String(version.version_id))}
                    >
                      <Text style={styles.pickerOptionText}>{version.version_nom}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            <Text style={[styles.formLabel, !immatriculation && { color: '#FF3B30' }]}>
              Immatriculation * {!immatriculation && '(Requis)'}
            </Text>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
              <TouchableOpacity
                style={[styles.button, { flex: 1, backgroundColor: '#2196F3', paddingVertical: 10 }]}
                onPress={() => setImmatriculation(' تونس ')}
              >
                <Text style={[styles.buttonText, { fontSize: 14 }]}>+ تونس</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { flex: 1, backgroundColor: '#2196F3', paddingVertical: 10 }]}
                onPress={() => setImmatriculation(' ن.ت')}
              >
                <Text style={[styles.buttonText, { fontSize: 14 }]}>+ ن.ت</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={[styles.input, !immatriculation && { borderColor: '#FF3B30', borderWidth: 1 }]}
              placeholder="Ex: 123 تونس 456 ou 12345 ن.ت"
              value={immatriculation}
              onChangeText={setImmatriculation}
            />
            <View style={{ backgroundColor: '#E3F2FD', padding: 10, borderRadius: 8, marginTop: 5 }}>
              <Text style={{ fontSize: 12, color: '#1976D2' }}>
                ℹ️ Format accepté:{'\n'}
                • Tunis: "123 تونس 456" (1-3 chiffres){'\n'}
                • NT: "12345 ن.ت" (1-5 chiffres)
              </Text>
            </View>

            <Text style={[styles.formLabel, !numeroSerie && { color: '#FF3B30' }]}>
              Numéro de châssis * {!numeroSerie && '(Requis)'}
            </Text>
            <TextInput
              style={[styles.input, !numeroSerie && { borderColor: '#FF3B30', borderWidth: 1 }]}
              placeholder="17 caractères maximum"
              value={numeroSerie}
              onChangeText={setNumeroSerie}
              maxLength={17}
            />
            <Text style={{ fontSize: 12, color: '#999', marginTop: 5 }}>
              {numeroSerie.length}/17 caractères
            </Text>

            <Text style={[styles.formLabel, !annee && { color: '#FF3B30' }]}>
              Année * {!annee && '(Requis)'}
            </Text>
            <TextInput
              style={[styles.input, !annee && { borderColor: '#FF3B30', borderWidth: 1 }]}
              placeholder="Ex: 2020 (entre 1950 et 2100)"
              value={annee}
              onChangeText={setAnnee}
              keyboardType="numeric"
              maxLength={4}
            />

            <Text style={styles.formLabel}>Couleur (optionnel)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Blanc, Noir, Rouge..."
              value={couleur}
              onChangeText={setCouleur}
              maxLength={50}
            />
            {couleur && (
              <Text style={{ fontSize: 12, color: '#999', marginTop: 5 }}>
                {couleur.length}/50 caractères
              </Text>
            )}

            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]} 
              onPress={handleAddVehicle}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Ajouter le véhicule</Text>
              )}
            </TouchableOpacity>
            
            <View style={{ backgroundColor: '#FFF3CD', padding: 12, borderRadius: 8, marginTop: 15 }}>
              <Text style={{ fontSize: 12, color: '#856404' }}>
                ⚠️ Votre véhicule sera soumis à validation par un agent SAV avant d'être utilisable pour les rendez-vous.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
  
  // Complaints Screen
  if (currentScreen === 'complaints') {
    return (
      <View style={styles.container}>
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => setCurrentScreen('home')}>
            <Text style={styles.backButton}>← Retour</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Réclamations</Text>
          <TouchableOpacity onPress={loadUserData} disabled={loadingData}>
            <Text style={styles.backButton}>🔄</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollContent}>
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: '#FF9800', marginBottom: 15 }]}
            onPress={() => {
              Alert.prompt(
                'Nouvelle réclamation',
                'Sujet de la réclamation',
                [
                  { text: 'Annuler', style: 'cancel' },
                  {
                    text: 'Suivant',
                    onPress: (subject?: string) => {
                      if (subject) {
                        setComplaintSubject(subject);
                        Alert.prompt(
                          'Description',
                          'Décrivez votre réclamation',
                          [
                            { text: 'Annuler', style: 'cancel' },
                            {
                              text: 'Créer',
                              onPress: (description?: string) => {
                                if (description) {
                                  setComplaintDescription(description);
                                  handleCreateComplaint();
                                }
                              }
                            }
                          ]
                        );
                      }
                    }
                  }
                ]
              );
            }}
          >
            <Text style={styles.buttonText}>+ Nouvelle réclamation</Text>
          </TouchableOpacity>

          {loadingData ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.emptyText}>Chargement...</Text>
            </View>
          ) : complaints.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📝</Text>
              <Text style={styles.emptyText}>Aucune réclamation</Text>
            </View>
          ) : (
            complaints.map((complaint: any, index) => (
              <View key={index} style={styles.card}>
                <View style={[styles.statusBadge, { 
                  backgroundColor: 
                    complaint.statut === 'TRAITEE' ? '#4CAF50' :
                    complaint.statut === 'EN_COURS' ? '#2196F3' :
                    complaint.statut === 'CLOTUREE' ? '#9E9E9E' : '#FFC107'
                }]}>
                  <Text style={styles.statusText}>{complaint.statut}</Text>
                </View>
                <Text style={styles.cardTitle}>{complaint.sujet}</Text>
                <Text style={styles.cardDetail}>{complaint.description}</Text>
                <Text style={[styles.cardDetail, { fontSize: 12, marginTop: 10 }]}>
                  Créée le: {new Date(complaint.date_creation).toLocaleDateString('fr-FR')}
                </Text>
                {complaint.reponse && (
                  <View style={{ backgroundColor: '#E3F2FD', padding: 10, borderRadius: 8, marginTop: 10 }}>
                    <Text style={[styles.cardDetail, { fontWeight: 'bold' }]}>Réponse:</Text>
                    <Text style={styles.cardDetail}>{complaint.reponse}</Text>
                  </View>
                )}
              </View>
            ))
          )}
        </ScrollView>
      </View>
    );
  }
  
  // Orders Screen
  if (currentScreen === 'orders') {
    return (
      <View style={styles.container}>
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => setCurrentScreen('home')}>
            <Text style={styles.backButton}>← Retour</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mes Commandes</Text>
          <TouchableOpacity onPress={loadUserData} disabled={loadingData}>
            <Text style={styles.backButton}>🔄</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollContent}>
          {loadingData ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.emptyText}>Chargement...</Text>
            </View>
          ) : orders.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🔧</Text>
              <Text style={styles.emptyText}>Aucune commande</Text>
            </View>
          ) : (
            orders.map((order: any, index) => (
              <View key={index} style={styles.card}>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{order.statut}</Text>
                </View>
                <Text style={styles.cardTitle}>Commande #{order.id}</Text>
                <Text style={styles.cardDetail}>
                  📅 {new Date(order.date_heure).toLocaleDateString('fr-FR')}
                </Text>
                <Text style={styles.cardDetail}>
                  🚗 {order.marque_nom} {order.modele_nom}
                </Text>
                <Text style={styles.cardDetail}>📋 {order.immatriculation}</Text>
                <Text style={styles.cardDetail}>🏢 {order.agence_nom}</Text>
                {order.cout_total && (
                  <Text style={[styles.cardDetail, { fontWeight: 'bold', marginTop: 10 }]}>
                    💰 {order.cout_total.toFixed(2)} TND
                  </Text>
                )}
              </View>
            ))
          )}
        </ScrollView>
      </View>
    );
  }
  
  // Notifications Screen
  if (currentScreen === 'notifications') {
    const unreadCount = notifications.filter((n: any) => !n.lu).length;
    
    return (
      <View style={styles.container}>
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => setCurrentScreen('home')}>
            <Text style={styles.backButton}>← Retour</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <TouchableOpacity onPress={loadUserData} disabled={loadingData}>
            <Text style={styles.backButton}>🔄</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollContent}>
          {unreadCount > 0 && (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#4CAF50', marginBottom: 15 }]}
              onPress={handleMarkAllNotificationsAsRead}
            >
              <Text style={styles.buttonText}>✓ Tout marquer comme lu ({unreadCount})</Text>
            </TouchableOpacity>
          )}
          
          {loadingData ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.emptyText}>Chargement...</Text>
            </View>
          ) : notifications.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🔔</Text>
              <Text style={styles.emptyText}>Aucune notification</Text>
            </View>
          ) : (
            notifications.map((notif: any) => (
              <TouchableOpacity
                key={notif.id || `notif-${notif.titre}-${notif.date_envoi}`}
                style={[
                  styles.card,
                  { backgroundColor: notif.lu ? '#fff' : '#E3F2FD' }
                ]}
                onPress={() => !notif.lu && handleMarkNotificationAsRead(notif.id)}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.cardTitle, !notif.lu && { fontWeight: 'bold' }]}>
                      {!notif.lu && '🔵 '}{notif.titre}
                    </Text>
                    <Text style={styles.cardDetail}>{notif.message}</Text>
                    <Text style={[styles.cardDetail, { fontSize: 12, marginTop: 10 }]}>
                      {notif.date_envoi ? (
                        <>
                          {new Date(notif.date_envoi).toLocaleDateString('fr-FR')} à{' '}
                          {new Date(notif.date_envoi).toLocaleTimeString('fr-FR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </>
                      ) : 'Date non disponible'}
                    </Text>
                  </View>
                  {!notif.lu && (
                    <View style={{ 
                      width: 10, 
                      height: 10, 
                      borderRadius: 5, 
                      backgroundColor: '#007AFF',
                      marginLeft: 10,
                      marginTop: 5
                    }} />
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    );
  }
  
  // Appointment Feedback Screen
  if (currentScreen === 'appointmentFeedback') {
    const getRatingLabel = (rating: number) => {
      switch (rating) {
        case 5: return 'Excellent!';
        case 4: return 'Très bien';
        case 3: return 'Bien';
        case 2: return 'Moyen';
        case 1: return 'Décevant';
        default: return '';
      }
    };
    
    return (
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => setCurrentScreen('appointments')}>
            <Text style={styles.backButton}>← Retour</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Évaluer</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView style={styles.scrollContent}>
          <View style={styles.formContainer}>
            {selectedAppointmentForFeedback && (
              <View style={[styles.card, { marginBottom: 20 }]}>
                <Text style={styles.cardTitle}>{selectedAppointmentForFeedback.agence_nom}</Text>
                <Text style={styles.cardDetail}>
                  📅 {new Date(selectedAppointmentForFeedback.date_heure).toLocaleDateString('fr-FR')}
                </Text>
                <Text style={styles.cardDetail}>
                  🚗 {selectedAppointmentForFeedback.marque_nom} {selectedAppointmentForFeedback.modele_nom}
                </Text>
              </View>
            )}
            
            <Text style={[styles.formLabel, { textAlign: 'center', fontSize: 18 }]}>
              Comment évaluez-vous votre expérience ?
            </Text>
            
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setFeedbackRating(star)}
                  style={styles.starButton}
                >
                  <Text style={[
                    styles.starIcon,
                    star <= feedbackRating && styles.starIconSelected
                  ]}>
                    ⭐
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {feedbackRating > 0 && (
              <Text style={styles.ratingLabel}>
                {getRatingLabel(feedbackRating)}
              </Text>
            )}
            
            <Text style={styles.formLabel}>Commentaire (optionnel)</Text>
            <TextInput
              style={[styles.input, { height: 120 }]}
              placeholder="Partagez votre expérience..."
              value={feedbackComment}
              onChangeText={setFeedbackComment}
              multiline
              maxLength={500}
            />
            <Text style={{ fontSize: 12, color: '#999', textAlign: 'right', marginTop: 5 }}>
              {feedbackComment.length}/500 caractères
            </Text>
            
            <TouchableOpacity 
              style={[
                styles.button, 
                { backgroundColor: '#FF9800', marginTop: 20 },
                (loading || feedbackRating === 0) && styles.buttonDisabled
              ]} 
              onPress={handleSubmitFeedback}
              disabled={loading || feedbackRating === 0}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Envoyer mon évaluation</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  // Modern Banner Styles
  modernBanner: {
    backgroundColor: '#3B82F6',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  avatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  bannerGreeting: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  bannerSubtext: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statNumber: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 11,
    marginTop: 4,
  },
  // Action Cards
  actionCardsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: -40,
    marginBottom: 24,
  },
  actionCard: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  actionCardIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionCardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  actionCardSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
  },
  // Service Grid
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  serviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  serviceCard: {
    width: '31%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  serviceIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  serviceIcon: {
    fontSize: 28,
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  serviceTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 4,
  },
  serviceCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  modernLogoutButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#EF4444',
    marginBottom: 40,
  },
  modernLogoutText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 30,
    paddingTop: 60,
  },
  headerBar: {
    backgroundColor: '#3B82F6',
    padding: 15,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    color: '#fff',
    fontSize: 16,
    width: 60,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  welcome: {
    color: '#fff',
    fontSize: 16,
  },
  userName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#1E293B',
  },
  subtitle: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 30,
    color: '#64748B',
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  button: {
    backgroundColor: '#3B82F6',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Modern Card Styles
  modernCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  vehicleCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  vehicleIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  vehicleIcon: {
    fontSize: 28,
  },
  vehicleCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 6,
  },
  vehicleBadgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  vehicleBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  vehicleBadgeText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  vehicleCardDetails: {
    gap: 12,
  },
  vehicleDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vehicleDetailLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  vehicleDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  modernButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modernButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modernEmptyState: {
    alignItems: 'center',
    marginTop: 80,
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  menuCard: {
    width: '47%',
    backgroundColor: '#fff',
    margin: '1.5%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
  },
  badge: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Appointment Card Styles
  appointmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  appointmentDateBox: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appointmentDay: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  appointmentMonth: {
    fontSize: 12,
    color: '#64748B',
    textTransform: 'uppercase',
  },
  appointmentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  appointmentTime: {
    fontSize: 14,
    color: '#64748B',
  },
  appointmentStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  appointmentStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  appointmentDetails: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  appointmentDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appointmentDetailIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  appointmentDetailText: {
    fontSize: 14,
    color: '#64748B',
  },
  feedbackSubmittedBadge: {
    backgroundColor: '#D1FAE5',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  feedbackSubmittedText: {
    color: '#065F46',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 10,
  },
  cardDetail: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 5,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 10,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
  },
  logoutButton: {
    marginTop: 20,
    marginBottom: 40,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  logoutText: {
    color: '#EF4444',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  quickActions: {
    marginTop: 20,
    marginBottom: 20,
  },
  formContainer: {
    padding: 5,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 15,
    marginBottom: 8,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pickerOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  pickerOptionSelected: {
    backgroundColor: '#DBEAFE',
  },
  pickerOptionText: {
    fontSize: 14,
    color: '#1E293B',
  },
  slotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  slotButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    minWidth: 80,
    alignItems: 'center',
  },
  slotButtonSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  slotButtonDisabled: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    opacity: 0.5,
  },
  slotButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  slotButtonTextSelected: {
    color: '#fff',
  },
  slotButtonTextDisabled: {
    color: '#94A3B8',
  },
  slotFullText: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarModal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  calendarNavButton: {
    fontSize: 24,
    color: '#3B82F6',
    paddingHorizontal: 15,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    textTransform: 'capitalize',
  },
  calendarWeekDays: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  calendarDays: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
  calendarDaySelected: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
  },
  calendarDayToday: {
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderRadius: 12,
  },
  calendarDayDisabled: {
    opacity: 0.3,
  },
  calendarDayText: {
    fontSize: 14,
    color: '#1E293B',
  },
  calendarDayTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  calendarDayTextDisabled: {
    color: '#94A3B8',
  },
  calendarCloseButton: {
    marginTop: 20,
    backgroundColor: '#3B82F6',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  calendarCloseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginVertical: 20,
  },
  starButton: {
    padding: 5,
  },
  starIcon: {
    fontSize: 48,
    opacity: 0.3,
  },
  starIconSelected: {
    opacity: 1,
  },
  ratingLabel: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#F59E0B',
    marginBottom: 20,
  },
  registerLink: {
    padding: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  registerLinkText: {
    color: '#64748B',
    fontSize: 14,
  },
  registerLinkTextBold: {
    color: '#3B82F6',
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  forgotPasswordLink: {
    padding: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  forgotPasswordText: {
    color: '#3B82F6',
    fontSize: 14,
  },
  backButtonContainer: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  backButtonText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 30,
  },
  stepDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotActive: {
    backgroundColor: '#3B82F6',
  },
  stepDotText: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepLine: {
    width: 60,
    height: 2,
    backgroundColor: '#E2E8F0',
  },
  stepLineActive: {
    backgroundColor: '#3B82F6',
  },
  helpText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  resendLink: {
    padding: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  resendLinkText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '600',
  },
});
