# 🚀 Démarrage Rapide - Système d'Affectation des Ouvriers

## Installation en 3 Étapes

### Étape 1: Créer les Tables SQL

```bash
# Ouvrir SQL Server Management Studio
# OU utiliser sqlcmd:

sqlcmd -S localhost -d STA_SAV_DB -U dali -P Daligh2004 -i backend/migrations/create_worker_assignment_system.sql
```

**Attendez le message:**
```
Système d'affectation des ouvriers créé avec succès!
```

---

### Étape 2: Redémarrer le Backend

```bash
# Arrêter le backend (Ctrl+C)
# Puis redémarrer:

cd backend
npm start
```

**Vérifiez que les routes sont chargées:**
```
✅ Routes /api/workers chargées
```

---

### Étape 3: Accéder à l'Interface

1. Connectez-vous en tant qu'**Agent SAV**
2. Allez sur: `http://localhost:3001/dashboard/agent/workers`
3. Vous verrez la page "Gestion des Ouvriers"

---

## 🧪 Test Rapide

### 1. Créer un Ouvrier de Test

```bash
curl -X POST http://localhost:3000/api/workers \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Dupont",
    "prenom": "Jean",
    "telephone": "+216 12 345 678",
    "specialite": "Mécanique",
    "niveau_competence": "Senior",
    "agence_id": 1
  }'
```

### 2. Vérifier dans l'Interface

- Allez sur `/dashboard/agent/workers`
- Vous devriez voir "Jean Dupont" dans la liste

### 3. Affecter à un Rendez-Vous

```bash
curl -X POST http://localhost:3000/api/workers/assignments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rendez_vous_id": 1,
    "ouvrier_id": 1,
    "priorite": "NORMALE",
    "temps_estime_minutes": 120
  }'
```

---

## ✅ Vérification

### Tables Créées
```sql
SELECT name FROM sys.tables 
WHERE name IN ('Ouvrier', 'AffectationOuvrier', 'CompetenceOuvrier', 'DisponibiliteOuvrier')
```

Devrait retourner 4 tables.

### Routes Disponibles
```bash
# Test simple
curl http://localhost:3000/api/workers/agency/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Devrait retourner la liste des ouvriers.

---

## 🎯 Utilisation

### Pour les Agents SAV

1. **Ajouter un Ouvrier**
   - Cliquez sur "Ajouter un ouvrier"
   - Remplissez le formulaire
   - Sauvegardez

2. **Affecter un Ouvrier**
   - Allez sur un rendez-vous
   - Cliquez sur "Affecter un ouvrier"
   - Sélectionnez l'ouvrier
   - Définissez la priorité
   - Confirmez

3. **Suivre les Affectations**
   - Onglet "Affectations"
   - Voir le statut en temps réel
   - Mettre à jour si nécessaire

---

## 📊 Données de Test

### Créer des Ouvriers de Test

```sql
INSERT INTO Ouvrier (nom, prenom, telephone, specialite, niveau_competence, agence_id)
VALUES 
  ('Dupont', 'Jean', '+216 12 345 678', 'Mécanique', 'Senior', 1),
  ('Martin', 'Pierre', '+216 23 456 789', 'Électricité', 'Intermédiaire', 1),
  ('Bernard', 'Paul', '+216 34 567 890', 'Carrosserie', 'Expert', 1);
```

---

## 🐛 Dépannage

### Problème: Tables non créées

**Solution:**
```sql
-- Vérifier si les tables existent
SELECT name FROM sys.tables WHERE name LIKE '%Ouvrier%'

-- Si vide, réexécuter le script
```

### Problème: Routes 404

**Solution:**
1. Vérifiez que le backend est redémarré
2. Vérifiez les logs: `Routes /api/workers`
3. Testez: `curl http://localhost:3000/api/workers/agency/1`

### Problème: Pas d'ouvriers affichés

**Solution:**
1. Vérifiez que vous êtes connecté en tant qu'Agent
2. Vérifiez votre `agence_id`
3. Créez un ouvrier de test

---

## 📚 Documentation Complète

Pour plus de détails, consultez:
- `docs/WORKER_ASSIGNMENT_SYSTEM.md` - Documentation complète
- `docs/DATABASE_COMPLETE_DIAGRAM.md` - Schéma de base de données

---

## 🎉 C'est Prêt!

Votre système d'affectation des ouvriers est maintenant opérationnel!

**Fonctionnalités disponibles:**
- ✅ Gestion des ouvriers
- ✅ Affectation aux rendez-vous
- ✅ Suivi des statuts
- ✅ Statistiques
- ✅ Priorités
- ✅ Évaluations

**Bon travail!** 🚀
