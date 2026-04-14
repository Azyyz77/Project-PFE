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

// Traductions
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
    
    // Commun
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
    
    // Language
    'language.french': 'Français',
    'language.arabic': 'العربية',
    'language.select': 'Choisir la langue',
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
    
    // Commun
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
    
    // Language
    'language.french': 'Français',
    'language.arabic': 'العربية',
    'language.select': 'اختر اللغة',
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('fr');

  useEffect(() => {
    // Charger la langue depuis localStorage
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang && (savedLang === 'fr' || savedLang === 'ar')) {
      setLanguageState(savedLang);
      document.documentElement.lang = savedLang;
      document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
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
