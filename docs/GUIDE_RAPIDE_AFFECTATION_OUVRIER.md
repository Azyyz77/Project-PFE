# 🚀 Guide Rapide: Affecter un Ouvrier à un Rendez-vous

**Pour:** Agents SAV  
**Temps:** 30 secondes  
**Difficulté:** ⭐ Facile

---

## 📋 Étapes

### 1️⃣ Aller sur la page des rendez-vous
```
http://localhost:3001/dashboard/agent
```

### 2️⃣ Trouver le rendez-vous
- Cherchez le rendez-vous du client
- Vérifiez qu'il est **CONFIRMÉ**

### 3️⃣ Cliquer sur "Affecter un ouvrier"
- Bouton à côté du rendez-vous
- Ou cliquez sur le rendez-vous puis "Affecter"

### 4️⃣ Sélectionner un ouvrier
- Liste des ouvriers de votre agence
- Choisissez selon la spécialité:
  - **Mécanique** → Problèmes moteur, transmission
  - **Électricité** → Problèmes électriques, batterie
  - **Carrosserie** → Réparations carrosserie
  - **Peinture** → Travaux de peinture

### 5️⃣ Ajouter des notes (optionnel)
```
Exemple: "Révision complète + vidange + filtre à air"
```

### 6️⃣ Cliquer sur "Affecter"
✅ **Terminé!** L'ouvrier est affecté.

---

## 📊 Statuts

Après l'affectation, le statut évolue:

```
🟡 EN_ATTENTE → Ouvrier affecté, pas encore commencé
     ↓
🔵 EN_COURS → Ouvrier travaille sur le véhicule
     ↓
🟢 TERMINE → Travail terminé
```

---

## 🎯 Exemple Complet

### Scénario:
Client **Martin Pierre** a un RDV à **10:00** pour une **révision** de son **Tiggo 8 Pro**.

### Actions:
1. Ouvrir la page des rendez-vous
2. Trouver: "10:00 - Martin Pierre - Tiggo 8 Pro"
3. Cliquer "Affecter un ouvrier"
4. Sélectionner: "Jean Dupont - Mécanique (Senior)"
5. Notes: "Révision 10 000 km + vidange"
6. Cliquer "Affecter"

### Résultat:
```
✅ Jean Dupont affecté au RDV de Martin Pierre
🟡 Statut: EN_ATTENTE
📝 Notes: Révision 10 000 km + vidange
```

---

## ❓ Questions Fréquentes

### Q: Puis-je affecter plusieurs ouvriers?
**R:** Non, un seul ouvrier par rendez-vous. Si besoin de plusieurs ouvriers, créez plusieurs rendez-vous.

### Q: Puis-je changer l'ouvrier affecté?
**R:** Oui, cliquez sur "Modifier" à côté de l'affectation.

### Q: Que faire si aucun ouvrier n'est disponible?
**R:** Contactez l'admin pour ajouter un nouvel ouvrier ou reportez le rendez-vous.

### Q: Comment l'ouvrier sait qu'il est affecté?
**R:** Il voit l'affectation dans sa liste de travail (à venir: notifications).

---

## 🔧 Gestion des Ouvriers

### Ajouter un nouvel ouvrier:
1. Aller sur `/dashboard/agent/workers`
2. Cliquer "Ajouter un ouvrier"
3. Remplir le formulaire:
   - Nom, Prénom
   - Téléphone
   - Spécialité
   - Niveau de compétence
4. Cliquer "Créer"

### Voir les affectations d'un ouvrier:
1. Aller sur `/dashboard/agent/workers`
2. Cliquer sur l'ouvrier
3. Voir la liste de ses affectations

---

## 📱 Raccourcis Clavier (à venir)

- `A` → Affecter un ouvrier
- `M` → Modifier l'affectation
- `T` → Marquer comme terminé

---

## ✅ Checklist Rapide

Avant d'affecter un ouvrier, vérifiez:

- [ ] Le rendez-vous est **CONFIRMÉ**
- [ ] L'ouvrier est **ACTIF**
- [ ] L'ouvrier a la bonne **SPÉCIALITÉ**
- [ ] L'ouvrier n'a pas trop d'affectations en cours

---

## 🎉 C'est Tout!

Le système est simple et rapide. En 30 secondes, vous pouvez affecter un ouvrier à un rendez-vous.

**Besoin d'aide?** Contactez l'admin ou consultez la documentation complète.

---

**Version:** 1.0  
**Date:** 3 Mai 2026
