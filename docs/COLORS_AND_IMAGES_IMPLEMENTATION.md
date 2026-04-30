# Gestion des Couleurs et Images de Véhicules - Plan d'Implémentation

## 📋 Vue d'ensemble

Implémentation de la gestion des couleurs de véhicules et des images (véhicule + carte grise).

**Date**: 30 avril 2026  
**Statut**: ✅ Backend complété - 🔄 Frontend en cours  

---

## ✅ Backend - COMPLÉTÉ

### 1. Base de Données
- ✅ Table `Couleur` existe déjà avec colonnes:
  - `id` (BIGINT, PRIMARY KEY)
  - `nom` (NVARCHAR(50))
  - `code_hex` (VARCHAR(7)) - Code couleur hexadécimal
  - `actif` (BIT)

- ✅ Table `Vehicule` mise à jour avec:
  - `image_vehicule` (NVARCHAR(500))
  - `image_carte_grise` (NVARCHAR(500))

### 2. Contrôleurs Backend
- ✅ `backend/controllers/colorController.js` - CRUD complet:
  - `getAllColors()` - Liste toutes les couleurs
  - `createColor()` - Créer une couleur (ADMIN)
  - `updateColor()` - Modifier une couleur (ADMIN)
  - `deleteColor()` - Supprimer une couleur (ADMIN)

- ✅ `backend/controllers/vehicleController.js` - Mis à jour:
  - Ajout de `image_vehicule` et `image_carte_grise` dans validation
  - Ajout des colonnes dans INSERT et UPDATE
  - Ajout des colonnes dans SELECT

### 3. Routes Backend
- ✅ `backend/routes/colorRoutes.js`:
  - `GET /api/colors` - Liste (authentifié)
  - `POST /api/colors` - Créer (ADMIN)
  - `PUT /api/colors/:id` - Modifier (ADMIN)
  - `DELETE /api/colors/:id` - Supprimer (ADMIN)

- ✅ Routes enregistrées dans `server.js`:
  ```javascript
  app.use('/api/colors', colorRoutes);
  ```

---

## 🔄 Frontend - À COMPLÉTER

### 1. Types TypeScript

**Fichier**: `frontend/types/vehicle.ts`

Ajouter:
```typescript
export interface Color {
  id: number;
  nom: string;
  code_hex?: string;
  actif: boolean;
}

export interface Vehicle {
  // ... champs existants
  couleur?: string;
  image_vehicule?: string;
  image_carte_grise?: string;
}
```

### 2. Client API

**Fichier**: `frontend/lib/api/colors.ts` - ✅ EXISTE DÉJÀ

Vérifier qu'il contient:
```typescript
export async function getAllColors(): Promise<Color[]>
export async function createColor(data: CreateColorDto): Promise<Color>
export async function updateColor(id: number, data: UpdateColorDto): Promise<Color>
export async function deleteColor(id: number): Promise<void>
```

### 3. Page Admin - Gestion des Couleurs

**Fichier**: `frontend/app/dashboard/admin/colors/page.tsx` - À CRÉER

Fonctionnalités:
- ✅ Liste des couleurs avec aperçu visuel (code_hex)
- ✅ Bouton "Ajouter une couleur"
- ✅ Modal pour créer/modifier une couleur
- ✅ Champ nom (texte)
- ✅ Champ code_hex (color picker)
- ✅ Toggle actif/inactif
- ✅ Bouton supprimer avec confirmation

### 4. Page Client - Ajout de Véhicule

**Fichier**: `frontend/app/client/vehicles/new/page.tsx` - À MODIFIER

Ajouter:
```typescript
// 1. État pour les couleurs
const [colors, setColors] = useState<Color[]>([]);

// 2. État pour les images
const [imageVehicule, setImageVehicule] = useState<File | null>(null);
const [imageCarteGrise, setImageCarteGrise] = useState<File | null>(null);

// 3. Charger les couleurs
useEffect(() => {
  loadColors();
}, []);

// 4. Ajouter dans le formulaire:
<div>
  <Label htmlFor="couleur">Couleur *</Label>
  <select
    id="couleur"
    value={form.couleur}
    onChange={(e) => setForm({ ...form, couleur: e.target.value })}
    className="w-full border rounded px-3 py-2"
  >
    <option value="">Sélectionnez une couleur</option>
    {colors.filter(c => c.actif).map(color => (
      <option key={color.id} value={color.nom}>
        {color.nom}
      </option>
    ))}
  </select>
</div>

// 5. Upload d'images
<div>
  <Label htmlFor="image_vehicule">Photo du véhicule</Label>
  <input
    type="file"
    id="image_vehicule"
    accept="image/*"
    onChange={(e) => setImageVehicule(e.target.files?.[0] || null)}
  />
</div>

<div>
  <Label htmlFor="image_carte_grise">Photo de la carte grise *</Label>
  <input
    type="file"
    id="image_carte_grise"
    accept="image/*"
    onChange={(e) => setImageCarteGrise(e.target.files?.[0] || null)}
  />
</div>
```

### 5. Upload d'Images

**Option 1: Upload Direct (Base64)**
```typescript
const uploadImage = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Dans handleSubmit:
const image_vehicule = imageVehicule ? await uploadImage(imageVehicule) : undefined;
const image_carte_grise = imageCarteGrise ? await uploadImage(imageCarteGrise) : undefined;
```

**Option 2: Upload vers Serveur (Recommandé)**

Créer un endpoint d'upload:
```javascript
// backend/routes/uploadRoutes.js
router.post('/upload/vehicle-image', 
  authMiddleware, 
  upload.single('image'),
  uploadController.uploadVehicleImage
);
```

Utiliser dans le frontend:
```typescript
const uploadImage = async (file: File, type: 'vehicle' | 'carte_grise'): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('type', type);
  
  const response = await api.post('/upload/vehicle-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  
  return response.data.url; // URL de l'image uploadée
};
```

### 6. Affichage des Images

**Fichier**: `frontend/app/client/vehicles/[id]/page.tsx` - À MODIFIER

Ajouter:
```typescript
{vehicle.image_vehicule && (
  <div>
    <h3>Photo du véhicule</h3>
    <img 
      src={vehicle.image_vehicule} 
      alt="Véhicule" 
      className="max-w-md rounded-lg shadow"
    />
  </div>
)}

{vehicle.image_carte_grise && (
  <div>
    <h3>Carte grise</h3>
    <img 
      src={vehicle.image_carte_grise} 
      alt="Carte grise" 
      className="max-w-md rounded-lg shadow"
    />
  </div>
)}
```

### 7. Menu Admin

**Fichier**: `frontend/app/dashboard/admin/layout.tsx`

Ajouter dans `ADMIN_NAV_ITEMS`:
```typescript
{
  label: 'Couleurs',
  href: '/dashboard/admin/colors',
  icon: <Palette className="w-5 h-5" />,
},
```

---

## 📝 Étapes d'Implémentation

### Phase 1: Page Admin Couleurs (30 min)
1. ✅ Créer `frontend/app/dashboard/admin/colors/page.tsx`
2. ✅ Créer composant `ColorModal.tsx` pour CRUD
3. ✅ Ajouter lien dans menu admin
4. ✅ Tester CRUD complet

### Phase 2: Sélection Couleur Client (15 min)
1. ✅ Modifier `frontend/app/client/vehicles/new/page.tsx`
2. ✅ Charger liste des couleurs actives
3. ✅ Ajouter dropdown de sélection
4. ✅ Tester ajout de véhicule avec couleur

### Phase 3: Upload d'Images (45 min)
1. ✅ Décider de la méthode d'upload (Base64 vs Serveur)
2. ✅ Si serveur: créer endpoint `/upload/vehicle-image`
3. ✅ Ajouter inputs file dans formulaire
4. ✅ Implémenter logique d'upload
5. ✅ Tester upload et sauvegarde

### Phase 4: Affichage Images (15 min)
1. ✅ Modifier page détails véhicule
2. ✅ Afficher images si présentes
3. ✅ Ajouter styles responsive
4. ✅ Tester affichage

---

## 🧪 Tests à Effectuer

### Tests Backend
- ✅ GET /api/colors - Liste des couleurs
- ✅ POST /api/colors - Créer couleur (ADMIN)
- ✅ PUT /api/colors/:id - Modifier couleur (ADMIN)
- ✅ DELETE /api/colors/:id - Supprimer couleur (ADMIN)
- ✅ POST /api/vehicles - Créer véhicule avec couleur et images
- ✅ GET /api/vehicles/:id - Vérifier images dans réponse

### Tests Frontend
- [ ] Admin peut créer/modifier/supprimer des couleurs
- [ ] Client voit liste des couleurs actives
- [ ] Client peut sélectionner une couleur
- [ ] Client peut uploader photo véhicule
- [ ] Client peut uploader photo carte grise
- [ ] Images s'affichent correctement dans détails véhicule
- [ ] Validation: carte grise obligatoire, photo véhicule optionnelle

---

## 🎨 Design UI

### Page Admin Couleurs
```
┌─────────────────────────────────────────┐
│ Gestion des Couleurs    [+ Ajouter]    │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ Nom        │ Aperçu │ Actif │ Actions│ │
│ ├─────────────────────────────────────┤ │
│ │ Blanc      │ ⬜     │  ✓   │ ✏️ 🗑️  │ │
│ │ Noir       │ ⬛     │  ✓   │ ✏️ 🗑️  │ │
│ │ Rouge      │ 🟥     │  ✓   │ ✏️ 🗑️  │ │
│ │ Bleu       │ 🟦     │  ✓   │ ✏️ 🗑️  │ │
│ │ Gris       │ ⬜     │  ✓   │ ✏️ 🗑️  │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Formulaire Véhicule (Section Couleur)
```
┌─────────────────────────────────────────┐
│ Couleur *                               │
│ ┌─────────────────────────────────────┐ │
│ │ Sélectionnez une couleur        ▼  │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Photo du véhicule                       │
│ ┌─────────────────────────────────────┐ │
│ │ 📷 Choisir un fichier...            │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Photo de la carte grise *               │
│ ┌─────────────────────────────────────┐ │
│ │ 📷 Choisir un fichier...            │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## 🔒 Sécurité

### Validation Backend
- ✅ Vérifier type MIME des images
- ✅ Limiter taille des fichiers (max 5MB)
- ✅ Valider format des images (JPEG, PNG, WebP)
- ✅ Sanitiser noms de fichiers
- ✅ Stocker dans dossier sécurisé

### Validation Frontend
- ✅ Vérifier type de fichier avant upload
- ✅ Afficher preview avant soumission
- ✅ Limiter taille côté client
- ✅ Afficher messages d'erreur clairs

---

## 📦 Dépendances

### Backend
- ✅ `multer` - Upload de fichiers (si option serveur)
- ✅ `sharp` - Redimensionnement d'images (optionnel)

### Frontend
- ✅ Aucune dépendance supplémentaire requise
- ✅ Utiliser `<input type="file">` natif
- ✅ Utiliser `FileReader` API pour preview

---

## 🚀 Déploiement

### Stockage des Images

**Option 1: Base64 dans DB** (Simple, pas recommandé pour production)
- ✅ Avantages: Simple, pas de gestion de fichiers
- ❌ Inconvénients: Taille DB, performance

**Option 2: Système de fichiers** (Recommandé pour dev)
- ✅ Stocker dans `backend/uploads/vehicles/`
- ✅ Servir via route statique Express
- ❌ Problème avec scaling horizontal

**Option 3: Cloud Storage** (Recommandé pour production)
- ✅ AWS S3, Azure Blob, Google Cloud Storage
- ✅ CDN pour performance
- ✅ Scalable et sécurisé

---

**Auteur**: Kiro AI Assistant  
**Projet**: STA Chery Tunisia - Système SAV  
**Version**: 1.0.0
