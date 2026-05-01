# Implémentation de la Modification de Véhicule

## Statut: ✅ Backend prêt, Frontend en cours

### Ce qui a été fait:

1. **Types TypeScript mis à jour** ✅
   - Ajout de `image_vehicule` et `image_carte_grise` dans `Vehicle`, `CreateVehicleData`, et `UpdateVehicleData`
   - Fichier: `frontend/types/vehicle.ts`

2. **API Client mis à jour** ✅
   - Ajout de la fonction `getVehicleById(id, token)` pour récupérer un véhicule
   - Fonction `updateVehicle(id, data, token)` déjà existante
   - Fichier: `frontend/lib/api/vehicles.ts`

3. **Page de liste mise à jour** ✅
   - Bouton "Modifier" maintenant fonctionnel avec lien vers `/client/vehicles/${id}/edit`
   - Bouton "Supprimer" maintenant fonctionnel avec confirmation
   - Fichier: `frontend/app/client/vehicles/page.tsx`

4. **Backend** ✅
   - Controller `updateVehicle` supporte déjà les images
   - Fichier: `backend/controllers/vehicleController.js`

### Ce qui reste à faire:

**Créer la page de modification**: `frontend/app/client/vehicles/[id]/edit/page.tsx`

Le dossier a été créé: `frontend/app/client/vehicles/[id]/edit/`

## Instructions pour créer la page de modification

La page doit être basée sur `frontend/app/client/vehicles/new/page.tsx` avec les modifications suivantes:

### 1. Imports supplémentaires
```typescript
import { getVehicleById, updateVehicle } from '@/lib/api/vehicles';
import { useParams } from 'next/navigation';
```

### 2. Récupération de l'ID du véhicule
```typescript
const params = useParams();
const vehicleId = params.id as string;
```

### 3. Chargement des données du véhicule
```typescript
const [isLoadingVehicle, setIsLoadingVehicle] = useState(true);

useEffect(() => {
  const loadVehicle = async () => {
    if (!token || !vehicleId) return;
    
    setIsLoadingVehicle(true);
    try {
      const vehicle = await getVehicleById(parseInt(vehicleId), token);
      
      // Pré-remplir le formulaire
      setForm({
        numero_chassis: vehicle.numero_chassis,
        marque: vehicle.marque_nom || '',
        modele: vehicle.modele_nom || '',
        version_id: vehicle.version_id.toString(),
        annee: vehicle.annee.toString(),
        couleur: vehicle.couleur || '',
      });
      
      // Pré-remplir l'immatriculation
      const immat = vehicle.immatriculation;
      if (immat.includes('تونس')) {
        setPlateType('TUNIS');
        const parts = immat.split('تونس').map(p => p.trim());
        setTunisPlate({ part1: parts[0] || '', part2: parts[1] || '' });
      } else if (immat.includes('ن.ت')) {
        setPlateType('NT');
        setNtPlate(immat.replace('ن.ت', '').trim());
      }
      
      // Pré-remplir les images
      if (vehicle.image_vehicule) {
        setPreviewVehicule(vehicle.image_vehicule);
      }
      if (vehicle.image_carte_grise) {
        setPreviewCarteGrise(vehicle.image_carte_grise);
      }
      
    } catch (error: any) {
      console.error('Error loading vehicle:', error);
      toast.error('Erreur', { description: 'Impossible de charger le véhicule' });
      router.push('/client/vehicles');
    } finally {
      setIsLoadingVehicle(false);
    }
  };
  
  loadVehicle();
}, [token, vehicleId, router]);
```

### 4. Modifier handleSubmit pour utiliser updateVehicle
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setApiError('');
  setErrors({});

  const validationErrors = validateForm();
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }

  if (!user || !token) {
    setApiError('Vous devez être connecté pour modifier un véhicule');
    return;
  }

  setIsSubmitting(true);

  try {
    const immatriculation = buildImmatriculation();
    
    // Prepare image data
    const image_vehicule_base64 = previewVehicule || undefined;
    const image_carte_grise_base64 = previewCarteGrise || undefined;

    await updateVehicle(
      parseInt(vehicleId),
      {
        immatriculation,
        numero_chassis: form.numero_chassis.trim(),
        version_id: parseInt(form.version_id),
        couleur: form.couleur.trim() || undefined,
        annee: parseInt(form.annee),
        image_vehicule: image_vehicule_base64,
        image_carte_grise: image_carte_grise_base64,
      },
      token
    );

    setSuccess(true);
    toast.success('Véhicule modifié avec succès!', {
      description: 'Les modifications ont été enregistrées.',
    });

    setTimeout(() => {
      router.push('/client/vehicles');
    }, 2000);
  } catch (err: any) {
    const msg = err.message || 'Erreur lors de la modification du véhicule';
    setApiError(msg);
    toast.error('Erreur', { description: msg });
  } finally {
    setIsSubmitting(false);
  }
};
```

### 5. Modifier les textes de l'interface
- Titre: "Modifier un véhicule" au lieu de "Ajouter un véhicule"
- Bouton: "Enregistrer les modifications" au lieu de "Ajouter le véhicule"
- Message de succès: "Véhicule modifié!" au lieu de "Véhicule ajouté!"
- Lien retour: `/client/vehicles` au lieu de `/client/vehicles`

### 6. Validation des images
Pour la modification, la carte grise n'est plus obligatoire si elle existe déjà:
```typescript
const validateForm = () => {
  const newErrors: Record<string, string> = {};

  // ... autres validations ...

  // La carte grise n'est obligatoire que si elle n'existe pas déjà
  if (!imageCarteGrise && !previewCarteGrise) {
    newErrors.image_carte_grise = 'La photo de la carte grise est obligatoire';
  }

  return newErrors;
};
```

### 7. Affichage pendant le chargement
Ajouter un état de chargement au début:
```typescript
if (isLoadingVehicle || isLoadingCatalog || isLoadingColors) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-600" />
        <p className="mt-4 text-slate-600">Chargement...</p>
      </div>
    </div>
  );
}
```

## Résumé des changements par rapport à la page "new"

| Aspect | Page New | Page Edit |
|--------|----------|-----------|
| Route | `/client/vehicles/new` | `/client/vehicles/[id]/edit` |
| Titre | "Ajouter un véhicule" | "Modifier un véhicule" |
| Chargement initial | Formulaire vide | Pré-rempli avec données véhicule |
| API call | `POST /api/vehicles` | `PUT /api/vehicles/:id` |
| Fonction API | `createVehicle()` | `updateVehicle()` |
| Validation carte grise | Toujours obligatoire | Obligatoire si pas déjà présente |
| Message succès | "Véhicule ajouté" | "Véhicule modifié" |
| Bouton submit | "Ajouter le véhicule" | "Enregistrer les modifications" |

## Test de la fonctionnalité

1. Aller sur `/client/vehicles`
2. Cliquer sur le bouton "Modifier" (icône crayon) d'un véhicule
3. Vérifier que le formulaire est pré-rempli
4. Modifier des champs
5. Soumettre le formulaire
6. Vérifier que les modifications sont enregistrées
7. Vérifier la redirection vers la liste

## Fichiers modifiés

- ✅ `frontend/types/vehicle.ts` - Types mis à jour
- ✅ `frontend/lib/api/vehicles.ts` - Fonction `getVehicleById` ajoutée
- ✅ `frontend/app/client/vehicles/page.tsx` - Boutons Edit/Delete fonctionnels
- ⏳ `frontend/app/client/vehicles/[id]/edit/page.tsx` - À créer

## Notes importantes

1. **Réinitialisation du statut**: Quand un client modifie son véhicule, le backend remet automatiquement le statut à "EN_ATTENTE" (voir `vehicleController.js`)

2. **Images**: Les images existantes sont affichées en preview. L'utilisateur peut les remplacer ou les garder.

3. **Validation**: Même validation que pour la création, sauf pour la carte grise qui n'est obligatoire que si elle n'existe pas déjà.

4. **Permissions**: Seul le propriétaire du véhicule ou un ADMIN/AGENT peut modifier un véhicule (géré par le backend).
