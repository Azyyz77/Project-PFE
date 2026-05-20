# CHERY SERVICE - MOBILE APP DESIGN SPECIFICATION
## Complete UI/UX Design Brief for Figma AI / Google Stitch

---

## 🎨 BRAND IDENTITY & COLOR PALETTE

### Primary Colors (from Chery Tunisia Website)
- **Primary Red**: `#DC2626` (Chery Brand Red)
- **Dark Red**: `#B91C1C` (Hover states)
- **Light Red**: `#FEE2E2` (Backgrounds, highlights)

### Neutral Colors
- **Dark Gray**: `#1E293B` (Text primary)
- **Medium Gray**: `#64748B` (Text secondary)
- **Light Gray**: `#F1F5F9` (Backgrounds)
- **White**: `#FFFFFF` (Cards, surfaces)
- **Border**: `#E2E8F0`

### Accent Colors
- **Success Green**: `#10B981`
- **Warning Orange**: `#F97316`
- **Info Blue**: `#3B82F6`

### Typography
- **Primary Font**: Inter, SF Pro Display, or Roboto
- **Headings**: Bold (700-900 weight)
- **Body**: Regular (400-500 weight)
- **Small Text**: Medium (500-600 weight)

---

## 📱 APP STRUCTURE - CLIENT VERSION ONLY

### AUTHENTICATION SCREENS (3 screens)

#### 1. LANDING SCREEN
**Purpose**: Welcome screen with app introduction

**Layout**:
- **Header Section** (Top 40%):
  - Gradient background: Red (#DC2626) to Dark Red (#B91C1C)
  - Chery logo (white, centered, 80x80px)
  - App title: "Chery Service" (white, bold, 32px)
  - Subtitle: "L'excellence de l'entretien, dans votre poche" (white, 14px)

- **Features Cards** (Middle 40%):
  - 3 horizontal cards with icons:
    - 📅 "Rendez-vous Facile" - "Réservez en quelques clics"
    - 🔧 "Suivi en Direct" - "L'état de votre véhicule"
    - 📄 "Historique & Factures" - "Tous vos documents centralisés"
  - Each card: White background, rounded corners (16px), shadow

- **Action Buttons** (Bottom 20%):
  - Primary button: "Se Connecter" (Red background, white text, full width)
  - Secondary button: "Créer un compte" (White background, red border, red text)

**Animations**: Fade in logo, slide up cards, pulse buttons

---

#### 2. LOGIN SCREEN
**Purpose**: User authentication

**Layout**:
- **Header** (Top 30%):
  - Red gradient background
  - Chery logo (60x60px, white circle background)
  - Title: "Bienvenue" (white, bold, 28px)
  - Subtitle: "Connectez-vous à votre espace" (white, 14px)

- **Form Card** (Middle 50%):
  - White card with shadow, rounded (24px)
  - **Input Fields**:
    - Email: Icon 📧, placeholder "exemple@email.com"
    - Password: Icon 🔒, placeholder "Mot de passe", eye icon to show/hide
  - Each input: Light gray background, rounded (12px), border on focus (red)
  
  - **Forgot Password Link**: "Mot de passe oublié?" (red, right-aligned, 13px)
  
  - **Login Button**: "Se connecter" (red background, white text, 56px height, rounded 16px)
  
  - **Divider**: Horizontal line with "ou" text in center
  
  - **Register Link**: "Pas encore de compte? S'inscrire" (gray text, red "S'inscrire")

**Validation**: Show error messages below inputs in red

---

#### 3. REGISTER SCREEN
**Purpose**: New user account creation

**Layout**:
- **Header** (Top 25%):
  - Red gradient background
  - Chery logo (60x60px)
  - Title: "Créer un compte" (white, bold, 28px)
  - Subtitle: "Rejoignez Chery Service" (white, 14px)

- **Progress Bar**: 3 dots, first one active (red), others gray

- **Form Card** (Scrollable):
  - White card with shadow
  - **Input Fields** (all with icons):
    - Row 1: Nom (👤) | Prénom (✨) - side by side
    - Email (📧) - full width
    - Téléphone (📱) - full width, placeholder "+216 XX XXX XXX"
    - Mot de passe (🔑) - full width, "Minimum 6 caractères"
    - Confirmer mot de passe (🔑) - full width
  
  - **Register Button**: "S'inscrire" (red, white text, 56px height)
  
  - **Divider**: "ou"
  
  - **Login Link**: "Déjà un compte? Se connecter"

**Validation**: Real-time validation, green checkmark when valid

---

### MAIN APP SCREENS (10 screens)

#### 4. HOME SCREEN (Dashboard)
**Purpose**: Main hub with quick actions and overview

**Layout**:
- **Header** (Fixed top):
  - White background with shadow
  - Left: Hamburger menu icon + "STA Premium Service" (bold, 18px)
  - Right: Notification bell (with red dot if unread) + Search icon
  - Both icons in light gray circles

- **Search Card**:
  - White card, rounded (16px)
  - Top: Avatar + Search input "Quel service recherchez-vous?"
  - Bottom: Two action buttons side by side:
    - "Prendre RDV" (📅 icon)
    - "Ajouter véhicule" (🚗 icon)
  - Separated by vertical divider

- **Section: Mes Véhicules**:
  - Header: "Mes Véhicules" (bold, 18px) + "Voir tout" (right, gray)
  - Horizontal scroll of vehicle cards:
    - Each card: 75% screen width, rounded (16px)
    - Top: Dark gray placeholder with car icon + "ÉTAT OPTIMAL" badge (white, top-right)
    - Bottom: Vehicle name (bold), immatriculation (gray)
  - If no vehicles: Dashed border card with "+" icon, "Ajouter un véhicule"

- **Section: Raccourcis**:
  - Header: "Raccourcis" (bold, 18px)
  - 3x2 grid of shortcut cards:
    - Véhicules (🚗 blue)
    - Rendez-vous (📅 red)
    - Réclamations (⚠️ orange)
    - Commandes (🛍️ green)
    - Factures (📄 purple)
    - Assurances (🛡️ blue)
  - Each: Icon in colored circle, label below

- **Support Card**:
  - White card with shadow
  - Left: "Besoin d'assistance?" (bold) + description
  - Right: Headset icon in gray circle
  - Bottom: Two buttons:
    - "Appeler" (light gray background, black text)
    - "Chat Live" (black background, white text)

**Background**: Light gray (#F4F6F9)

---

#### 5. VEHICLES LIST SCREEN
**Purpose**: View all registered vehicles

**Layout**:
- **Header**:
  - "← Retour" (left) | "Mes Véhicules" (center, bold) | "🔄" (right)
  - White background, shadow

- **Vehicle Cards** (Scrollable list):
  - Each card: White, rounded (16px), shadow
  - Top row: Car icon (🚗 in colored circle) + Vehicle name (bold) + Status badge
    - Status: "Validé" (green) or "En attente" (orange)
  - Divider line
  - Details grid:
    - ANNÉE: 2023
    - COULEUR: Blanc
    - KILOMÉTRAGE: 15,000 km
    - CHÂSSIS: VIN123456789
  - Each detail: Label (uppercase, small, gray) + Value (bold, black)

- **Add Button** (Bottom):
  - "+ Ajouter un véhicule" (outline button, red border)

- **Empty State** (if no vehicles):
  - 🚗 icon (large, 48px)
  - "Aucun véhicule" (bold)
  - Description text
  - "+ Ajouter un véhicule" button (red)

---

#### 6. ADD VEHICLE SCREEN
**Purpose**: Register a new vehicle

**Layout**:
- **Header**: Red gradient, "Ajouter un véhicule" (white, bold)

- **Form Card** (Scrollable):
  - White card, padding
  - **Input Fields**:
    - Marque (dropdown): Chery, Toyota, etc.
    - Modèle (text input)
    - Immatriculation (text input, placeholder "123 TU 1234")
    - Année (number picker)
    - Couleur (text input)
    - Kilométrage (number input, suffix "km")
    - Numéro de châssis (text input)
  
  - Each input: Light gray background, rounded (12px), icon on left

- **Bottom Button**:
  - "Enregistrer le véhicule" (red, white text, full width, fixed bottom)

**Validation**: Required fields marked with *, show errors below inputs

---

#### 7. BOOK APPOINTMENT - STEP 1
**Purpose**: Select agency, vehicle, and service type

**Layout**:
- **Modal Header**:
  - Red gradient background
  - "✕" close button (top-right, white circle)
  - "Réserver un rendez-vous" (white, bold, 24px)
  - "Étape 1 sur 3" (white, 14px)

- **Progress Bar**:
  - 3 bars: First active (red), others gray

- **Form Sections** (Scrollable):
  
  **Section 1: Agence ***
  - Label: "Agence *" (bold, 14px)
  - List of agency cards:
    - Each: White card, rounded (12px), border
    - Content: Agency name (bold) + City (gray)
    - Selected: Red border, red text, checkmark (✓)
  
  **Section 2: Véhicule ***
  - Label: "Véhicule *" (bold, 14px)
  - List of vehicle cards:
    - Each: Vehicle name (bold) + Immatriculation (gray)
    - Selected: Red border, checkmark
  
  **Section 3: Type de service ***
  - Label: "Type de service *" (bold, 14px)
  - List of service cards:
    - Each: Service category (bold) + Sub-type (gray)
    - Selected: Red border, checkmark
  
  **Section 4: Packages disponibles** (Optional)
  - Package cards:
    - Icon 🎁 + Name (bold) + Description (gray) + Price (red, bold)
    - Selected: Light red background, "✓ Sélectionné" badge

- **Bottom Button**:
  - "Continuer →" (red, white text, full width, fixed)
  - Disabled (gray) if required fields not filled

---

#### 8. BOOK APPOINTMENT - STEP 2
**Purpose**: Select date and time slot

**Layout**:
- **Modal Header**: Same as Step 1, "Étape 2 sur 3"

- **Progress Bar**: First two bars active (red)

- **Calendar Section**:
  - Month/Year header with navigation arrows
  - Calendar grid (7 columns):
    - Past dates: Gray, disabled
    - Available dates: White background, black text
    - Selected date: Red background, white text
    - Today: Red border
  - Days with appointments: Small dot indicator

- **Time Slots Section**:
  - Label: "Créneaux disponibles" (bold)
  - Grid of time slot buttons (2 columns):
    - Each: "09:00 - 10:00" format
    - Available: White background, gray border
    - Selected: Red background, white text
    - Unavailable: Gray background, strikethrough

- **Summary Card** (if selections made):
  - Light red background
  - Icon + Selected date and time
  - Agency name

- **Bottom Buttons**:
  - "← Retour" (outline, left)
  - "Continuer →" (red, right)

---

#### 9. BOOK APPOINTMENT - STEP 3
**Purpose**: Add description and confirm booking

**Layout**:
- **Modal Header**: "Étape 3 sur 3"

- **Progress Bar**: All three bars active (red)

- **Summary Card**:
  - White card with all selections:
    - 🏢 Agency
    - 🚗 Vehicle
    - 🔧 Service type
    - 📅 Date and time
  - Each line: Icon + Label + Value

- **Description Section**:
  - Label: "Description du problème" (bold)
  - Textarea: Multi-line input, light gray background
  - Placeholder: "Décrivez le problème ou les symptômes..."
  - Character counter: "0/500"

- **Terms Checkbox**:
  - Checkbox + "J'accepte les conditions générales"
  - Link: "conditions générales" (red, underlined)

- **Bottom Buttons**:
  - "← Retour" (outline)
  - "Confirmer le rendez-vous" (red, full width)

- **Success Modal** (after confirmation):
  - White card, centered
  - ✅ Green checkmark icon (large)
  - "Rendez-vous confirmé!" (bold, 24px)
  - Appointment details
  - "Retour à l'accueil" button (red)

---

#### 10. APPOINTMENTS LIST SCREEN
**Purpose**: View all appointments (past and upcoming)

**Layout**:
- **Header**: "Mes Rendez-vous" + Filter icon

- **Tabs**:
  - "À venir" (active, red underline)
  - "Passés" (gray)

- **Appointment Cards** (List):
  - Each card: White, rounded (16px), shadow
  - **Top Section**:
    - Left: Date badge (red background, white text, "15 JAN")
    - Right: Status badge ("Confirmé" green, "En attente" orange, "Annulé" red)
  - **Middle Section**:
    - Service type (bold, 16px)
    - Time: "09:00 - 10:00" (gray, with 🕐 icon)
    - Agency: "STA Tunis" (gray, with 📍 icon)
    - Vehicle: "Chery Tiggo 7" (gray, with 🚗 icon)
  - **Bottom Section**:
    - Two buttons:
      - "Détails" (outline, gray)
      - "Annuler" (red text) - only for upcoming

- **Empty State**:
  - 📅 icon (large)
  - "Aucun rendez-vous"
  - "Prenez votre premier rendez-vous"
  - "Prendre RDV" button (red)

- **Floating Action Button** (Bottom-right):
  - Red circle with "+" icon
  - Opens booking flow

---

#### 11. APPOINTMENT DETAIL SCREEN
**Purpose**: View full appointment information

**Layout**:
- **Header**: "← Retour" + "Détails du rendez-vous"

- **Status Banner**:
  - Full width, colored background based on status
  - Icon + Status text (large, bold)

- **Info Card**:
  - White card, sections separated by dividers
  - **Section 1: Date & Time**
    - 📅 Date: "Lundi 15 Janvier 2026"
    - 🕐 Heure: "09:00 - 10:00"
  - **Section 2: Location**
    - 🏢 Agence: "STA Tunis"
    - 📍 Adresse: Full address
    - "Voir sur la carte" link (red)
  - **Section 3: Vehicle**
    - 🚗 Véhicule: "Chery Tiggo 7 Pro"
    - Immatriculation
  - **Section 4: Service**
    - 🔧 Type: "Révision complète"
    - Description (if provided)
  - **Section 5: Reference**
    - 🔢 Numéro: "#RDV-2026-001"

- **Action Buttons** (Bottom):
  - "Modifier" (outline, gray) - if upcoming
  - "Annuler le rendez-vous" (red) - if upcoming
  - "Donner un avis" (red) - if completed

---

#### 12. COMPLAINTS SCREEN
**Purpose**: Submit and view complaints

**Layout**:
- **Header**: "Mes Réclamations" + "+ Nouvelle" button

- **Complaint Cards** (List):
  - Each card: White, rounded, shadow
  - Top: Complaint title (bold) + Status badge
    - "Ouverte" (orange)
    - "En cours" (blue)
    - "Résolue" (green)
    - "Fermée" (gray)
  - Middle: Description preview (2 lines, gray)
  - Bottom: Date + "Voir détails" link (red)

- **Empty State**:
  - ⚠️ icon
  - "Aucune réclamation"
  - "Vous n'avez pas encore soumis de réclamation"

- **Floating Action Button**:
  - Red circle with "+" icon
  - Opens complaint form

---

#### 13. INVOICES SCREEN
**Purpose**: View and download invoices

**Layout**:
- **Header**: "Mes Factures" + Filter icon

- **Invoice Cards** (List):
  - Each card: White, rounded, shadow
  - Left section:
    - 📄 Invoice icon (in colored circle)
    - Invoice number (bold, 16px)
    - Date (gray, 13px)
  - Right section:
    - Amount (bold, red, 18px) "1,250.000 TND"
    - Status badge: "Payée" (green) or "En attente" (orange)
  - Bottom:
    - "Télécharger PDF" button (outline, gray)
    - "Voir détails" link (red)

- **Summary Card** (Top):
  - Light blue background
  - Total amount (large, bold)
  - "Factures payées" + "Factures en attente"

- **Empty State**:
  - 📄 icon
  - "Aucune facture"
  - "Vos factures apparaîtront ici"

---

#### 14. PROFILE SCREEN
**Purpose**: View and edit user profile

**Layout**:
- **Header**: "← Retour" + "Mon Profil"

- **Avatar Card**:
  - Red gradient background
  - Large avatar circle (80x80px) with initials (white)
  - User name (white, bold, 24px)
  - Email (white, 14px)

- **Info Card**:
  - White card, rounded
  - Title: "Informations personnelles" (bold)
  - Info rows (each with icon + label + value):
    - 👤 Nom
    - ✨ Prénom
    - 📧 Email
    - 📱 Téléphone
    - 🔑 Rôle: "Client"
  - Each row separated by light border

- **Logout Button**:
  - White card with red border
  - "🚪 Déconnexion" (red text, centered)

---

#### 15. NOTIFICATIONS SCREEN
**Purpose**: View all notifications

**Layout**:
- **Header**: "← Retour" + "Notifications" + "Tout marquer comme lu"

- **Notification Cards** (List):
  - Each card: White (unread) or light gray (read)
  - Left: Icon in colored circle based on type:
    - 📅 Appointment (red)
    - 🔧 Service update (blue)
    - 📄 Invoice (purple)
    - ✅ Confirmation (green)
  - Middle:
    - Title (bold, 15px)
    - Message (gray, 13px)
    - Time ago (gray, 12px) "Il y a 2 heures"
  - Right: Unread dot (red) if unread

- **Empty State**:
  - 🔔 icon
  - "Aucune notification"
  - "Vous êtes à jour!"

---

## 🎯 DESIGN PRINCIPLES

### 1. Simplicity
- Clean layouts with plenty of white space
- Maximum 2-3 colors per screen
- Clear visual hierarchy
- One primary action per screen

### 2. Consistency
- Same button styles throughout
- Consistent spacing (8px grid system)
- Same card style (rounded 16px, shadow)
- Uniform icon style

### 3. Accessibility
- Minimum touch target: 44x44px
- High contrast text (WCAG AA)
- Clear labels and placeholders
- Error messages in red below inputs

### 4. Feedback
- Loading states (spinners)
- Success/error messages (toasts)
- Button press animations (scale down)
- Smooth transitions (300ms)

---

## 📐 SPACING & SIZING

### Spacing Scale (8px base)
- **xs**: 4px
- **sm**: 8px
- **md**: 16px
- **lg**: 24px
- **xl**: 32px
- **xxl**: 48px

### Border Radius
- **Small**: 8px (inputs)
- **Medium**: 12px (small cards)
- **Large**: 16px (main cards)
- **XLarge**: 24px (modals)
- **Full**: 9999px (buttons, badges)

### Font Sizes
- **xs**: 11px (labels)
- **sm**: 13px (secondary text)
- **base**: 15px (body text)
- **md**: 16px (card titles)
- **lg**: 18px (section headers)
- **xl**: 20px (screen titles)
- **xxl**: 24px (hero text)
- **xxxl**: 32px (landing title)

### Shadows
- **sm**: `0 1px 2px rgba(0,0,0,0.05)`
- **md**: `0 4px 6px rgba(0,0,0,0.07)`
- **lg**: `0 10px 15px rgba(0,0,0,0.1)`

---

## 🔄 ANIMATIONS & TRANSITIONS

### Entry Animations
- **Fade In**: Opacity 0 → 1 (600ms)
- **Slide Up**: TranslateY 20px → 0 (600ms)
- **Scale In**: Scale 0.9 → 1 (400ms)

### Interaction Animations
- **Button Press**: Scale 0.98 (100ms)
- **Card Hover**: TranslateY -2px (200ms)
- **Tab Switch**: Slide + Fade (300ms)

### Loading States
- **Spinner**: Rotate 360° continuous
- **Skeleton**: Shimmer effect (1500ms loop)
- **Progress Bar**: Width 0% → 100%

---

## 📱 RESPONSIVE BEHAVIOR

### Screen Sizes
- **Small**: 320px - 375px (iPhone SE)
- **Medium**: 375px - 414px (iPhone 12/13)
- **Large**: 414px+ (iPhone Pro Max, Android)

### Adaptations
- Cards: Full width with 16px margins
- Grids: 2 columns on small, 3 on large
- Text: Scale down 1-2px on small screens
- Buttons: Always full width on mobile

---

## 🎨 COMPONENT LIBRARY

### Buttons
1. **Primary**: Red background, white text, rounded full
2. **Secondary**: White background, red border, red text
3. **Outline**: Gray border, gray text
4. **Text**: No background, red text

### Cards
1. **Standard**: White, rounded 16px, shadow sm
2. **Elevated**: White, rounded 16px, shadow lg
3. **Colored**: Colored background, no shadow

### Inputs
1. **Text**: Light gray background, rounded 12px, icon left
2. **Dropdown**: Same as text + chevron down icon
3. **Textarea**: Same as text, multi-line, min-height 100px
4. **Checkbox**: Red when checked, gray border

### Badges
1. **Status**: Colored background, white text, rounded full, small
2. **Count**: Red background, white text, circle, small

### Icons
- Use Ionicons or Feather Icons
- Size: 20px (small), 24px (medium), 32px (large)
- Color: Match text or use brand colors

---

## ✅ FINAL CHECKLIST FOR FIGMA/GOOGLE AI

When generating designs, ensure:

✅ All screens use the Chery red (#DC2626) as primary color
✅ White cards with rounded corners (16px) and subtle shadows
✅ Light gray backgrounds (#F1F5F9 or #F4F6F9)
✅ Icons are simple and consistent (Ionicons style)
✅ Text hierarchy is clear (bold titles, regular body, gray secondary)
✅ Buttons are prominent with good touch targets (56px height)
✅ Forms have clear labels and validation states
✅ Empty states are friendly with icons and helpful text
✅ Loading and success states are included
✅ Navigation is intuitive (back buttons, bottom tabs if needed)
✅ Spacing follows 8px grid system
✅ All interactive elements have hover/pressed states

---

## 🚀 PROMPT FOR AI DESIGN TOOLS

**Copy this prompt to Figma AI or Google Stitch:**

"Create a modern mobile app design for Chery Service, an automotive service booking app. Use Chery brand red (#DC2626) as the primary color, with white cards on light gray backgrounds (#F1F5F9). The design should be clean, simple, and professional. Include these screens: Landing page with logo and 3 feature cards, Login screen with email/password inputs, Register screen with multiple form fields, Home dashboard with vehicle cards and service shortcuts, Vehicle list with detailed cards, Appointment booking flow (3 steps with progress bar), Appointments list with status badges, Profile screen with user info. Use rounded corners (16px), subtle shadows, and Ionicons-style icons. Follow modern iOS/Android design patterns with clear typography hierarchy, good spacing (8px grid), and prominent call-to-action buttons (56px height, red background). Include empty states, loading states, and success confirmations. Make it feel premium but accessible."

---

**END OF SPECIFICATION**

This document contains everything needed to generate a complete, professional mobile app design that matches your Chery Tunisia website branding. Use it with Figma AI, Google Stitch, or any AI design tool!