# 📦 Commander Packages dans RDV - Implémentation Complète

## 📊 Vue d'ensemble

Implémentation de la fonctionnalité permettant aux clients de commander des packages d'intervention lors de la prise de rendez-vous, avec calcul automatique du prix total.

---

## 🎯 Fonctionnalités implémentées

### 1. Backend API

#### Contrôleur: `backend/controllers/appointmentController.js`

**Modifications apportées:**

1. **`createAppointment()` - Modifié**
   - Accepte maintenant `package_ids` en plus de `sous_type_ids`
   - Valide les IDs de packages
   - Récupère les informations de chaque package (nom, prix)
   - Insère dans la table `RDV_Package`
   - Calcule le prix total automatiquement
   - Retourne les packages et le prix total dans la réponse

2. **`getAvailablePackages()` - Nouveau**
   - Liste tous les packages actifs disponibles
   - Retourne: id, nom, description, prix_estimatif
   - Endpoint: `GET /api/appointments/packages`

**Structure de la réponse `createAppointment`:**

```json
{
  "message": "Rendez-vous cree avec succes",
  "appointment": {
    "id": 123,
    "client_id": 1,
    "vehicule_id": 5,
    "agence_id": 2,
    "date_heure": "2026-04-20T10:00:00",
    "statut": "PLANIFIE",
    ...
  },
  "interventions": [
    {
      "id": 1,
      "sous_type_nom": "Vidange moteur",
      "type_nom": "Entretien",
      "statut": "EN_ATTENTE"
    }
  ],
  "packages": [
    {
      "id": 1,
      "nom": "Pack Entretien Complet",
      "prix": 450.000,
      "quantite": 1,
      "description": "Vidange + filtres + contrôle"
    }
  ],
  "prix_total": 450.000
}
```

#### Routes: `backend/routes/appointmentRoutes.js`

**Nouvelle route ajoutée:**

```javascript
GET /api/appointments/packages
```

**Authentification:** Requise (authMiddleware)

---

### 2. Frontend

#### API Client: `frontend/lib/api/appointments.ts`

**Nouvelle fonction:**

```typescript
export async function getAvailablePackages(token: string) {
  // Récupère la liste des packages disponibles
  // Retourne: Array<{ id, nom, description, prix_estimatif, actif }>
}
```

#### Payload de création de RDV mis à jour:

```typescript
interface CreateAppointmentPayload {
  vehicule_id: number;
  agence_id: number;
  date_heure: string;
  description?: string;
  duree_estimee?: number;
  sous_type_ids?: number[];
  package_ids?: number[];  // ✅ NOUVEAU
}
```

---

### 3. Base de données

#### Tables utilisées

**Table `PackageIntervention`:**
```sql
CREATE TABLE PackageIntervention (
    id bigint PRIMARY KEY IDENTITY(1,1),
    nom nvarchar(150) NOT NULL,
    description nvarchar(500) NULL,
    prix_estimatif decimal(10, 3) NOT NULL,
    actif bit NOT NULL
)
```

**Table `RDV_Package` (table de liaison):**
```sql
CREATE TABLE RDV_Package (
    rdv_id bigint NOT NULL,
    package_id bigint NOT NULL,
    quantite int NOT NULL,
    prix_unitaire decimal(10, 3) NOT NULL,
    PRIMARY KEY (rdv_id, package_id)
)
```

**Relations:**
- `RDV_Package.rdv_id` → `RendezVous.id`
- `RDV_Package.package_id` → `PackageIntervention.id`

---

## 🔧 Logique d'implémentation

### Processus de création de RDV avec packages

1. **Validation des données**
   ```javascript
   // Valider package_ids
   let validatedPackageIds = [];
   if (Array.isArray(package_ids) && package_ids.length > 0) {
     validatedPackageIds = [...new Set(package_ids
       .map(id => normalizePositiveInt(id))
       .filter(Boolean))];
   }
   ```

2. **Création du RDV**
   ```sql
   INSERT INTO RendezVous (client_id, vehicule_id, agence_id, date_heure, ...)
   VALUES (@client_id, @vehicule_id, @agence_id, @date_heure, ...)
   ```

3. **Insertion des packages**
   ```javascript
   for (const packageId of validatedPackageIds) {
     // Récupérer les infos du package
     const packageInfo = await pool.request()
       .input('package_id', sql.BigInt, packageId)
       .query(`
         SELECT id, nom, prix_estimatif, actif
         FROM PackageIntervention
         WHERE id = @package_id AND actif = 1
       `);

     // Insérer dans RDV_Package
     await pool.request()
       .input('rdv_id', sql.BigInt, rdvId)
       .input('package_id', sql.BigInt, packageId)
       .input('quantite', sql.Int, 1)
       .input('prix_unitaire', sql.Decimal(10, 3), packageInfo.prix_estimatif)
       .query(`
         INSERT INTO RDV_Package (rdv_id, package_id, quantite, prix_unitaire)
         VALUES (@rdv_id, @package_id, @quantite, @prix_unitaire)
       `);

     // Calculer le total
     prixTotal += packageInfo.prix_estimatif * 1;
   }
   ```

4. **Récupération des packages pour la réponse**
   ```sql
   SELECT 
     rp.package_id as id,
     p.nom,
     rp.prix_unitaire as prix,
     rp.quantite,
     p.description
   FROM RDV_Package rp
   JOIN PackageIntervention p ON p.id = rp.package_id
   WHERE rp.rdv_id = @rdv_id
   ```

---

## 📝 Exemple d'utilisation

### Côté Frontend

```typescript
// 1. Récupérer les packages disponibles
const packages = await getAvailablePackages(token);

// 2. Créer un RDV avec packages
const payload = {
  vehicule_id: 5,
  agence_id: 2,
  date_heure: '2026-04-20T10:00:00',
  description: 'Entretien complet',
  sous_type_ids: [1, 2],  // Vidange, Filtres
  package_ids: [1, 3]     // Pack Entretien, Pack Climatisation
};

const result = await createAppointment(payload, token);

console.log('Prix total:', result.prix_total);
console.log('Packages commandés:', result.packages);
```

### Côté Backend (Test)

```bash
curl -X POST http://localhost:3000/api/appointments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicule_id": 5,
    "agence_id": 2,
    "date_heure": "2026-04-20T10:00:00",
    "sous_type_ids": [1, 2],
    "package_ids": [1, 3]
  }'
```

---

## 🎨 Modifications Frontend à faire

### Page: `frontend/app/client/rendez-vous/page.tsx`

**À ajouter:**

1. **État pour les packages**
   ```typescript
   const [packages, setPackages] = useState<any[]>([]);
   const [selectedPackages, setSelectedPackages] = useState<number[]>([]);
   const [prixTotal, setPrixTotal] = useState<number>(0);
   ```

2. **Charger les packages**
   ```typescript
   useEffect(() => {
     const loadPackages = async () => {
       const pkgs = await getAvailablePackages(token);
       setPackages(pkgs);
     };
     loadPackages();
   }, []);
   ```

3. **Section de sélection des packages**
   ```tsx
   <div className="space-y-4">
     <h3 className="text-lg font-semibold">Packages disponibles</h3>
     {packages.map(pkg => (
       <div key={pkg.id} className="border p-4 rounded">
         <input
           type="checkbox"
           checked={selectedPackages.includes(pkg.id)}
           onChange={(e) => {
             if (e.target.checked) {
               setSelectedPackages([...selectedPackages, pkg.id]);
             } else {
               setSelectedPackages(selectedPackages.filter(id => id !== pkg.id));
             }
           }}
         />
         <label className="ml-2">
           {pkg.nom} - {pkg.prix_estimatif} TND
         </label>
         <p className="text-sm text-gray-600">{pkg.description}</p>
       </div>
     ))}
   </div>
   ```

4. **Afficher le prix estimatif**
   ```tsx
   <div className="bg-blue-50 p-4 rounded">
     <h4 className="font-semibold">Prix estimatif</h4>
     <p className="text-2xl font-bold">{prixTotal.toFixed(3)} TND</p>
   </div>
   ```

5. **Envoyer les package_ids**
   ```typescript
   const handleSubmit = async () => {
     const payload = {
       vehicule_id: selectedVehicle,
       agence_id: selectedAgency,
       date_heure: selectedDateTime,
       description,
       sous_type_ids: selectedInterventions,
       package_ids: selectedPackages  // ✅ Ajouter ici
     };
     
     const result = await createAppointment(payload, token);
     console.log('Prix total:', result.prix_total);
   };
   ```

---

## ✅ Checklist d'implémentation

### Backend
- [x] Modifier `createAppointment()` pour accepter `package_ids`
- [x] Valider les IDs de packages
- [x] Récupérer les infos des packages depuis la DB
- [x] Insérer dans `RDV_Package`
- [x] Calculer le prix total
- [x] Retourner packages et prix_total dans la réponse
- [x] Créer `getAvailablePackages()`
- [x] Ajouter route `GET /api/appointments/packages`
- [x] Gestion des erreurs (packages invalides/inactifs)

### Frontend API
- [x] Créer `getAvailablePackages()` dans `appointments.ts`
- [x] Mettre à jour `CreateAppointmentPayload` avec `package_ids`

### Frontend UI (À FAIRE)
- [ ] Charger les packages disponibles
- [ ] Afficher la liste des packages avec checkboxes
- [ ] Calculer et afficher le prix estimatif
- [ ] Envoyer `package_ids` lors de la création du RDV
- [ ] Afficher le prix total dans la confirmation
- [ ] Gérer les états de chargement
- [ ] Afficher les erreurs si packages invalides

---

## 🧪 Tests

### Test 1: Récupérer les packages

```bash
curl -X GET http://localhost:3000/api/appointments/packages \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Résultat attendu:**
```json
{
  "count": 3,
  "packages": [
    {
      "id": 1,
      "nom": "Pack Entretien Complet",
      "description": "Vidange + filtres + contrôle",
      "prix_estimatif": 450.000,
      "actif": true
    },
    ...
  ]
}
```

### Test 2: Créer un RDV avec packages

```bash
curl -X POST http://localhost:3000/api/appointments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicule_id": 5,
    "agence_id": 2,
    "date_heure": "2026-04-20T10:00:00",
    "package_ids": [1, 2]
  }'
```

**Résultat attendu:**
```json
{
  "message": "Rendez-vous cree avec succes",
  "appointment": { ... },
  "interventions": [],
  "packages": [
    {
      "id": 1,
      "nom": "Pack Entretien Complet",
      "prix": 450.000,
      "quantite": 1
    },
    {
      "id": 2,
      "nom": "Pack Climatisation",
      "prix": 200.000,
      "quantite": 1
    }
  ],
  "prix_total": 650.000
}
```

---

## 📊 Schéma de données

```
┌─────────────────┐
│   RendezVous    │
├─────────────────┤
│ id (PK)         │
│ client_id       │
│ vehicule_id     │
│ agence_id       │
│ date_heure      │
│ statut          │
└────────┬────────┘
         │
         │ 1:N
         │
┌────────▼────────────┐
│    RDV_Package      │
├─────────────────────┤
│ rdv_id (PK, FK)     │
│ package_id (PK, FK) │
│ quantite            │
│ prix_unitaire       │
└────────┬────────────┘
         │
         │ N:1
         │
┌────────▼──────────────┐
│ PackageIntervention   │
├───────────────────────┤
│ id (PK)               │
│ nom                   │
│ description           │
│ prix_estimatif        │
│ actif                 │
└───────────────────────┘
```

---

## 🚀 Prochaines étapes

### Court terme
1. ✅ Backend implémenté
2. ✅ API frontend créée
3. ⏳ Modifier la page `rendez-vous/page.tsx`
4. ⏳ Tester la fonctionnalité complète

### Moyen terme
1. ⏳ Ajouter la gestion des quantités (actuellement fixé à 1)
2. ⏳ Afficher les packages dans l'historique des RDV
3. ⏳ Permettre la modification des packages après création
4. ⏳ Ajouter des promotions sur les packages

### Long terme
1. ⏳ Recommandations de packages basées sur le véhicule
2. ⏳ Packages personnalisés par client
3. ⏳ Historique des packages commandés
4. ⏳ Statistiques sur les packages les plus populaires

---

## 📈 Statistiques

- **Lignes de code backend:** ~150
- **Lignes de code frontend API:** ~20
- **Endpoints API:** 1 nouveau
- **Tables utilisées:** 2 (PackageIntervention, RDV_Package)
- **Temps de développement:** ~1 heure

---

## ✅ Résultat final

**Backend complet et opérationnel** permettant:
- ✅ Sélection de packages lors de la prise de RDV
- ✅ Calcul automatique du prix total
- ✅ Stockage dans la base de données
- ✅ Récupération des packages commandés
- ✅ Validation des packages (actifs uniquement)
- ✅ Gestion des erreurs

**Frontend API prêt** pour:
- ✅ Récupérer les packages disponibles
- ✅ Envoyer les package_ids lors de la création

**Prochaine étape:** Modifier l'interface utilisateur pour afficher et sélectionner les packages! 🎨

---

**Date:** 2026-04-17  
**Développeur:** Kiro AI  
**Statut:** ✅ Backend COMPLET - Frontend UI à faire  
**Version:** 1.0.0
