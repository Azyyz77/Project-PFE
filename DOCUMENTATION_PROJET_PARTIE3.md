# DOCUMENTATION COMPLÈTE - PARTIE 3
## DASHBOARDS ET INTERFACES

---

## 6. DASHBOARDS ET INTERFACES {#dashboards}

### 6.1 Landing Page (Page d'accueil)

#### Sections
1. **Header**
   - Logo Chery
   - Navigation: Prise de rendez-vous, Top modèles, Assistance
   - Boutons: Connexion, Inscription
   - Animation: Underline animé au survol

2. **Hero Section**
   - Carrousel 3 modèles Chery (Tiggo 8 Pro, Tiggo 7 Plus, Arrizo 8)
   - Slogan: "Le SAV automobile pensé pour la vitesse"
   - CTA: Prendre rendez-vous, Créer compte
   - Métriques: 24/7, +10 points, 100% digital
   - Animation: Scroll fade-in

3. **Services Section**
   - Prise de rendez-vous SAV
   - Suivi de véhicule
   - Assistance & sécurité
   - Animation: Apparition au scroll

4. **Modèles Section**
   - Top 3 véhicules les plus vendus
   - Cards avec images et descriptions

5. **Parcours Client**
   - 4 étapes: Créer compte → Saisir demande → Validation → Suivi

6. **Footer**
   - Liens réseaux sociaux (Facebook, Instagram, YouTube, LinkedIn, TikTok)
   - Contact: +216 31 390 280
   - Liens: Services, Modèles, Mentions légales

#### Technologies utilisées
- Next.js SSR
- Framer Motion (animations)
- Intersection Observer (scroll animations)
- Tailwind CSS (styling)

---

### 6.2 Dashboard CLIENT

#### 6.2.1 Sidebar Navigation

**Sections:**

**PRINCIPAL**
- 🏠 Dashboard - Vue d'ensemble
- 🚗 Mes Véhicules - Gestion véhicules
- 📅 Rendez-vous - Prise et suivi RDV

**SUIVI**
- 🕐 Historique - Historique interventions
- 📄 Ordres de réparation - Suivi réparations
- 🛒 Commandes - Commandes pièces
- 📦 Catalogue - Catalogue interventions
- 🏷️ Promotions - Offres véhicules
- 🧾 Factures - Factures et paiements

**AUTRES**
- ℹ️ Informations - Infos pratiques
- 📁 Documents - Documents personnels
- ⚠️ Réclamations - Gestion réclamations
- 🆘 Assistance - Support client
- 💬 Chatbot - Assistant virtuel
- ⭐ Feedback - Évaluation services
- 👤 Profil - Paramètres compte

#### 6.2.2 Dashboard Principal (client/dashboard)

**Widgets:**
1. **Statistiques rapides**
   - Nombre de véhicules
   - Rendez-vous à venir
   - Interventions en cours
   - Réclamations ouvertes

2. **Prochains rendez-vous**
   - Liste des 3 prochains RDV
   - Date, heure, agence
   - Statut
   - Actions: Voir détails, Annuler

3. **Véhicules récents**
   - Liste véhicules avec photos
   - Modèle, immatriculation
   - Dernière intervention
   - Action: Prendre RDV

4. **Notifications**
   - Rappels RDV
   - Mises à jour interventions
   - Nouvelles promotions

5. **Actions rapides**
   - Prendre rendez-vous
   - Ajouter véhicule
   - Contacter support

#### 6.2.3 Gestion Véhicules (client/vehicles)

**Fonctionnalités:**
- **Liste véhicules** - Grid/List view
- **Ajouter véhicule** - Formulaire multi-étapes
  - Informations générales (marque, modèle, année)
  - Immatriculation (validation format tunisien)
  - Photos véhicule
  - Informations complémentaires
- **Détails véhicule**
  - Fiche technique
  - Historique interventions
  - Documents associés
  - Prochains entretiens
- **Modifier véhicule**
- **Supprimer véhicule**

**Composants:**
- VehicleCard - Card véhicule
- VehicleForm - Formulaire ajout/édition
- VehicleHistory - Historique interventions
- ImmatriculationInput - Input avec validation

#### 6.2.4 Prise de Rendez-vous (client/rendez-vous)

**Processus en 3 étapes:**

**Étape 1: Sélection véhicule et problème**
- Dropdown véhicules avec recherche
- Sélection type d'intervention
- Sélection packages (Vidange, Révision, etc.)
- Description problème
- Upload photos (optionnel)

**Étape 2: Date, heure et agence**
- Calendrier interactif
- Créneaux horaires disponibles
- Sélection agence
- Carte avec localisation

**Étape 3: Confirmation**
- Récapitulatif complet
  - Véhicule sélectionné
  - Interventions choisies
  - Date et heure
  - Agence
  - Prix estimé
- Conditions générales
- Bouton confirmation

**Composants:**
- BookingModal - Modal 3 étapes (50vw)
- VehicleSelector - Sélection véhicule
- PackageSelector - Sélection packages
- TimeSlotPicker - Sélection créneau
- ConfirmationSummary - Récapitulatif

**Design:**
- Modal width: 50vw
- Header compact avec step indicator (top right)
- Padding réduit (p-2, p-3)
- Icons: h-3 w-3
- Text: text-xs
- Colors: #1b355d, #0f2543, red accents

#### 6.2.5 Historique Véhicule (client/vehicle-history)

**Affichage:**
- Timeline interventions
- Filtres: Date, Type, Statut
- Export PDF/Excel
- Détails par intervention:
  - Date
  - Type intervention
  - Pièces changées
  - Coût
  - Agent responsable
  - Photos avant/après

#### 6.2.6 Ordres de Réparation (client/repair-orders)

**Liste ordres:**
- Statut (En attente, En cours, Terminé)
- Numéro ordre
- Véhicule
- Date création
- Montant
- Actions: Voir détails

**Détails ordre:**
- Informations générales
- Liste pièces détachées
- Main d'œuvre
- Diagnostic
- Photos
- Devis
- Facture (si terminé)

#### 6.2.7 Factures (client/invoices)

**Liste factures:**
- Numéro facture
- Date
- Montant HT
- TVA (19%)
- Montant TTC
- Statut paiement
- Actions: Télécharger PDF, Voir détails

**Détails facture:**
- En-tête (STA Chery)
- Informations client
- Détails interventions
- Calculs (HT, TVA, TTC)
- Conditions de paiement
- Export PDF

#### 6.2.8 Réclamations (client/complaints)

**Créer réclamation:**
- Sujet
- Description détaillée
- Catégorie (Service, Qualité, Délai, Autre)
- Pièces jointes
- Priorité

**Liste réclamations:**
- Statut (Ouverte, En cours, Résolue, Fermée)
- Date création
- Sujet
- Dernière réponse
- Actions: Voir détails, Ajouter réponse

**Détails réclamation:**
- Fil de discussion
- Réponses agents
- Historique statuts
- Résolution

#### 6.2.9 Chatbot IA (client/chatbot)

**Interface:**
- Zone de chat
- Historique conversations
- Suggestions questions
- Modération automatique

**Fonctionnalités:**
- Réponses automatiques
- Informations SAV
- Aide prise RDV
- FAQ dynamique

#### 6.2.10 Profil (client/profile)

**Sections:**
- **Informations personnelles**
  - Nom, Prénom
  - Email
  - Téléphone
  - Adresse
- **Sécurité**
  - Changer mot de passe
  - Vérification téléphone
  - Sessions actives
- **Préférences**
  - Langue (FR/AR)
  - Notifications
  - Thème (Light/Dark)
- **Statistiques**
  - Nombre RDV
  - Dépenses totales
  - Véhicules enregistrés

---

### 6.3 Dashboard AGENT SAV

#### 6.3.1 Sidebar Navigation

**Sections:**
- 🏠 Dashboard - Vue d'ensemble
- 📅 Rendez-vous - Gestion RDV
- 👥 Clients - Liste clients
- 🚗 Véhicules - Gestion véhicules
- 🔧 Interventions - Ordres réparation
- ⚠️ Réclamations - Gestion réclamations
- 📊 Statistiques - Rapports

#### 6.3.2 Dashboard Principal (dashboard/agent)

**Widgets:**
1. **Statistiques du jour**
   - RDV aujourd'hui
   - Interventions en cours
   - Clients servis
   - Réclamations ouvertes

2. **Planning du jour**
   - Liste RDV chronologique
   - Statut temps réel
   - Actions rapides

3. **Interventions en cours**
   - Liste ordres actifs
   - Progression
   - Temps estimé

4. **Réclamations urgentes**
   - Réclamations prioritaires
   - Temps de réponse

5. **Notifications**
   - Nouveaux RDV
   - Réclamations
   - Alertes système

#### 6.3.3 Gestion Rendez-vous (dashboard/agent/appointments)

**Fonctionnalités:**
- **Vue calendrier** - Planning mensuel/hebdomadaire/jour
- **Liste RDV** - Filtres multiples
- **Détails RDV**
  - Informations client
  - Véhicule
  - Interventions demandées
  - Pièces jointes
- **Actions**
  - Confirmer RDV
  - Modifier créneau
  - Annuler
  - Créer ordre réparation
  - Contacter client

**Composants:**
- AppointmentCalendar - Calendrier interactif
- AppointmentsList - Liste avec filtres
- AppointmentDetails - Modal détails
- AppointmentActions - Boutons actions

#### 6.3.4 Gestion Clients (dashboard/agent/clients)

**Liste clients:**
- Recherche (nom, email, téléphone)
- Filtres (actif, inactif, VIP)
- Tri (nom, date inscription, nb véhicules)

**Fiche client:**
- Informations personnelles
- Véhicules enregistrés
- Historique RDV
- Historique interventions
- Réclamations
- Statistiques (dépenses, fréquence)

#### 6.3.5 Gestion Interventions

**Créer ordre réparation:**
- Sélection client/véhicule
- Diagnostic
- Liste interventions
- Pièces détachées
- Main d'œuvre
- Devis
- Photos

**Suivi intervention:**
- Statut progression
- Temps passé
- Pièces utilisées
- Notes techniques
- Validation client

---

### 6.4 Dashboard ADMIN

#### 6.4.1 Sidebar Navigation

**GESTION**
- 🏠 Dashboard
- 👥 Utilisateurs
- 🚗 Véhicules
- 📦 Commandes
- 🧾 Factures

**CONFIGURATION**
- ⚙️ Paramètres
- 🏢 Agences
- 👷 Employés
- 🎨 Marques & Modèles
- 🎨 Couleurs
- 📋 Types d'intervention
- 📦 Packages
- 🕐 Créneaux horaires
- 📊 Statuts
- 🏷️ Promotions

**CONTENU**
- 📄 Documents
- ℹ️ Informations
- ⚠️ Problèmes prédéfinis
- 💬 Messages
- 🛡️ Modération

**ANALYSE**
- 📊 Rapports
- 📈 Statistiques
- 🔍 Audit
- ⭐ Feedbacks

**SÉCURITÉ**
- 🔐 Permissions
- 🔑 Rôles

#### 6.4.2 Dashboard Principal (dashboard/admin)

**KPIs:**
- Utilisateurs totaux
- RDV du mois
- Revenus du mois
- Taux satisfaction

**Graphiques:**
- Évolution RDV (ligne)
- Répartition par type intervention (pie)
- Revenus mensuels (bar)
- Taux de conversion (gauge)

**Tableaux:**
- Derniers utilisateurs
- RDV récents
- Réclamations ouvertes
- Top agences

#### 6.4.3 Gestion Utilisateurs (dashboard/admin/users)

**Fonctionnalités:**
- Liste tous utilisateurs
- Filtres: Rôle, Statut, Date
- Recherche
- Actions:
  - Créer utilisateur
  - Modifier
  - Désactiver/Activer
  - Supprimer
  - Réinitialiser mot de passe
  - Gérer permissions

**Rôles:**
- CLIENT
- AGENT
- ADMIN
- DIRECTION

#### 6.4.4 Gestion Catalogue (dashboard/admin/intervention-types)

**Types d'intervention:**
- Vidange
- Révision
- Freinage
- Climatisation
- Électricité
- Carrosserie
- Etc.

**Packages:**
- Nom
- Description
- Prix
- Durée estimée
- Interventions incluses

#### 6.4.5 Gestion Agences (dashboard/admin/agencies)

**Informations agence:**
- Nom
- Adresse
- Téléphone
- Email
- Horaires d'ouverture
- Capacité
- Services disponibles

#### 6.4.6 Rapports (dashboard/admin/reports)

**Types de rapports:**
- Rapport activité mensuel
- Rapport financier
- Rapport satisfaction client
- Rapport performance agents
- Export Excel/PDF

---

### 6.5 Dashboard DIRECTION

#### Fonctionnalités
- **Vue exécutive**
  - KPIs stratégiques
  - Graphiques revenus
  - Tendances
  - Prévisions
- **Statistiques avancées**
  - Analyse par période
  - Comparaisons
  - Taux de croissance
- **Rapports consolidés**
  - Export données
  - Tableaux de bord personnalisés

