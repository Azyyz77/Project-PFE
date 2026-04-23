# Base de Données STA Chery Tunisia - Structure Complète et Relations

## 📊 Vue d'Ensemble du Système

Le système STA Chery Tunisia est une application de gestion de service après-vente automobile avec les modules suivants :
- **Gestion des utilisateurs** (Clients, Agents, Admins, Direction)
- **Gestion des véhicules** et historique
- **Système de rendez-vous** et planification
- **Gestion des réclamations**
- **Système de diagnostic** et problèmes prédéfinis
- **Catalogue d'interventions** et packages
- **Système de modération** des fichiers
- **Promotions** et documents
- **Audit** et notifications

---

## 🗄️ TABLES PRINCIPALES ET STRUCTURE

### 1. **GESTION DES UTILISATEURS**

#### Table `Utilisateur`
```sql
CREATE TABLE Utilisateur (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    nom NVARCHAR(100) NOT NULL,
    prenom NVARCHAR(100) NOT NULL,
    email NVARCHAR(255) UNIQUE NOT NULL,
    mot_de_passe NVARCHAR(255) NOT NULL,
    telephone NVARCHAR(20),
    telephone_verifie BIT DEFAULT 0,
    code_client NVARCHAR(50),
    adresse NVARCHAR(500),
    role_id BIGINT NOT NULL,
    agence_id BIGINT,
    actif BIT DEFAULT 1,
    date_creation DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (role_id) REFERENCES Role(id),
    FOREIGN KEY (agence_id) REFERENCES Agence(id)
);
```

#### Table `Role`
```sql
CREATE TABLE Role (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    nom NVARCHAR(50) UNIQUE NOT NULL, -- CLIENT, AGENT, ADMIN, SUPER_ADMIN, DIRECTION
    description NVARCHAR(200),
    actif BIT DEFAULT 1
);
```

#### Table `Permission`
```sql
CREATE TABLE Permission (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    role_id BIGINT NOT NULL,
    module NVARCHAR(100) NOT NULL,
    action NVARCHAR(100) NOT NULL,
    FOREIGN KEY (role_id) REFERENCES Role(id)
);
```

### 2. **GESTION DES AGENCES**

#### Table `Agence`
```sql
CREATE TABLE Agence (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    nom NVARCHAR(150) NOT NULL,
    adresse NVARCHAR(500),
    telephone NVARCHAR(20),
    email NVARCHAR(255),
    ville NVARCHAR(100),
    code_postal NVARCHAR(10),
    actif BIT DEFAULT 1,
    date_creation DATETIME2 DEFAULT GETDATE()
);
```

#### Table `PlageHoraire`
```sql
CREATE TABLE PlageHoraire (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    agence_id BIGINT NOT NULL,
    jour_semaine TINYINT NOT NULL, -- 0=Dimanche, 1=Lundi, ..., 6=Samedi
    heure_debut TIME NOT NULL,
    heure_fin TIME NOT NULL,
    capacite INT DEFAULT 5,
    actif BIT DEFAULT 1,
    date_creation DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (agence_id) REFERENCES Agence(id)
);
```

### 3. **GESTION DES VÉHICULES**

#### Table `Marque`
```sql
CREATE TABLE Marque (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    nom NVARCHAR(100) NOT NULL,
    actif BIT DEFAULT 1
);
```

#### Table `Modele`
```sql
CREATE TABLE Modele (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    marque_id BIGINT NOT NULL,
    nom NVARCHAR(150) NOT NULL,
    actif BIT DEFAULT 1,
    FOREIGN KEY (marque_id) REFERENCES Marque(id)
);
```

#### Table `Version`
```sql
CREATE TABLE Version (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    modele_id BIGINT NOT NULL,
    nom NVARCHAR(150) NOT NULL,
    annee INT,
    actif BIT DEFAULT 1,
    FOREIGN KEY (modele_id) REFERENCES Modele(id)
);
```

#### Table `Couleur`
```sql
CREATE TABLE Couleur (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    nom NVARCHAR(50) NOT NULL,
    code_hex VARCHAR(7),
    actif BIT DEFAULT 1,
    date_creation DATETIME2 DEFAULT GETDATE()
);
```

#### Table `Vehicule`
```sql
CREATE TABLE Vehicule (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    client_id BIGINT NOT NULL,
    version_id BIGINT NOT NULL,
    couleur_id BIGINT,
    numero_chassis NVARCHAR(50) UNIQUE,
    numero_immatriculation NVARCHAR(20),
    date_achat DATE,
    kilometrage INT,
    statut_validation NVARCHAR(20) DEFAULT 'EN_ATTENTE', -- EN_ATTENTE, VALIDE, REJETE
    agent_validation_id BIGINT,
    date_validation DATETIME2,
    commentaire_validation NVARCHAR(500),
    actif BIT DEFAULT 1,
    date_creation DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (client_id) REFERENCES Utilisateur(id),
    FOREIGN KEY (version_id) REFERENCES Version(id),
    FOREIGN KEY (couleur_id) REFERENCES Couleur(id),
    FOREIGN KEY (agent_validation_id) REFERENCES Utilisateur(id)
);
```

### 4. **SYSTÈME DE RENDEZ-VOUS**

#### Table `RendezVous`
```sql
CREATE TABLE RendezVous (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    client_id BIGINT NOT NULL,
    vehicule_id BIGINT NOT NULL,
    agence_id BIGINT NOT NULL,
    agent_id BIGINT,
    date_heure DATETIME2 NOT NULL,
    type_intervention NVARCHAR(100),
    description_probleme NVARCHAR(1000),
    statut NVARCHAR(50) DEFAULT 'EN_ATTENTE', -- EN_ATTENTE, CONFIRME, EN_COURS, TERMINE, ANNULE
    priorite NVARCHAR(20) DEFAULT 'NORMALE', -- FAIBLE, NORMALE, HAUTE, URGENTE
    utilisateur_annulation BIGINT,
    raison_annulation NVARCHAR(500),
    date_annulation DATETIME2,
    date_creation DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (client_id) REFERENCES Utilisateur(id),
    FOREIGN KEY (vehicule_id) REFERENCES Vehicule(id),
    FOREIGN KEY (agence_id) REFERENCES Agence(id),
    FOREIGN KEY (agent_id) REFERENCES Utilisateur(id),
    FOREIGN KEY (utilisateur_annulation) REFERENCES Utilisateur(id)
);
```

#### Table `Feedback`
```sql
CREATE TABLE Feedback (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    rendez_vous_id BIGINT NOT NULL,
    note INT CHECK (note >= 1 AND note <= 5),
    commentaire NVARCHAR(1000),
    date_feedback DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (rendez_vous_id) REFERENCES RendezVous(id)
);
```

### 5. **SYSTÈME DE RÉCLAMATIONS**

#### Table `Reclamation`
```sql
CREATE TABLE Reclamation (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    client_id BIGINT NOT NULL,
    vehicule_id BIGINT,
    agence_id BIGINT,
    agent_id BIGINT,
    titre NVARCHAR(200) NOT NULL,
    description NVARCHAR(2000) NOT NULL,
    statut NVARCHAR(50) DEFAULT 'OUVERTE', -- OUVERTE, EN_COURS, RESOLUE, FERMEE
    priorite NVARCHAR(20) DEFAULT 'NORMALE',
    date_creation DATETIME2 DEFAULT GETDATE(),
    date_resolution DATETIME2,
    FOREIGN KEY (client_id) REFERENCES Utilisateur(id),
    FOREIGN KEY (vehicule_id) REFERENCES Vehicule(id),
    FOREIGN KEY (agence_id) REFERENCES Agence(id),
    FOREIGN KEY (agent_id) REFERENCES Utilisateur(id)
);
```

### 6. **SYSTÈME DE DIAGNOSTIC**

#### Table `ProblemePredefini`
```sql
CREATE TABLE ProblemePredefini (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    nom NVARCHAR(150) NOT NULL,
    description NVARCHAR(MAX),
    solution NVARCHAR(MAX),
    categorie NVARCHAR(50) NOT NULL,
    actif BIT DEFAULT 1
);
```

#### Table `Diagnostic`
```sql
CREATE TABLE Diagnostic (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    rdv_id BIGINT NOT NULL,
    agent_id BIGINT NOT NULL,
    symptomes NVARCHAR(1000),
    diagnostic_initial NVARCHAR(1000),
    actions_effectuees NVARCHAR(2000),
    pieces_utilisees NVARCHAR(1000),
    temps_intervention INT, -- en minutes
    cout_total DECIMAL(10,3),
    statut NVARCHAR(50) DEFAULT 'EN_COURS',
    date_creation DATETIME2 DEFAULT GETDATE(),
    date_finalisation DATETIME2,
    FOREIGN KEY (rdv_id) REFERENCES RendezVous(id),
    FOREIGN KEY (agent_id) REFERENCES Utilisateur(id)
);
```

#### Table `ProblemesDiagnostic`
```sql
CREATE TABLE ProblemesDiagnostic (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    diagnostic_id BIGINT NOT NULL,
    probleme_predefini_id BIGINT NOT NULL,
    FOREIGN KEY (diagnostic_id) REFERENCES Diagnostic(id),
    FOREIGN KEY (probleme_predefini_id) REFERENCES ProblemePredefini(id)
);
```

### 7. **CATALOGUE D'INTERVENTIONS**

#### Table `TypeIntervention`
```sql
CREATE TABLE TypeIntervention (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    nom NVARCHAR(150) NOT NULL,
    description NVARCHAR(500),
    actif BIT DEFAULT 1
);
```

#### Table `SousTypeIntervention`
```sql
CREATE TABLE SousTypeIntervention (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    type_intervention_id BIGINT NOT NULL,
    nom NVARCHAR(150) NOT NULL,
    description NVARCHAR(500),
    prix DECIMAL(10,3),
    duree_estimee NVARCHAR(50),
    actif BIT DEFAULT 1,
    FOREIGN KEY (type_intervention_id) REFERENCES TypeIntervention(id)
);
```

#### Table `PackageIntervention`
```sql
CREATE TABLE PackageIntervention (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    nom NVARCHAR(150) NOT NULL,
    description NVARCHAR(500),
    prix DECIMAL(10,3) NOT NULL,
    duree_estimee NVARCHAR(50),
    actif BIT DEFAULT 1,
    date_creation DATETIME2 DEFAULT GETDATE()
);
```

#### Table `Package_SousType`
```sql
CREATE TABLE Package_SousType (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    package_id BIGINT NOT NULL,
    sous_type_id BIGINT NOT NULL,
    FOREIGN KEY (package_id) REFERENCES PackageIntervention(id),
    FOREIGN KEY (sous_type_id) REFERENCES SousTypeIntervention(id)
);
```

### 8. **SYSTÈME DE FICHIERS ET MODÉRATION**

#### Table `PieceJointe`
```sql
CREATE TABLE PieceJointe (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    entite_type NVARCHAR(20) NOT NULL, -- RDV, RECLAMATION
    entite_id BIGINT NOT NULL,
    url NVARCHAR(255) NOT NULL, -- nom du fichier
    type_mime NVARCHAR(100),
    taille_mo DECIMAL(8,2),
    date_upload DATETIME2 DEFAULT GETDATE(),
    -- Colonnes de modération
    statut_moderation NVARCHAR(20) DEFAULT 'EN_ATTENTE', -- EN_ATTENTE, APPROUVE, REJETE
    modere_par BIGINT,
    date_moderation DATETIME2,
    commentaire_moderation NVARCHAR(500),
    FOREIGN KEY (modere_par) REFERENCES Utilisateur(id),
    CONSTRAINT CK_StatutModeration CHECK (statut_moderation IN ('EN_ATTENTE', 'APPROUVE', 'REJETE')),
    CONSTRAINT CK_EntiteType CHECK (entite_type IN ('RDV', 'RECLAMATION'))
);
```

### 9. **SYSTÈME DE PROMOTIONS ET DOCUMENTS**

#### Table `Promotion`
```sql
CREATE TABLE Promotion (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    admin_id BIGINT NOT NULL,
    titre NVARCHAR(200) NOT NULL,
    description NVARCHAR(MAX),
    image_url NVARCHAR(500),
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    actif BIT DEFAULT 1,
    date_creation DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (admin_id) REFERENCES Utilisateur(id)
);
```

#### Table `Document`
```sql
CREATE TABLE Document (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    titre NVARCHAR(200) NOT NULL,
    description NVARCHAR(MAX),
    url NVARCHAR(500) NOT NULL,
    categorie NVARCHAR(50) NOT NULL, -- Garantie, Assurance, SAV, Manuel
    type_mime NVARCHAR(100),
    taille_mo DECIMAL(8,2),
    admin_id BIGINT NOT NULL,
    actif BIT DEFAULT 1,
    date_creation DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (admin_id) REFERENCES Utilisateur(id)
);
```

### 10. **SYSTÈME D'AUDIT ET NOTIFICATIONS**

#### Table `AuditLog`
```sql
CREATE TABLE AuditLog (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    utilisateur_id BIGINT,
    action NVARCHAR(100) NOT NULL,
    table_name NVARCHAR(100),
    record_id BIGINT,
    old_values NVARCHAR(MAX),
    new_values NVARCHAR(MAX),
    ip_address NVARCHAR(45),
    user_agent NVARCHAR(500),
    date_action DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (utilisateur_id) REFERENCES Utilisateur(id)
);
```

#### Table `Notification`
```sql
CREATE TABLE Notification (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    utilisateur_id BIGINT NOT NULL,
    titre NVARCHAR(200) NOT NULL,
    message NVARCHAR(1000) NOT NULL,
    type NVARCHAR(50) DEFAULT 'INFO', -- INFO, WARNING, ERROR, SUCCESS
    lu BIT DEFAULT 0,
    date_creation DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (utilisateur_id) REFERENCES Utilisateur(id)
);
```

---

## 🔗 RELATIONS ET CONTRAINTES PRINCIPALES

### **Relations Utilisateur-Centriques**
```
Utilisateur (1) ←→ (N) Vehicule
Utilisateur (1) ←→ (N) RendezVous (comme client)
Utilisateur (1) ←→ (N) RendezVous (comme agent)
Utilisateur (1) ←→ (N) Reclamation (comme client)
Utilisateur (1) ←→ (N) Reclamation (comme agent assigné)
Utilisateur (1) ←→ (N) Diagnostic (comme agent)
Utilisateur (1) ←→ (N) PieceJointe (comme modérateur)
```

### **Relations Véhicule-Centriques**
```
Marque (1) ←→ (N) Modele
Modele (1) ←→ (N) Version
Version (1) ←→ (N) Vehicule
Couleur (1) ←→ (N) Vehicule
Vehicule (1) ←→ (N) RendezVous
Vehicule (1) ←→ (N) Reclamation
```

### **Relations Service-Centriques**
```
Agence (1) ←→ (N) Utilisateur (agents)
Agence (1) ←→ (N) PlageHoraire
Agence (1) ←→ (N) RendezVous
RendezVous (1) ←→ (1) Diagnostic
RendezVous (1) ←→ (N) PieceJointe
RendezVous (1) ←→ (1) Feedback
```

### **Relations Catalogue-Centriques**
```
TypeIntervention (1) ←→ (N) SousTypeIntervention
PackageIntervention (N) ←→ (N) SousTypeIntervention (via Package_SousType)
ProblemePredefini (N) ←→ (N) Diagnostic (via ProblemesDiagnostic)
```

---

## 📋 CONTRAINTES ET RÈGLES MÉTIER

### **Contraintes de Validation**
- `Vehicule.statut_validation` : EN_ATTENTE, VALIDE, REJETE
- `RendezVous.statut` : EN_ATTENTE, CONFIRME, EN_COURS, TERMINE, ANNULE
- `RendezVous.priorite` : FAIBLE, NORMALE, HAUTE, URGENTE
- `Reclamation.statut` : OUVERTE, EN_COURS, RESOLUE, FERMEE
- `PieceJointe.statut_moderation` : EN_ATTENTE, APPROUVE, REJETE
- `PieceJointe.entite_type` : RDV, RECLAMATION
- `Feedback.note` : 1 à 5

### **Contraintes de Rôles**
- `Role.nom` : CLIENT, AGENT, ADMIN, SUPER_ADMIN, DIRECTION
- Seuls les AGENT/ADMIN peuvent modérer les fichiers
- Seuls les ADMIN peuvent créer des promotions/documents
- Les clients ne voient que leurs propres données

### **Contraintes Temporelles**
- `Promotion.date_debut` < `Promotion.date_fin`
- `RendezVous.date_heure` doit être dans le futur lors de la création
- `PlageHoraire.heure_debut` < `PlageHoraire.heure_fin`

---

## 🎯 VUES ET REQUÊTES IMPORTANTES

### **Vue Planning Agence**
```sql
CREATE VIEW PlanningAgence AS
SELECT 
    r.id,
    r.date_heure,
    c.nom + ' ' + c.prenom AS client_nom,
    a.nom AS agence_nom,
    ag.nom + ' ' + ag.prenom AS agent_nom,
    r.statut,
    r.type_intervention
FROM RendezVous r
JOIN Utilisateur c ON c.id = r.client_id
JOIN Agence a ON a.id = r.agence_id
LEFT JOIN Utilisateur ag ON ag.id = r.agent_id;
```

### **Statistiques Direction**
```sql
-- Nombre de RDV par statut
SELECT statut, COUNT(*) as nombre
FROM RendezVous 
GROUP BY statut;

-- Satisfaction client moyenne
SELECT AVG(CAST(note AS FLOAT)) as satisfaction_moyenne
FROM Feedback;

-- Véhicules par marque
SELECT ma.nom, COUNT(*) as nombre_vehicules
FROM Vehicule v
JOIN Version ve ON ve.id = v.version_id
JOIN Modele mo ON mo.id = ve.modele_id
JOIN Marque ma ON ma.id = mo.marque_id
GROUP BY ma.nom;
```

---

## 🔧 INDEX RECOMMANDÉS

```sql
-- Index pour les recherches fréquentes
CREATE INDEX IX_Utilisateur_Email ON Utilisateur(email);
CREATE INDEX IX_Utilisateur_Role ON Utilisateur(role_id);
CREATE INDEX IX_RendezVous_Client ON RendezVous(client_id);
CREATE INDEX IX_RendezVous_Agent ON RendezVous(agent_id);
CREATE INDEX IX_RendezVous_Date ON RendezVous(date_heure);
CREATE INDEX IX_RendezVous_Statut ON RendezVous(statut);
CREATE INDEX IX_Vehicule_Client ON Vehicule(client_id);
CREATE INDEX IX_PieceJointe_Entite ON PieceJointe(entite_type, entite_id);
CREATE INDEX IX_PieceJointe_Moderation ON PieceJointe(statut_moderation);
```

Cette structure de base de données supporte un système complet de gestion SAV avec toutes les fonctionnalités nécessaires pour STA Chery Tunisia, incluant la gestion des utilisateurs, véhicules, rendez-vous, réclamations, diagnostics, et un système de modération des fichiers.