-- =====================================================
-- Système d'Affectation des Ouvriers au Garage
-- =====================================================

-- Table: Ouvrier (Workers/Mechanics)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Ouvrier')
BEGIN
    CREATE TABLE Ouvrier (
        id BIGINT PRIMARY KEY IDENTITY(1,1),
        nom NVARCHAR(100) NOT NULL,
        prenom NVARCHAR(100) NOT NULL,
        telephone NVARCHAR(20),
        email NVARCHAR(255),
        specialite NVARCHAR(100), -- Ex: Mécanique, Électricité, Carrosserie, Peinture
        niveau_competence NVARCHAR(50), -- Junior, Intermédiaire, Senior, Expert
        agence_id BIGINT NOT NULL,
        actif BIT DEFAULT 1,
        date_embauche DATE,
        photo_url NVARCHAR(500),
        notes NVARCHAR(MAX),
        created_at DATETIME DEFAULT GETDATE(),
        updated_at DATETIME DEFAULT GETDATE(),
        CONSTRAINT FK_Ouvrier_Agence FOREIGN KEY (agence_id) REFERENCES Agence(id)
    );
    PRINT 'Table Ouvrier créée avec succès';
END
ELSE
BEGIN
    PRINT 'Table Ouvrier existe déjà';
END
GO

-- Table: AffectationOuvrier (Worker Assignments)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AffectationOuvrier')
BEGIN
    CREATE TABLE AffectationOuvrier (
        id BIGINT PRIMARY KEY IDENTITY(1,1),
        rendez_vous_id BIGINT NOT NULL,
        ouvrier_id BIGINT NOT NULL,
        agent_id BIGINT NOT NULL, -- Agent qui a fait l'affectation
        date_affectation DATETIME DEFAULT GETDATE(),
        statut NVARCHAR(50) DEFAULT 'EN_ATTENTE', -- EN_ATTENTE, EN_COURS, TERMINE, ANNULE
        priorite NVARCHAR(20) DEFAULT 'NORMALE', -- BASSE, NORMALE, HAUTE, URGENTE
        temps_estime_minutes INT, -- Temps estimé pour l'intervention
        temps_reel_minutes INT, -- Temps réel passé
        date_debut DATETIME,
        date_fin DATETIME,
        notes_agent NVARCHAR(MAX), -- Notes de l'agent pour l'ouvrier
        notes_ouvrier NVARCHAR(MAX), -- Notes de l'ouvrier sur l'intervention
        evaluation INT, -- Note de 1 à 5
        created_at DATETIME DEFAULT GETDATE(),
        updated_at DATETIME DEFAULT GETDATE(),
        CONSTRAINT FK_AffectationOuvrier_RendezVous FOREIGN KEY (rendez_vous_id) REFERENCES RendezVous(id),
        CONSTRAINT FK_AffectationOuvrier_Ouvrier FOREIGN KEY (ouvrier_id) REFERENCES Ouvrier(id),
        CONSTRAINT FK_AffectationOuvrier_Agent FOREIGN KEY (agent_id) REFERENCES Utilisateur(id),
        CONSTRAINT CHK_AffectationOuvrier_Statut CHECK (statut IN ('EN_ATTENTE', 'EN_COURS', 'TERMINE', 'ANNULE')),
        CONSTRAINT CHK_AffectationOuvrier_Priorite CHECK (priorite IN ('BASSE', 'NORMALE', 'HAUTE', 'URGENTE')),
        CONSTRAINT CHK_AffectationOuvrier_Evaluation CHECK (evaluation BETWEEN 1 AND 5)
    );
    PRINT 'Table AffectationOuvrier créée avec succès';
END
ELSE
BEGIN
    PRINT 'Table AffectationOuvrier existe déjà';
END
GO

-- Table: CompetenceOuvrier (Worker Skills)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CompetenceOuvrier')
BEGIN
    CREATE TABLE CompetenceOuvrier (
        id BIGINT PRIMARY KEY IDENTITY(1,1),
        ouvrier_id BIGINT NOT NULL,
        type_intervention_id BIGINT NOT NULL,
        niveau_maitrise INT DEFAULT 3, -- 1 à 5
        certifie BIT DEFAULT 0,
        date_certification DATE,
        created_at DATETIME DEFAULT GETDATE(),
        CONSTRAINT FK_CompetenceOuvrier_Ouvrier FOREIGN KEY (ouvrier_id) REFERENCES Ouvrier(id),
        CONSTRAINT FK_CompetenceOuvrier_TypeIntervention FOREIGN KEY (type_intervention_id) REFERENCES TypeIntervention(id),
        CONSTRAINT CHK_CompetenceOuvrier_Niveau CHECK (niveau_maitrise BETWEEN 1 AND 5),
        CONSTRAINT UQ_CompetenceOuvrier UNIQUE (ouvrier_id, type_intervention_id)
    );
    PRINT 'Table CompetenceOuvrier créée avec succès';
END
ELSE
BEGIN
    PRINT 'Table CompetenceOuvrier existe déjà';
END
GO

-- Table: DisponibiliteOuvrier (Worker Availability)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'DisponibiliteOuvrier')
BEGIN
    CREATE TABLE DisponibiliteOuvrier (
        id BIGINT PRIMARY KEY IDENTITY(1,1),
        ouvrier_id BIGINT NOT NULL,
        date DATE NOT NULL,
        heure_debut TIME NOT NULL,
        heure_fin TIME NOT NULL,
        disponible BIT DEFAULT 1,
        raison_indisponibilite NVARCHAR(255),
        created_at DATETIME DEFAULT GETDATE(),
        CONSTRAINT FK_DisponibiliteOuvrier_Ouvrier FOREIGN KEY (ouvrier_id) REFERENCES Ouvrier(id)
    );
    PRINT 'Table DisponibiliteOuvrier créée avec succès';
END
ELSE
BEGIN
    PRINT 'Table DisponibiliteOuvrier existe déjà';
END
GO

-- Index pour améliorer les performances
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IDX_Ouvrier_Agence')
    CREATE INDEX IDX_Ouvrier_Agence ON Ouvrier(agence_id);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IDX_Ouvrier_Actif')
    CREATE INDEX IDX_Ouvrier_Actif ON Ouvrier(actif);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IDX_AffectationOuvrier_RendezVous')
    CREATE INDEX IDX_AffectationOuvrier_RendezVous ON AffectationOuvrier(rendez_vous_id);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IDX_AffectationOuvrier_Ouvrier')
    CREATE INDEX IDX_AffectationOuvrier_Ouvrier ON AffectationOuvrier(ouvrier_id);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IDX_AffectationOuvrier_Statut')
    CREATE INDEX IDX_AffectationOuvrier_Statut ON AffectationOuvrier(statut);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IDX_AffectationOuvrier_Date')
    CREATE INDEX IDX_AffectationOuvrier_Date ON AffectationOuvrier(date_affectation);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IDX_CompetenceOuvrier_Ouvrier')
    CREATE INDEX IDX_CompetenceOuvrier_Ouvrier ON CompetenceOuvrier(ouvrier_id);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IDX_DisponibiliteOuvrier_Date')
    CREATE INDEX IDX_DisponibiliteOuvrier_Date ON DisponibiliteOuvrier(ouvrier_id, date);

PRINT 'Index créés avec succès';
GO

-- Vue: Vue des affectations avec détails
CREATE OR ALTER VIEW VueAffectationsDetaillees AS
SELECT 
    a.id AS affectation_id,
    a.statut,
    a.priorite,
    a.date_affectation,
    a.date_debut,
    a.date_fin,
    a.temps_estime_minutes,
    a.temps_reel_minutes,
    a.evaluation,
    -- Rendez-vous
    r.id AS rdv_id,
    r.date_heure AS rdv_date,
    r.statut AS rdv_statut,
    -- Ouvrier
    o.id AS ouvrier_id,
    o.nom AS ouvrier_nom,
    o.prenom AS ouvrier_prenom,
    o.specialite AS ouvrier_specialite,
    o.niveau_competence AS ouvrier_niveau,
    -- Client
    c.id AS client_id,
    c.nom AS client_nom,
    c.prenom AS client_prenom,
    -- Véhicule (with proper joins to get marque and modele)
    v.id AS vehicule_id,
    v.immatriculation,
    mar.nom AS marque,
    mod.nom AS modele,
    ver.nom AS version,
    -- Agent
    ag.id AS agent_id,
    ag.nom AS agent_nom,
    ag.prenom AS agent_prenom,
    -- Agence
    agence.id AS agence_id,
    agence.nom AS agence_nom
FROM AffectationOuvrier a
INNER JOIN RendezVous r ON a.rendez_vous_id = r.id
INNER JOIN Ouvrier o ON a.ouvrier_id = o.id
INNER JOIN Utilisateur c ON r.client_id = c.id
INNER JOIN Vehicule v ON r.vehicule_id = v.id
LEFT JOIN Version ver ON v.version_id = ver.id
LEFT JOIN Modele mod ON ver.modele_id = mod.id
LEFT JOIN Marque mar ON mod.marque_id = mar.id
INNER JOIN Utilisateur ag ON a.agent_id = ag.id
INNER JOIN Agence agence ON o.agence_id = agence.id;
GO

PRINT 'Vue VueAffectationsDetaillees créée avec succès!';
GO
