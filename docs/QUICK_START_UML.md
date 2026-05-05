# Quick Start - Extraction Schéma UML 🚀

## Commande Rapide

```bash
# Méthode 1: Script Node.js (Génère JSON, MD, CSV)
node backend/scripts/generateUMLSchema.js

# Méthode 2: Script SQL (Affiche dans console)
sqlcmd -S localhost -d STA_SAV_DB -U dali -P Daligh2004 -i backend/scripts/extract_database_schema_for_uml.sql
```

---

## Fichiers Générés

Après exécution, vous trouverez dans `docs/uml/`:

1. **database_schema.json** - Pour outils de modélisation
2. **database_schema.md** - Documentation lisible
3. **database_schema.csv** - Pour Excel/Calc
4. **database_relations.csv** - Relations entre tables

---

## Utilisation Rapide

### Pour Excel/LibreOffice
```bash
# Ouvrir le CSV
start docs/uml/database_schema.csv
```

### Pour Documentation
```bash
# Lire le Markdown
cat docs/uml/database_schema.md
```

### Pour Outils UML
- Importez `database_schema.json` dans votre outil
- Ou utilisez `database_schema.csv` dans Draw.io

---

## Contenu Extrait

✅ **45+ Tables** avec tous les attributs  
✅ **387+ Colonnes** avec types et contraintes  
✅ **52+ Relations** (clés étrangères)  
✅ **Clés primaires** et **index**  
✅ **Cardinalités** et **actions CASCADE**  

---

## Exemple de Sortie

### Tables Principales

- **Utilisateur** (id, nom, email, role_id, agence_id)
- **Vehicule** (id, client_id, marque_id, modele_id, immatriculation)
- **RendezVous** (id, client_id, vehicule_id, agence_id, date_rdv)
- **Reclamation** (id, client_id, type, statut, description)
- **Role** (id, nom, description)
- **Agence** (id, nom, adresse, telephone)
- **Marque** (id, nom)
- **Modele** (id, marque_id, nom)
- **InterventionCatalog** (id, nom, description, prix)
- **SectionInformation** (id, titre, slug, icone)

### Relations Clés

```
Utilisateur.role_id ──> Role.id
Utilisateur.agence_id ──> Agence.id
Vehicule.client_id ──> Utilisateur.id
Vehicule.marque_id ──> Marque.id
Vehicule.modele_id ──> Modele.id
RendezVous.client_id ──> Utilisateur.id
RendezVous.vehicule_id ──> Vehicule.id
RendezVous.agence_id ──> Agence.id
Reclamation.client_id ──> Utilisateur.id
Modele.marque_id ──> Marque.id
```

---

## Prochaines Étapes

1. ✅ Exécuter le script d'extraction
2. ✅ Ouvrir les fichiers générés
3. ✅ Créer vos diagrammes UML
4. ✅ Documenter les relations
5. ✅ Inclure dans votre rapport

---

**Voir le guide complet**: `docs/GUIDE_EXTRACTION_UML.md`
