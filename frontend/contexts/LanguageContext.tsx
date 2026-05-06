'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'fr' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  fr: {
    // Navigation
    'nav.dashboard': 'Tableau de bord',
    'nav.catalog': 'Catalogue',
    'nav.appointments': 'Rendez-vous',
    'nav.vehicles': 'Véhicules',
    'nav.orders': 'Commandes',
    'nav.complaints': 'Réclamations',
    'nav.documents': 'Documents',
    'nav.assistance': 'Assistance',
    'nav.feedback': 'Avis',
    'nav.profile': 'Profil',
    'nav.logout': 'Déconnexion',
    'nav.clientDashboard': 'Tableau de bord',
    'nav.clientVehicles': 'Mes véhicules',
    'nav.clientHistory': 'Historique véhicules',
    'nav.clientCatalog': 'Catalogue',
    'nav.clientPromotions': 'Promotions',
    'nav.clientAppointments': 'Rendez-vous',
    'nav.clientDocuments': 'Mes documents',
    'nav.clientChatbot': 'Assistant SAV',
    'nav.clientAssistance': 'Assistance',
    'nav.clientFeedback': 'Mes Avis',
    'nav.clientComplaints': 'Réclamations',
    'nav.clientProfile': 'Mon profil',
    'nav.clientSpace': 'Espace Client',

    // Common
    'common.welcome': 'Bienvenue',
    'common.search': 'Rechercher',
    'common.filter': 'Filtrer',
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.add': 'Ajouter',
    'common.close': 'Fermer',
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.success': 'Succès',
    'common.confirm': 'Confirmer',
    'common.back': 'Retour',
    'common.next': 'Suivant',
    'common.previous': 'Précédent',
    'common.submit': 'Soumettre',
    'common.view': 'Voir',
    'common.download': 'Télécharger',
    'common.upload': 'Téléverser',
    'common.select': 'Sélectionner',
    'common.all': 'Tous',
    'common.none': 'Aucun',
    'common.yes': 'Oui',
    'common.no': 'Non',
    'common.details': 'Détails',
    'common.unknown': 'Non défini',
    'common.total': 'Total',
    'common.inProgress': 'En cours',
    'common.completed': 'Terminées',
    'common.totalCost': 'Coût total',
    'common.orders': 'Mes Commandes',
    'common.quickAccess': 'Accès rapide',
    'common.myVehicles': 'Mes Véhicules',
    'common.editProfile': 'Modifier le profil',
    'common.client': 'CLIENT',
    'common.email': 'Email',
    'common.phone': 'Téléphone',
    'common.clientId': 'ID Client',
    'common.addFirstVehicle': 'Ajouter mon premier véhicule',
    'common.noVehicle': 'Aucun véhicule enregistré',
    'common.chassisNumber': 'N° Châssis',
    'common.vehiclesCount': 'Véhicules',
    'common.nextAppointments': 'RDV à venir',
    'common.send': 'Envoyer',
    'common.writeMessage': 'Écrivez votre message...',
    'common.available247': 'Disponible 24h/24',

    // Auth
    'auth.login': 'Connexion',
    'auth.register': 'Inscription',
    'auth.email': 'Email',
    'auth.password': 'Mot de passe',
    'auth.forgotPassword': 'Mot de passe oublié?',
    'auth.rememberMe': 'Se souvenir de moi',

    // Dashboard
    'dashboard.title': 'Tableau de bord',
    'dashboard.stats': 'Statistiques',
    'dashboard.recentActivity': 'Activité récente',
    'dashboard.welcomeBack': 'Bienvenue de retour',
    'dashboard.manageAppointments': 'Gérez vos rendez-vous atelier',
    'dashboard.managePersonalInfo': 'Gérez vos informations personnelles',
    'dashboard.see': 'Voir',
    'dashboard.edit': 'Éditer',
    'dashboard.add': 'Ajouter',

    // Catalog
    'catalog.title': 'Catalogue des services',
    'catalog.packages': 'Forfaits',
    'catalog.interventions': 'Interventions',
    'catalog.price': 'Prix',
    'catalog.duration': 'Durée',
    'catalog.details': 'Détails',
    'catalog.bookNow': 'Réserver maintenant',

    // Appointments
    'appointments.title': 'Mes rendez-vous',
    'appointments.new': 'Nouveau rendez-vous',
    'appointments.date': 'Date',
    'appointments.time': 'Heure',
    'appointments.status': 'Statut',
    'appointments.cancel': 'Annuler',

    // Vehicles
    'vehicles.title': 'Mes véhicules',
    'vehicles.add': 'Ajouter un véhicule',
    'vehicles.brand': 'Marque',
    'vehicles.model': 'Modèle',
    'vehicles.year': 'Année',
    'vehicles.vin': 'Numéro de châssis',
    'vehicles.plate': 'Immatriculation',

    // Orders
    'orders.noOrders': 'Aucune commande de réparation',
    'orders.bookAppointment': 'Réserver un rendez-vous',
    'orders.order': 'Commande',
    'orders.agency': 'Agence',
    'orders.interventions': 'Interventions',
    'orders.cost': 'Coût',
    'orders.appointmentDate': 'Date du rendez-vous',
    'orders.estimatedDuration': 'Durée estimée',
    'orders.vehicle': 'Véhicule',
    'orders.brandModel': 'Marque/Modèle',
    'orders.plate': 'Immatriculation',
    'orders.color': 'Couleur',
    'orders.year': 'Année',
    'orders.agentAssigned': 'Agent assigné',
    'orders.attachments': 'Pièces jointes',
    'orders.download': 'Télécharger',
    'orders.undefined': 'Non défini',
    'orders.loadingError': 'Erreur lors du chargement des commandes',
    'orders.detailsError': 'Erreur lors du chargement des détails',
    'orders.detailsTitle': 'Détails de la commande',

    // Chatbot
    'chatbot.title': 'Assistant SAV Chery',
    'chatbot.greeting': '👋 Bonjour ! Je suis l\'assistant SAV Chery Tunisie. Comment puis-je vous aider ?',
    'chatbot.typing': 'Assistant en train de répondre...',
    'chatbot.fallback': '⚠️ Service temporairement indisponible. Appelez-nous au +216 XX XXX XXX',

    // Assistance
    'assistance.title': 'Assistance Diagnostic',
    'assistance.subtitle': 'Décrivez votre problème et trouvez des solutions',
    'assistance.enterProblem': 'Veuillez entrer une description du problème',
    'assistance.searchPlaceholder': 'Ex: Bruit au démarrage, voyant moteur allumé...',
    'assistance.searching': 'Recherche...',
    'assistance.viewSolution': 'Voir la solution',
    'assistance.problemDescription': 'Description du problème',
    'assistance.recommendedSolution': 'Solution recommandée',
    'assistance.problemPersists': '💡 Si le problème persiste, nous vous recommandons de prendre rendez-vous avec un de nos techniciens.',
    'assistance.commonProblems': 'Problèmes fréquents',
    'assistance.suggestion.engineLight': 'Voyant moteur allumé',
    'assistance.suggestion.brakeNoise': 'Bruit au freinage',
    'assistance.suggestion.startIssue': 'Problème de démarrage',
    'assistance.suggestion.acIssue': 'Climatisation inefficace',
    'assistance.suggestion.steeringVibration': 'Vibrations au volant',
    'assistance.suggestion.highConsumption': 'Consommation excessive',

    // Notifications
    'notifications.title': 'Notifications',
    'notifications.markAllRead': 'Tout marquer comme lu',
    'notifications.empty': 'Aucune notification',
    'notifications.loading': 'Chargement...',
    'notifications.justNow': 'À l\'instant',
    'notifications.minutesAgo': 'Il y a {count} min',
    'notifications.hoursAgo': 'Il y a {count}h',
    'notifications.yesterday': 'Hier',
    'notifications.daysAgo': 'Il y a {count}j',
    'notifications.markedReadSuccess': 'Toutes les notifications marquées comme lues',

    // Language
    'language.french': 'Français',
    'language.arabic': 'العربية',
    'language.select': 'Choisir la langue',
    'language.frShort': 'FR',
    'language.arShort': 'AR',
  },
  ar: {
    // Navigation
    'nav.dashboard': 'لوحة القيادة',
    'nav.catalog': 'الكتالوج',
    'nav.appointments': 'المواعيد',
    'nav.vehicles': 'المركبات',
    'nav.orders': 'الطلبات',
    'nav.complaints': 'الشكاوى',
    'nav.documents': 'المستندات',
    'nav.assistance': 'المساعدة',
    'nav.feedback': 'التقييمات',
    'nav.profile': 'الملف الشخصي',
    'nav.logout': 'تسجيل الخروج',
    'nav.clientDashboard': 'لوحة القيادة',
    'nav.clientVehicles': 'مركباتي',
    'nav.clientHistory': 'تاريخ المركبات',
    'nav.clientCatalog': 'الكتالوج',
    'nav.clientPromotions': 'العروض',
    'nav.clientAppointments': 'المواعيد',
    'nav.clientDocuments': 'مستنداتي',
    'nav.clientChatbot': 'مساعد الصيانة',
    'nav.clientAssistance': 'المساعدة',
    'nav.clientFeedback': 'تقييماتي',
    'nav.clientComplaints': 'الشكاوى',
    'nav.clientProfile': 'ملفي الشخصي',
    'nav.clientSpace': 'فضاء الحريف',

    // Common
    'common.welcome': 'مرحبا',
    'common.search': 'بحث',
    'common.filter': 'تصفية',
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.delete': 'حذف',
    'common.edit': 'تعديل',
    'common.add': 'إضافة',
    'common.close': 'إغلاق',
    'common.loading': 'جاري التحميل...',
    'common.error': 'خطأ',
    'common.success': 'نجح',
    'common.confirm': 'تأكيد',
    'common.back': 'رجوع',
    'common.next': 'التالي',
    'common.previous': 'السابق',
    'common.submit': 'إرسال',
    'common.view': 'عرض',
    'common.download': 'تحميل',
    'common.upload': 'رفع',
    'common.select': 'اختر',
    'common.all': 'الكل',
    'common.none': 'لا شيء',
    'common.yes': 'نعم',
    'common.no': 'لا',
    'common.details': 'التفاصيل',
    'common.unknown': 'غير محدد',
    'common.total': 'الإجمالي',
    'common.inProgress': 'قيد التنفيذ',
    'common.completed': 'مكتملة',
    'common.totalCost': 'التكلفة الإجمالية',
    'common.orders': 'طلباتي',
    'common.quickAccess': 'وصول سريع',
    'common.myVehicles': 'مركباتي',
    'common.editProfile': 'تعديل الملف الشخصي',
    'common.client': 'عميل',
    'common.email': 'البريد الإلكتروني',
    'common.phone': 'الهاتف',
    'common.clientId': 'معرف العميل',
    'common.addFirstVehicle': 'إضافة أول مركبة',
    'common.noVehicle': 'لا توجد مركبات مسجلة',
    'common.chassisNumber': 'رقم الهيكل',
    'common.vehiclesCount': 'المركبات',
    'common.nextAppointments': 'المواعيد القادمة',
    'common.send': 'إرسال',
    'common.writeMessage': 'اكتب رسالتك...',
    'common.available247': 'متاح 24/24',

    // Auth
    'auth.login': 'تسجيل الدخول',
    'auth.register': 'التسجيل',
    'auth.email': 'البريد الإلكتروني',
    'auth.password': 'كلمة المرور',
    'auth.forgotPassword': 'نسيت كلمة المرور؟',
    'auth.rememberMe': 'تذكرني',

    // Dashboard
    'dashboard.title': 'لوحة القيادة',
    'dashboard.stats': 'الإحصائيات',
    'dashboard.recentActivity': 'النشاط الأخير',
    'dashboard.welcomeBack': 'مرحبًا بعودتك',
    'dashboard.manageAppointments': 'إدارة مواعيد الورشة',
    'dashboard.managePersonalInfo': 'إدارة معلوماتك الشخصية',
    'dashboard.see': 'عرض',
    'dashboard.edit': 'تعديل',
    'dashboard.add': 'إضافة',

    // Catalog
    'catalog.title': 'كتالوج الخدمات',
    'catalog.packages': 'الباقات',
    'catalog.interventions': 'التدخلات',
    'catalog.price': 'السعر',
    'catalog.duration': 'المدة',
    'catalog.details': 'التفاصيل',
    'catalog.bookNow': 'احجز الآن',

    // Appointments
    'appointments.title': 'مواعيدي',
    'appointments.new': 'موعد جديد',
    'appointments.date': 'التاريخ',
    'appointments.time': 'الوقت',
    'appointments.status': 'الحالة',
    'appointments.cancel': 'إلغاء',

    // Vehicles
    'vehicles.title': 'مركباتي',
    'vehicles.add': 'إضافة مركبة',
    'vehicles.brand': 'العلامة التجارية',
    'vehicles.model': 'الطراز',
    'vehicles.year': 'السنة',
    'vehicles.vin': 'رقم الهيكل',
    'vehicles.plate': 'رقم اللوحة',

    // Orders
    'orders.noOrders': 'لا توجد طلبات إصلاح',
    'orders.bookAppointment': 'حجز موعد',
    'orders.order': 'طلب',
    'orders.agency': 'الوكالة',
    'orders.interventions': 'التدخلات',
    'orders.cost': 'التكلفة',
    'orders.appointmentDate': 'تاريخ الموعد',
    'orders.estimatedDuration': 'المدة المقدرة',
    'orders.vehicle': 'المركبة',
    'orders.brandModel': 'العلامة/الطراز',
    'orders.plate': 'رقم اللوحة',
    'orders.color': 'اللون',
    'orders.year': 'السنة',
    'orders.agentAssigned': 'الوكيل المكلّف',
    'orders.attachments': 'المرفقات',
    'orders.download': 'تنزيل',
    'orders.undefined': 'غير محدد',
    'orders.loadingError': 'حدث خطأ أثناء تحميل الطلبات',
    'orders.detailsError': 'حدث خطأ أثناء تحميل التفاصيل',
    'orders.detailsTitle': 'تفاصيل الطلب',

    // Chatbot
    'chatbot.title': 'مساعد صيانة شيري',
    'chatbot.greeting': '👋 مرحبًا! أنا مساعد صيانة شيري تونس. كيف يمكنني مساعدتك؟',
    'chatbot.typing': 'المساعد يكتب الرد...',
    'chatbot.fallback': '⚠️ الخدمة غير متاحة مؤقتًا. اتصل بنا على +216 XX XXX XXX',

    // Assistance
    'assistance.title': 'مساعدة التشخيص',
    'assistance.subtitle': 'صِف مشكلتك وابحث عن الحلول',
    'assistance.enterProblem': 'يرجى إدخال وصف للمشكلة',
    'assistance.searchPlaceholder': 'مثال: صوت عند التشغيل، ضوء المحرك مضاء...',
    'assistance.searching': 'جاري البحث...',
    'assistance.viewSolution': 'عرض الحل',
    'assistance.problemDescription': 'وصف المشكلة',
    'assistance.recommendedSolution': 'الحل الموصى به',
    'assistance.problemPersists': '💡 إذا استمرت المشكلة، نوصي بحجز موعد مع أحد فنّينا.',
    'assistance.commonProblems': 'المشاكل الشائعة',
    'assistance.suggestion.engineLight': 'ضوء المحرك مضاء',
    'assistance.suggestion.brakeNoise': 'ضوضاء عند الفرملة',
    'assistance.suggestion.startIssue': 'مشكلة في التشغيل',
    'assistance.suggestion.acIssue': 'ضعف في التكييف',
    'assistance.suggestion.steeringVibration': 'اهتزاز في المقود',
    'assistance.suggestion.highConsumption': 'استهلاك مرتفع للوقود',

    // Notifications
    'notifications.title': 'الإشعارات',
    'notifications.markAllRead': 'تحديد الكل كمقروء',
    'notifications.empty': 'لا توجد إشعارات',
    'notifications.loading': 'جاري التحميل...',
    'notifications.justNow': 'الآن',
    'notifications.minutesAgo': 'منذ {count} دقيقة',
    'notifications.hoursAgo': 'منذ {count} ساعة',
    'notifications.yesterday': 'أمس',
    'notifications.daysAgo': 'منذ {count} يوم',
    'notifications.markedReadSuccess': 'تم تحديد جميع الإشعارات كمقروءة',

    // Language
    'language.french': 'Français',
    'language.arabic': 'العربية',
    'language.select': 'اختر اللغة',
    'language.frShort': 'FR',
    'language.arShort': 'AR',
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('fr');

  useEffect(() => {
    const savedLang = localStorage.getItem('language');
    if (savedLang === 'ar' || savedLang === 'fr') {
      // Defer locale restore until after hydration to keep SSR and first client render identical.
      queueMicrotask(() => {
        setLanguageState(savedLang);
      });
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };

  const t = (key: string): string => {
    return translations[language][key] || translations.fr[key] || key;
  };

  const isRTL = language === 'ar';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
