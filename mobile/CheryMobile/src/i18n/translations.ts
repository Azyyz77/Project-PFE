export type Language = 'fr' | 'en' | 'ar';

interface TranslationDict {
  [key: string]: string | TranslationDict;
}

export const translations: Record<Language, TranslationDict> = {
  fr: {
    common: {
      home: 'Accueil',
      vehicles: 'Mes Véhicules',
      appointments: 'Rendez-vous',
      repairOrders: 'Commandes',
      invoices: 'Factures',
      complaints: 'Réclamations',
      notifications: 'Notifications',
      assistant: 'Assistant SAV',
      profile: 'Mon Profil',
      logout: 'Déconnexion',
      quickActions: 'Actions rapides',
      mainMenu: 'Menu principal',
      version: 'Version',
      searchPlaceholder: 'Quel service recherchez-vous ?',
      bookAppointment: 'Prendre RDV',
      addVehicle: 'Ajouter véhicule',
      seeAll: 'Voir tout',
      shortcuts: 'Raccourcis',
      supportTitle: "Besoin d'assistance ?",
      supportDesc: 'Nos experts STA sont disponibles 24/7 pour vous accompagner dans vos démarches.',
      call: 'Appeler',
      chatLive: 'Chat Live'
    },
    stats: {
      vehicles: 'Véhicules',
      appointments: 'RDV',
      alerts: 'Alertes'
    },
    shortcuts: {
      vehicles: 'Véhicules',
      appointments: 'Rendez-vous',
      complaints: 'Réclamations',
      repairOrders: 'Commandes',
      invoices: 'Factures',
      assurances: 'Assurances',
      inspection: 'Inspection véhicule'
    },
    inspection: {
      title: 'Inspection véhicule',
      subtitle: 'Détection des dommages (IA)',
      description: 'Chargez une photo de votre véhicule pour lancer une inspection automatique.',
      comingSoon: 'Fonctionnalité mobile en cours de déploiement.',
      openWeb: 'Ouvrir la version web',
      pickImage: 'Choisir une photo',
      changeImage: 'Changer la photo',
      analyze: 'Analyser le véhicule',
      analyzing: 'Analyse en cours...',
      errorTitle: 'Erreur de détection',
      errorHint: 'Vérifiez que le backend est bien lancé.',
      noDamage: 'Aucun dommage détecté',
      damageDetected: 'dommage détecté',
      damageDetectedPlural: 'dommages détectés',
      critical: 'CRITIQUE',
      resultsTitle: 'Résultats',
      type: 'Type',
      severity: 'Sévérité',
      confidence: 'Confiance',
      position: 'Position'
    },
    assurances: {
      title: 'Assurances',
      subtitle: 'Gestion des assurances',
      comingSoon: 'Module en cours de développement.'
    }
  },
  en: {
    common: {
      home: 'Home',
      vehicles: 'My Vehicles',
      appointments: 'Appointments',
      repairOrders: 'Orders',
      invoices: 'Invoices',
      complaints: 'Complaints',
      notifications: 'Notifications',
      assistant: 'Service Assistant',
      profile: 'My Profile',
      logout: 'Logout',
      quickActions: 'Quick Actions',
      mainMenu: 'Main Menu',
      version: 'Version',
      searchPlaceholder: 'What service are you looking for?',
      bookAppointment: 'Book Appointment',
      addVehicle: 'Add Vehicle',
      seeAll: 'See all',
      shortcuts: 'Shortcuts',
      supportTitle: 'Need assistance?',
      supportDesc: 'STA experts are available 24/7 to support you.',
      call: 'Call',
      chatLive: 'Live Chat'
    },
    stats: {
      vehicles: 'Vehicles',
      appointments: 'Appointments',
      alerts: 'Alerts'
    },
    shortcuts: {
      vehicles: 'Vehicles',
      appointments: 'Appointments',
      complaints: 'Complaints',
      repairOrders: 'Orders',
      invoices: 'Invoices',
      assurances: 'Insurance',
      inspection: 'Vehicle Inspection'
    },
    inspection: {
      title: 'Vehicle Inspection',
      subtitle: 'Damage detection (AI)',
      description: 'Upload a vehicle photo to start an automated inspection.',
      comingSoon: 'Mobile feature is being rolled out.',
      openWeb: 'Open web version',
      pickImage: 'Choose photo',
      changeImage: 'Change photo',
      analyze: 'Analyze vehicle',
      analyzing: 'Analyzing...',
      errorTitle: 'Detection error',
      errorHint: 'Check that the backend is running.',
      noDamage: 'No damage detected',
      damageDetected: 'damage detected',
      damageDetectedPlural: 'damages detected',
      critical: 'CRITICAL',
      resultsTitle: 'Results',
      type: 'Type',
      severity: 'Severity',
      confidence: 'Confidence',
      position: 'Position'
    },
    assurances: {
      title: 'Insurance',
      subtitle: 'Insurance management',
      comingSoon: 'Module under development.'
    }
  },
  ar: {
    common: {
      home: 'الرئيسية',
      vehicles: 'مركباتي',
      appointments: 'المواعيد',
      repairOrders: 'الطلبات',
      invoices: 'الفواتير',
      complaints: 'الشكاوى',
      notifications: 'الإشعارات',
      assistant: 'مساعد الخدمة',
      profile: 'ملفي',
      logout: 'تسجيل الخروج',
      quickActions: 'إجراءات سريعة',
      mainMenu: 'القائمة الرئيسية',
      version: 'الإصدار',
      searchPlaceholder: 'ما الخدمة التي تبحث عنها؟',
      bookAppointment: 'حجز موعد',
      addVehicle: 'إضافة مركبة',
      seeAll: 'عرض الكل',
      shortcuts: 'اختصارات',
      supportTitle: 'هل تحتاج مساعدة؟',
      supportDesc: 'خبراء STA متاحون على مدار الساعة لمساعدتك.',
      call: 'اتصال',
      chatLive: 'دردشة مباشرة'
    },
    stats: {
      vehicles: 'مركبات',
      appointments: 'مواعيد',
      alerts: 'تنبيهات'
    },
    shortcuts: {
      vehicles: 'المركبات',
      appointments: 'المواعيد',
      complaints: 'الشكاوى',
      repairOrders: 'الطلبات',
      invoices: 'الفواتير',
      assurances: 'التأمين',
      inspection: 'فحص المركبة'
    },
    inspection: {
      title: 'فحص المركبة',
      subtitle: 'كشف الأضرار (ذكاء اصطناعي)',
      description: 'ارفع صورة للمركبة لبدء الفحص التلقائي.',
      comingSoon: 'الميزة قيد الإطلاق على الجوال.',
      openWeb: 'فتح نسخة الويب',
      pickImage: 'اختيار صورة',
      changeImage: 'تغيير الصورة',
      analyze: 'تحليل المركبة',
      analyzing: 'جار التحليل...',
      errorTitle: 'خطا في الكشف',
      errorHint: 'تاكد من تشغيل الخادم الخلفي.',
      noDamage: 'لا توجد اضرار',
      damageDetected: 'ضرر مكتشف',
      damageDetectedPlural: 'اضرار مكتشفة',
      critical: 'حرج',
      resultsTitle: 'النتائج',
      type: 'النوع',
      severity: 'الحدة',
      confidence: 'الثقة',
      position: 'الموقع'
    },
    assurances: {
      title: 'التأمين',
      subtitle: 'إدارة التأمين',
      comingSoon: 'الوحدة قيد التطوير.'
    }
  }
};
