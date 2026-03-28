-- ============================================================
--  STA-SAV — Script de RESET complet de la base
--  Suppression de tous les objets puis recréation
--  SQL Server 2022  |  Base : STA_SAV_DB
-- ============================================================

USE STA_SAV_DB;
GO

-- ============================================================
--  ETAPE 1 — Désactiver toutes les contraintes FK
-- ============================================================

EXEC sp_MSforeachtable 'ALTER TABLE ? NOCHECK CONSTRAINT ALL';
GO

-- ============================================================
--  ETAPE 2 — Supprimer les VUES
-- ============================================================

IF OBJECT_ID('VW_PlanningRDV',         'V') IS NOT NULL DROP VIEW VW_PlanningRDV;
IF OBJECT_ID('VW_ReclamationsOuvertes','V') IS NOT NULL DROP VIEW VW_ReclamationsOuvertes;
IF OBJECT_ID('VW_StatsAgence',         'V') IS NOT NULL DROP VIEW VW_StatsAgence;
IF OBJECT_ID('VW_HistoriqueVehicule',  'V') IS NOT NULL DROP VIEW VW_HistoriqueVehicule;
GO

-- ============================================================
--  ETAPE 3 — Supprimer les PROCEDURES STOCKEES
-- ============================================================

IF OBJECT_ID('SP_CreerRendezVous',          'P') IS NOT NULL DROP PROCEDURE SP_CreerRendezVous;
IF OBJECT_ID('SP_ConfirmerRDV',             'P') IS NOT NULL DROP PROCEDURE SP_ConfirmerRDV;
IF OBJECT_ID('SP_ChangerStatutReclamation', 'P') IS NOT NULL DROP PROCEDURE SP_ChangerStatutReclamation;
IF OBJECT_ID('SP_RapportJournalier',        'P') IS NOT NULL DROP PROCEDURE SP_RapportJournalier;
GO

-- ============================================================
--  ETAPE 4 — Supprimer les TRIGGERS
-- ============================================================

IF OBJECT_ID('TR_RDV_DateModification', 'TR') IS NOT NULL DROP TRIGGER TR_RDV_DateModification;
IF OBJECT_ID('TR_Reclamation_Numero',   'TR') IS NOT NULL DROP TRIGGER TR_Reclamation_Numero;
IF OBJECT_ID('TR_RDV_ValidAgent',       'TR') IS NOT NULL DROP TRIGGER TR_RDV_ValidAgent;
IF OBJECT_ID('TR_RDV_ValidVehicule',    'TR') IS NOT NULL DROP TRIGGER TR_RDV_ValidVehicule;
GO

-- ============================================================
--  ETAPE 5 — Supprimer les TABLES (ordre respectant les FK)
-- ============================================================

-- Tables feuilles (aucune autre table ne dépend d'elles)
IF OBJECT_ID('Promotion',        'U') IS NOT NULL DROP TABLE Promotion;
IF OBJECT_ID('Notification',     'U') IS NOT NULL DROP TABLE Notification;
IF OBJECT_ID('PieceJointe',      'U') IS NOT NULL DROP TABLE PieceJointe;
IF OBJECT_ID('InterventionRDV',  'U') IS NOT NULL DROP TABLE InterventionRDV;
IF OBJECT_ID('RDV_Package',      'U') IS NOT NULL DROP TABLE RDV_Package;
IF OBJECT_ID('RendezVous',       'U') IS NOT NULL DROP TABLE RendezVous;
IF OBJECT_ID('Reclamation',      'U') IS NOT NULL DROP TABLE Reclamation;
IF OBJECT_ID('Package_SousType', 'U') IS NOT NULL DROP TABLE Package_SousType;
IF OBJECT_ID('SousTypeIntervention',  'U') IS NOT NULL DROP TABLE SousTypeIntervention;
IF OBJECT_ID('TypeIntervention',      'U') IS NOT NULL DROP TABLE TypeIntervention;
IF OBJECT_ID('PackageIntervention',   'U') IS NOT NULL DROP TABLE PackageIntervention;
IF OBJECT_ID('Vehicule',         'U') IS NOT NULL DROP TABLE Vehicule;
IF OBJECT_ID('Version',          'U') IS NOT NULL DROP TABLE Version;
IF OBJECT_ID('Modele',           'U') IS NOT NULL DROP TABLE Modele;
IF OBJECT_ID('Marque',           'U') IS NOT NULL DROP TABLE Marque;
IF OBJECT_ID('PlageHoraire',     'U') IS NOT NULL DROP TABLE PlageHoraire;
IF OBJECT_ID('Utilisateur',      'U') IS NOT NULL DROP TABLE Utilisateur;
IF OBJECT_ID('Agence',           'U') IS NOT NULL DROP TABLE Agence;
IF OBJECT_ID('Permission',       'U') IS NOT NULL DROP TABLE Permission;
IF OBJECT_ID('Role',             'U') IS NOT NULL DROP TABLE Role;
-- Tables enum
IF OBJECT_ID('StatutRDV',           'U') IS NOT NULL DROP TABLE StatutRDV;
IF OBJECT_ID('StatutIntervention',  'U') IS NOT NULL DROP TABLE StatutIntervention;
IF OBJECT_ID('StatutReclamation',   'U') IS NOT NULL DROP TABLE StatutReclamation;
IF OBJECT_ID('TypeNotification',    'U') IS NOT NULL DROP TABLE TypeNotification;
GO

PRINT '✅ Toutes les tables supprimées.';
GO

-- ============================================================
--  ETAPE 6 — RECREER LES TABLES
-- ============================================================

-- ── TABLES ENUM ──────────────────────────────────────────────

CREATE TABLE StatutRDV (
    code    VARCHAR(20)  NOT NULL CONSTRAINT PK_StatutRDV PRIMARY KEY,
    libelle NVARCHAR(50) NOT NULL
);
INSERT INTO StatutRDV VALUES
    ('PLANIFIE','Planifié'),('CONFIRME','Confirmé'),('EN_COURS','En cours'),
    ('TERMINE','Terminé'),  ('ANNULE','Annulé'),    ('NO_SHOW','Non présenté');

CREATE TABLE StatutIntervention (
    code    VARCHAR(20)  NOT NULL CONSTRAINT PK_StatutIntervention PRIMARY KEY,
    libelle NVARCHAR(50) NOT NULL
);
INSERT INTO StatutIntervention VALUES
    ('EN_ATTENTE','En attente'),('EN_COURS','En cours'),
    ('TERMINEE','Terminée'),    ('ANNULEE','Annulée');

CREATE TABLE StatutReclamation (
    code    VARCHAR(20)  NOT NULL CONSTRAINT PK_StatutRec PRIMARY KEY,
    libelle NVARCHAR(50) NOT NULL
);
INSERT INTO StatutReclamation VALUES
    ('SOUMISE','Soumise'),('EN_COURS','En cours de traitement'),
    ('TRAITEE','Traitée'),('CLOTUREE','Clôturée');

CREATE TABLE TypeNotification (
    code    VARCHAR(10)  NOT NULL CONSTRAINT PK_TypeNotif PRIMARY KEY,
    libelle NVARCHAR(30) NOT NULL
);
INSERT INTO TypeNotification VALUES
    ('SMS','Message SMS'),('PUSH','Notification Push'),('EMAIL','Email transactionnel');
GO

-- ── SECURITE ─────────────────────────────────────────────────

CREATE TABLE Role (
    id          BIGINT        NOT NULL IDENTITY(1,1) CONSTRAINT PK_Role PRIMARY KEY,
    nom         NVARCHAR(50)  NOT NULL CONSTRAINT UQ_Role_nom UNIQUE,
    description NVARCHAR(200) NULL
);

CREATE TABLE Permission (
    id      BIGINT       NOT NULL IDENTITY(1,1) CONSTRAINT PK_Permission PRIMARY KEY,
    role_id BIGINT       NOT NULL,
    module  NVARCHAR(50) NOT NULL,
    action  NVARCHAR(20) NOT NULL,
    actif   BIT          NOT NULL DEFAULT 1,
    CONSTRAINT FK_Permission_Role FOREIGN KEY (role_id) REFERENCES Role(id) ON DELETE CASCADE,
    CONSTRAINT UQ_Permission      UNIQUE (role_id, module, action)
);
GO

-- ── AGENCE ───────────────────────────────────────────────────

CREATE TABLE Agence (
    id        BIGINT        NOT NULL IDENTITY(1,1) CONSTRAINT PK_Agence PRIMARY KEY,
    nom       NVARCHAR(100) NOT NULL,
    ville     NVARCHAR(80)  NOT NULL,
    telephone NVARCHAR(20)  NULL,
    adresse   NVARCHAR(255) NULL
);

CREATE TABLE PlageHoraire (
    id              BIGINT  NOT NULL IDENTITY(1,1) CONSTRAINT PK_PlageHoraire PRIMARY KEY,
    agence_id       BIGINT  NOT NULL,
    jour_semaine    TINYINT NOT NULL,
    heure_ouverture TIME    NOT NULL,
    heure_fermeture TIME    NOT NULL,
    capacite        INT     NOT NULL DEFAULT 4,
    CONSTRAINT FK_PlageHoraire_Agence FOREIGN KEY (agence_id) REFERENCES Agence(id) ON DELETE CASCADE,
    CONSTRAINT CK_JourSemaine  CHECK (jour_semaine BETWEEN 1 AND 7),
    CONSTRAINT CK_Horaires     CHECK (heure_ouverture < heure_fermeture),
    CONSTRAINT UQ_PlageHoraire UNIQUE (agence_id, jour_semaine, heure_ouverture)
);
GO

-- ── UTILISATEURS ─────────────────────────────────────────────

CREATE TABLE Utilisateur (
    id               BIGINT        NOT NULL IDENTITY(1,1) CONSTRAINT PK_Utilisateur PRIMARY KEY,
    type_utilisateur NVARCHAR(20)  NOT NULL,
    nom              NVARCHAR(100) NOT NULL,
    prenom           NVARCHAR(100) NOT NULL,
    telephone        NVARCHAR(20)  NULL,
    email            NVARCHAR(150) NOT NULL CONSTRAINT UQ_Utilisateur_email UNIQUE,
    mot_de_passe     NVARCHAR(255) NOT NULL,
    actif            BIT           NOT NULL DEFAULT 1,
    date_creation    DATETIME2     NOT NULL DEFAULT GETDATE(),
    role_id          BIGINT        NOT NULL,
    -- Client
    code_client      NVARCHAR(30)  NULL,
    adresse          NVARCHAR(255) NULL,
    -- AgentSAV
    matricule        NVARCHAR(30)  NULL,
    agence_id        BIGINT        NULL,
    -- Administrateur
    niveau           NVARCHAR(30)  NULL,
    -- Direction
    fonction         NVARCHAR(100) NULL,
    CONSTRAINT FK_Utilisateur_Role   FOREIGN KEY (role_id)   REFERENCES Role(id),
    CONSTRAINT FK_Utilisateur_Agence FOREIGN KEY (agence_id) REFERENCES Agence(id),
    CONSTRAINT CK_TypeUtilisateur    CHECK (type_utilisateur IN ('CLIENT','AGENT','ADMIN','DIRECTION'))
);

CREATE INDEX IX_Utilisateur_Email  ON Utilisateur(email);
CREATE INDEX IX_Utilisateur_Type   ON Utilisateur(type_utilisateur);
CREATE INDEX IX_Utilisateur_Agence ON Utilisateur(agence_id);
GO

-- ── VEHICULE ─────────────────────────────────────────────────

CREATE TABLE Marque (
    id       BIGINT        NOT NULL IDENTITY(1,1) CONSTRAINT PK_Marque PRIMARY KEY,
    nom      NVARCHAR(80)  NOT NULL CONSTRAINT UQ_Marque_nom UNIQUE,
    logo_url NVARCHAR(500) NULL,
    actif    BIT           NOT NULL DEFAULT 1
);

CREATE TABLE Modele (
    id          BIGINT        NOT NULL IDENTITY(1,1) CONSTRAINT PK_Modele PRIMARY KEY,
    marque_id   BIGINT        NOT NULL,
    nom         NVARCHAR(100) NOT NULL,
    annee_debut CHAR(4)       NULL,
    annee_fin   CHAR(4)       NULL,
    actif       BIT           NOT NULL DEFAULT 1,
    CONSTRAINT FK_Modele_Marque FOREIGN KEY (marque_id) REFERENCES Marque(id),
    CONSTRAINT UQ_Modele        UNIQUE (marque_id, nom)
);

CREATE TABLE Version (
    id           BIGINT        NOT NULL IDENTITY(1,1) CONSTRAINT PK_Version PRIMARY KEY,
    modele_id    BIGINT        NOT NULL,
    nom          NVARCHAR(100) NOT NULL,
    motorisation NVARCHAR(100) NULL,
    transmission NVARCHAR(30)  NULL,
    actif        BIT           NOT NULL DEFAULT 1,
    CONSTRAINT FK_Version_Modele FOREIGN KEY (modele_id) REFERENCES Modele(id),
    CONSTRAINT UQ_Version        UNIQUE (modele_id, nom),
    CONSTRAINT CK_Transmission   CHECK (transmission IN ('MANUELLE','AUTOMATIQUE','DSG','CVT') OR transmission IS NULL)
);

CREATE TABLE Vehicule (
    id              BIGINT        NOT NULL IDENTITY(1,1) CONSTRAINT PK_Vehicule PRIMARY KEY,
    client_id       BIGINT        NOT NULL,
    version_id      BIGINT        NOT NULL,
    immatriculation NVARCHAR(20)  NOT NULL CONSTRAINT UQ_Vehicule_Immat   UNIQUE,
    numero_chassis  NVARCHAR(17)  NOT NULL CONSTRAINT UQ_Vehicule_Chassis UNIQUE,
    couleur         NVARCHAR(50)  NULL,
    annee           SMALLINT      NOT NULL,
    date_ajout      DATETIME2     NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_Vehicule_Client  FOREIGN KEY (client_id)  REFERENCES Utilisateur(id),
    CONSTRAINT FK_Vehicule_Version FOREIGN KEY (version_id) REFERENCES Version(id),
    CONSTRAINT CK_Annee            CHECK (annee BETWEEN 1950 AND 2100)
);

CREATE INDEX IX_Vehicule_Client ON Vehicule(client_id);
CREATE INDEX IX_Vehicule_Immat  ON Vehicule(immatriculation);
GO

-- ── INTERVENTIONS ─────────────────────────────────────────────

CREATE TABLE TypeIntervention (
    id          BIGINT        NOT NULL IDENTITY(1,1) CONSTRAINT PK_TypeInt PRIMARY KEY,
    nom         NVARCHAR(100) NOT NULL CONSTRAINT UQ_TypeInt_nom UNIQUE,
    delai_moyen INT           NULL
);

CREATE TABLE SousTypeIntervention (
    id                   BIGINT        NOT NULL IDENTITY(1,1) CONSTRAINT PK_SousType PRIMARY KEY,
    type_intervention_id BIGINT        NOT NULL,
    nom                  NVARCHAR(150) NOT NULL,
    duree_estimee        INT           NULL,
    CONSTRAINT FK_SousType_TypeInt FOREIGN KEY (type_intervention_id) REFERENCES TypeIntervention(id)
);

CREATE TABLE PackageIntervention (
    id             BIGINT        NOT NULL IDENTITY(1,1) CONSTRAINT PK_Package PRIMARY KEY,
    nom            NVARCHAR(150) NOT NULL CONSTRAINT UQ_Package_nom UNIQUE,
    description    NVARCHAR(500) NULL,
    prix_estimatif DECIMAL(10,3) NOT NULL DEFAULT 0,
    actif          BIT           NOT NULL DEFAULT 1
);

CREATE TABLE Package_SousType (
    package_id   BIGINT NOT NULL,
    sous_type_id BIGINT NOT NULL,
    CONSTRAINT PK_Package_SousType PRIMARY KEY (package_id, sous_type_id),
    CONSTRAINT FK_PkgST_Package     FOREIGN KEY (package_id)   REFERENCES PackageIntervention(id) ON DELETE CASCADE,
    CONSTRAINT FK_PkgST_SousType    FOREIGN KEY (sous_type_id) REFERENCES SousTypeIntervention(id)
);
GO

-- ── RENDEZ-VOUS ───────────────────────────────────────────────

CREATE TABLE RendezVous (
    id                 BIGINT        NOT NULL IDENTITY(1,1) CONSTRAINT PK_RDV PRIMARY KEY,
    client_id          BIGINT        NOT NULL,
    agent_id           BIGINT        NULL,
    vehicule_id        BIGINT        NOT NULL,
    agence_id          BIGINT        NOT NULL,
    date_heure         DATETIME2     NOT NULL,
    statut             VARCHAR(20)   NOT NULL DEFAULT 'PLANIFIE',
    description        NVARCHAR(MAX) NULL,
    duree_estimee      INT           NULL,
    heure_reelle_debut DATETIME2     NULL,
    heure_reelle_fin   DATETIME2     NULL,
    date_creation      DATETIME2     NOT NULL DEFAULT GETDATE(),
    date_modification  DATETIME2     NULL,
    CONSTRAINT FK_RDV_Client   FOREIGN KEY (client_id)   REFERENCES Utilisateur(id),
    CONSTRAINT FK_RDV_Agent    FOREIGN KEY (agent_id)    REFERENCES Utilisateur(id),
    CONSTRAINT FK_RDV_Vehicule FOREIGN KEY (vehicule_id) REFERENCES Vehicule(id),
    CONSTRAINT FK_RDV_Agence   FOREIGN KEY (agence_id)   REFERENCES Agence(id),
    CONSTRAINT FK_RDV_Statut   FOREIGN KEY (statut)      REFERENCES StatutRDV(code)
);

CREATE INDEX IX_RDV_Client ON RendezVous(client_id);
CREATE INDEX IX_RDV_Agent  ON RendezVous(agent_id);
CREATE INDEX IX_RDV_Agence ON RendezVous(agence_id);
CREATE INDEX IX_RDV_DateH  ON RendezVous(date_heure);
CREATE INDEX IX_RDV_Statut ON RendezVous(statut);

CREATE TABLE RDV_Package (
    rdv_id        BIGINT        NOT NULL,
    package_id    BIGINT        NOT NULL,
    quantite      INT           NOT NULL DEFAULT 1,
    prix_unitaire DECIMAL(10,3) NOT NULL DEFAULT 0,
    CONSTRAINT PK_RDV_Package    PRIMARY KEY (rdv_id, package_id),
    CONSTRAINT FK_RDVPkg_RDV     FOREIGN KEY (rdv_id)     REFERENCES RendezVous(id) ON DELETE CASCADE,
    CONSTRAINT FK_RDVPkg_Package FOREIGN KEY (package_id) REFERENCES PackageIntervention(id)
);

CREATE TABLE InterventionRDV (
    id           BIGINT        NOT NULL IDENTITY(1,1) CONSTRAINT PK_IntRDV PRIMARY KEY,
    rdv_id       BIGINT        NOT NULL,
    sous_type_id BIGINT        NOT NULL,
    statut       VARCHAR(20)   NOT NULL DEFAULT 'EN_ATTENTE',
    duree_reelle INT           NULL,
    commentaire  NVARCHAR(MAX) NULL,
    date_debut   DATETIME2     NULL,
    date_fin     DATETIME2     NULL,
    CONSTRAINT FK_IntRDV_RDV      FOREIGN KEY (rdv_id)       REFERENCES RendezVous(id) ON DELETE CASCADE,
    CONSTRAINT FK_IntRDV_SousType FOREIGN KEY (sous_type_id) REFERENCES SousTypeIntervention(id),
    CONSTRAINT FK_IntRDV_Statut   FOREIGN KEY (statut)       REFERENCES StatutIntervention(code)
);

CREATE INDEX IX_IntRDV_RDV ON InterventionRDV(rdv_id);
GO

-- ── RECLAMATION ───────────────────────────────────────────────

CREATE TABLE Reclamation (
    id              BIGINT        NOT NULL IDENTITY(1,1) CONSTRAINT PK_Reclamation PRIMARY KEY,
    numero          NVARCHAR(30)  NOT NULL CONSTRAINT UQ_Rec_numero UNIQUE,
    client_id       BIGINT        NOT NULL,
    agent_id        BIGINT        NULL,
    objet           NVARCHAR(200) NOT NULL,
    description     NVARCHAR(MAX) NULL,
    statut          VARCHAR(20)   NOT NULL DEFAULT 'SOUMISE',
    date_soumission DATETIME2     NOT NULL DEFAULT GETDATE(),
    date_traitement DATETIME2     NULL,
    date_cloture    DATETIME2     NULL,
    CONSTRAINT FK_Rec_Client FOREIGN KEY (client_id) REFERENCES Utilisateur(id),
    CONSTRAINT FK_Rec_Agent  FOREIGN KEY (agent_id)  REFERENCES Utilisateur(id),
    CONSTRAINT FK_Rec_Statut FOREIGN KEY (statut)    REFERENCES StatutReclamation(code)
);

CREATE INDEX IX_Rec_Client ON Reclamation(client_id);
CREATE INDEX IX_Rec_Statut ON Reclamation(statut);
GO

-- ── DOCUMENTS ────────────────────────────────────────────────

CREATE TABLE PieceJointe (
    id          BIGINT        NOT NULL IDENTITY(1,1) CONSTRAINT PK_PieceJointe PRIMARY KEY,
    entite_type NVARCHAR(20)  NOT NULL,
    entite_id   BIGINT        NOT NULL,
    url         NVARCHAR(500) NOT NULL,
    type_mime   NVARCHAR(100) NULL,
    taille_mo   DECIMAL(8,2)  NULL,
    date_upload DATETIME2     NOT NULL DEFAULT GETDATE(),
    CONSTRAINT CK_EntiteType CHECK (entite_type IN ('RDV','RECLAMATION'))
);

CREATE INDEX IX_PJ_Entite ON PieceJointe(entite_type, entite_id);
GO

-- ── COMMUNICATION ─────────────────────────────────────────────

CREATE TABLE Notification (
    id             BIGINT        NOT NULL IDENTITY(1,1) CONSTRAINT PK_Notification PRIMARY KEY,
    utilisateur_id BIGINT        NOT NULL,
    titre          NVARCHAR(200) NOT NULL,
    message        NVARCHAR(MAX) NOT NULL,
    lu             BIT           NOT NULL DEFAULT 0,
    type           VARCHAR(10)   NOT NULL DEFAULT 'PUSH',
    entite_type    NVARCHAR(20)  NULL,
    entite_id      BIGINT        NULL,
    date_envoi     DATETIME2     NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_Notif_User FOREIGN KEY (utilisateur_id) REFERENCES Utilisateur(id) ON DELETE CASCADE,
    CONSTRAINT FK_Notif_Type FOREIGN KEY (type)           REFERENCES TypeNotification(code)
);

CREATE INDEX IX_Notif_User ON Notification(utilisateur_id);
CREATE INDEX IX_Notif_Lu   ON Notification(lu);

CREATE TABLE Promotion (
    id            BIGINT        NOT NULL IDENTITY(1,1) CONSTRAINT PK_Promotion PRIMARY KEY,
    admin_id      BIGINT        NOT NULL,
    titre         NVARCHAR(200) NOT NULL,
    image_url     NVARCHAR(500) NULL,
    date_debut    DATETIME2     NOT NULL,
    date_fin      DATETIME2     NOT NULL,
    actif         BIT           NOT NULL DEFAULT 1,
    date_creation DATETIME2     NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_Promo_Admin FOREIGN KEY (admin_id) REFERENCES Utilisateur(id),
    CONSTRAINT CK_Promo_Dates CHECK (date_debut < date_fin)
);
GO

-- ============================================================
--  ETAPE 7 — RECREER LES TRIGGERS
-- ============================================================

CREATE OR ALTER TRIGGER TR_RDV_DateModification
ON RendezVous AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE RendezVous SET date_modification = GETDATE()
    WHERE id IN (SELECT id FROM inserted);
END;
GO

CREATE OR ALTER TRIGGER TR_Reclamation_Numero
ON Reclamation INSTEAD OF INSERT
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO Reclamation (
        numero, client_id, agent_id, objet, description,
        statut, date_soumission, date_traitement, date_cloture
    )
    SELECT
        'REC-' + FORMAT(GETDATE(),'yyyy') + '-' +
            RIGHT('0000' + CAST(ISNULL((SELECT MAX(id) FROM Reclamation),0)+1 AS VARCHAR(10)),4),
        client_id, agent_id, objet, description,
        ISNULL(statut,'SOUMISE'), ISNULL(date_soumission, GETDATE()),
        date_traitement, date_cloture
    FROM inserted;
END;
GO

CREATE OR ALTER TRIGGER TR_RDV_ValidAgent
ON RendezVous AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (
        SELECT 1 FROM inserted i
        JOIN Utilisateur u ON u.id = i.agent_id
        WHERE i.agent_id IS NOT NULL AND u.type_utilisateur <> 'AGENT'
    )
    BEGIN
        RAISERROR('agent_id doit référencer un utilisateur de type AGENT.', 16, 1);
        ROLLBACK TRANSACTION;
    END
END;
GO

CREATE OR ALTER TRIGGER TR_RDV_ValidVehicule
ON RendezVous AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (
        SELECT 1 FROM inserted i
        JOIN Vehicule v ON v.id = i.vehicule_id
        WHERE v.client_id <> i.client_id
    )
    BEGIN
        RAISERROR('Le véhicule n''appartient pas au client du RDV.', 16, 1);
        ROLLBACK TRANSACTION;
    END
END;
GO

-- ============================================================
--  ETAPE 8 — RECREER LES VUES
-- ============================================================

CREATE VIEW VW_PlanningRDV AS
SELECT
    r.id AS rdv_id, r.date_heure, r.statut, r.duree_estimee,
    c.nom  + ' ' + c.prenom  AS client_nom,  c.telephone AS client_tel,
    a.nom  + ' ' + a.prenom  AS agent_nom,
    ag.nom AS agence_nom, ag.ville,
    ma.nom AS marque, mo.nom AS modele, ve.nom AS version_nom,
    vh.immatriculation
FROM RendezVous r
JOIN Utilisateur c  ON c.id  = r.client_id
LEFT JOIN Utilisateur a  ON a.id  = r.agent_id
JOIN Agence      ag ON ag.id = r.agence_id
JOIN Vehicule    vh ON vh.id = r.vehicule_id
JOIN Version     ve ON ve.id = vh.version_id
JOIN Modele      mo ON mo.id = ve.modele_id
JOIN Marque      ma ON ma.id = mo.marque_id;
GO

CREATE VIEW VW_ReclamationsOuvertes AS
SELECT
    r.id, r.numero, r.objet, r.statut, r.date_soumission,
    DATEDIFF(DAY, r.date_soumission, GETDATE()) AS jours_ouvert,
    c.nom + ' ' + c.prenom AS client_nom, c.telephone AS client_tel,
    a.nom + ' ' + a.prenom AS agent_nom
FROM Reclamation r
JOIN Utilisateur c ON c.id = r.client_id
LEFT JOIN Utilisateur a ON a.id = r.agent_id
WHERE r.statut NOT IN ('CLOTUREE');
GO

CREATE VIEW VW_StatsAgence AS
SELECT
    ag.id AS agence_id, ag.nom AS agence_nom, ag.ville,
    COUNT(r.id)                                              AS total_rdv,
    SUM(CASE WHEN r.statut='TERMINE' THEN 1 ELSE 0 END)     AS rdv_termines,
    SUM(CASE WHEN r.statut='ANNULE'  THEN 1 ELSE 0 END)     AS rdv_annules,
    SUM(CASE WHEN r.statut='NO_SHOW' THEN 1 ELSE 0 END)     AS rdv_no_show,
    AVG(DATEDIFF(MINUTE, r.heure_reelle_debut,
                          r.heure_reelle_fin))                AS duree_moy_min
FROM Agence ag
LEFT JOIN RendezVous r ON r.agence_id = ag.id
GROUP BY ag.id, ag.nom, ag.ville;
GO

CREATE VIEW VW_HistoriqueVehicule AS
SELECT
    vh.immatriculation,
    ma.nom AS marque, mo.nom AS modele, ve.nom AS version_nom,
    r.id AS rdv_id, r.date_heure, r.statut AS statut_rdv,
    ir.id AS intervention_id,
    st.nom AS sous_type, ir.duree_reelle,
    ir.statut AS statut_intervention, ir.commentaire
FROM Vehicule vh
JOIN Version    ve ON ve.id = vh.version_id
JOIN Modele     mo ON mo.id = ve.modele_id
JOIN Marque     ma ON ma.id = mo.marque_id
LEFT JOIN RendezVous r ON r.vehicule_id = vh.id
LEFT JOIN InterventionRDV ir ON ir.rdv_id = r.id
LEFT JOIN SousTypeIntervention st ON st.id = ir.sous_type_id;
GO

-- ============================================================
--  ETAPE 9 — RECREER LES PROCEDURES STOCKEES
-- ============================================================

CREATE PROCEDURE dbo.SP_CreerRendezVous
    @client_id   BIGINT,
    @vehicule_id BIGINT,
    @agence_id   BIGINT,
    @date_heure  DATETIME2,
    @description NVARCHAR(MAX) = NULL,
    @duree_est   INT = 60
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM Vehicule WHERE id = @vehicule_id AND client_id = @client_id)
            THROW 50001, 'Ce véhicule n''appartient pas au client.', 1;

        DECLARE @jourISO  TINYINT = DATEPART(WEEKDAY, @date_heure);
        DECLARE @heureRDV TIME    = CAST(@date_heure AS TIME);
        DECLARE @capacite INT;

        SELECT TOP 1 @capacite = capacite FROM PlageHoraire
        WHERE agence_id = @agence_id AND jour_semaine = @jourISO
          AND @heureRDV BETWEEN heure_ouverture AND heure_fermeture;

        IF @capacite IS NULL
            THROW 50002, 'Aucune plage horaire disponible pour ce créneau.', 1;

        DECLARE @nbRDV INT;
        SELECT @nbRDV = COUNT(*) FROM RendezVous
        WHERE agence_id = @agence_id
          AND CAST(date_heure AS DATE)   = CAST(@date_heure AS DATE)
          AND DATEPART(HOUR, date_heure) = DATEPART(HOUR, @date_heure)
          AND statut NOT IN ('ANNULE','NO_SHOW');

        IF @nbRDV >= @capacite
            THROW 50003, 'Créneau complet pour cette agence à cette heure.', 1;

        INSERT INTO RendezVous (client_id, vehicule_id, agence_id, date_heure, description, duree_estimee, statut)
        VALUES (@client_id, @vehicule_id, @agence_id, @date_heure, @description, @duree_est, 'PLANIFIE');

        DECLARE @newId BIGINT = SCOPE_IDENTITY();

        INSERT INTO Notification (utilisateur_id, titre, message, type, entite_type, entite_id)
        VALUES (@client_id, N'Rendez-vous créé',
                N'Votre RDV du ' + FORMAT(@date_heure,'dd/MM/yyyy HH:mm') + N' est enregistré.',
                'PUSH', 'RDV', @newId);

        COMMIT;
        SELECT @newId AS rdv_id, 'PLANIFIE' AS statut;
    END TRY
    BEGIN CATCH ROLLBACK; THROW; END CATCH
END;
GO

CREATE PROCEDURE dbo.SP_ConfirmerRDV
    @rdv_id   BIGINT,
    @agent_id BIGINT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM RendezVous WHERE id = @rdv_id AND statut = 'PLANIFIE')
            THROW 50010, 'Le RDV n''est pas dans l''état PLANIFIE.', 1;

        UPDATE RendezVous SET statut = 'CONFIRME', agent_id = @agent_id WHERE id = @rdv_id;

        DECLARE @clientId BIGINT;
        SELECT @clientId = client_id FROM RendezVous WHERE id = @rdv_id;

        INSERT INTO Notification (utilisateur_id, titre, message, type, entite_type, entite_id)
        VALUES (@clientId, N'Rendez-vous confirmé',
                N'Votre rendez-vous a été confirmé. Nous vous attendons !',
                'PUSH', 'RDV', @rdv_id);

        COMMIT;
    END TRY
    BEGIN CATCH ROLLBACK; THROW; END CATCH
END;
GO

CREATE PROCEDURE dbo.SP_ChangerStatutReclamation
    @rec_id   BIGINT,
    @agent_id BIGINT,
    @statut   VARCHAR(20),
    @reponse  NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        UPDATE Reclamation SET
            statut          = @statut,
            agent_id        = @agent_id,
            date_traitement = CASE WHEN @statut = 'EN_COURS' THEN GETDATE() ELSE date_traitement END,
            date_cloture    = CASE WHEN @statut = 'CLOTUREE'  THEN GETDATE() ELSE date_cloture    END
        WHERE id = @rec_id;

        DECLARE @clientId BIGINT;
        SELECT @clientId = client_id FROM Reclamation WHERE id = @rec_id;

        INSERT INTO Notification (utilisateur_id, titre, message, type, entite_type, entite_id)
        VALUES (@clientId, N'Mise à jour réclamation',
                ISNULL(@reponse, N'Statut de votre réclamation : ' + @statut),
                'PUSH', 'RECLAMATION', @rec_id);

        COMMIT;
    END TRY
    BEGIN CATCH ROLLBACK; THROW; END CATCH
END;
GO

CREATE PROCEDURE dbo.SP_RapportJournalier
    @agence_id BIGINT,
    @date      DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    IF @date IS NULL SET @date = CAST(GETDATE() AS DATE);
    SELECT
        ag.nom AS agence, @date AS date_rapport,
        COUNT(r.id)                                            AS total_rdv,
        SUM(CASE WHEN r.statut='PLANIFIE' THEN 1 ELSE 0 END)  AS planifies,
        SUM(CASE WHEN r.statut='CONFIRME' THEN 1 ELSE 0 END)  AS confirmes,
        SUM(CASE WHEN r.statut='EN_COURS' THEN 1 ELSE 0 END)  AS en_cours,
        SUM(CASE WHEN r.statut='TERMINE'  THEN 1 ELSE 0 END)  AS termines,
        SUM(CASE WHEN r.statut='ANNULE'   THEN 1 ELSE 0 END)  AS annules,
        SUM(CASE WHEN r.statut='NO_SHOW'  THEN 1 ELSE 0 END)  AS no_shows,
        AVG(DATEDIFF(MINUTE, r.heure_reelle_debut,
                              r.heure_reelle_fin))              AS duree_moy_min
    FROM Agence ag
    LEFT JOIN RendezVous r
        ON r.agence_id = ag.id AND CAST(r.date_heure AS DATE) = @date
    WHERE ag.id = @agence_id
    GROUP BY ag.nom;
END;
GO

-- ============================================================
--  ETAPE 10 — DONNEES DE REFERENCE
-- ============================================================

INSERT INTO Role (nom, description) VALUES
    ('CLIENT',    N'Client propriétaire de véhicule'),
    ('AGENT',     N'Agent SAV en agence'),
    ('ADMIN',     N'Administrateur système'),
    ('DIRECTION', N'Profil direction — lecture seule');

INSERT INTO Agence (nom, ville, telephone, adresse) VALUES
    (N'STA Tunis Nord', N'Tunis',    N'+216 71 000 001', N'Avenue Habib Bourguiba, Tunis'),
    (N'STA Tunis Sud',  N'Tunis',    N'+216 71 000 002', N'Route de Sfax, Tunis'),
    (N'STA Sfax',       N'Sfax',     N'+216 74 000 001', N'Avenue Taieb Mhiri, Sfax'),
    (N'STA Sousse',     N'Sousse',   N'+216 73 000 001', N'Rue Ibn Khaldoun, Sousse'),
    (N'STA Bizerte',    N'Bizerte',  N'+216 72 000 001', N'Avenue Habib Bourguiba, Bizerte'),
    (N'STA Monastir',   N'Monastir', N'+216 73 000 002', N'Route Touristique, Monastir');

INSERT INTO PlageHoraire (agence_id, jour_semaine, heure_ouverture, heure_fermeture, capacite)
SELECT a.id, j.jour, '08:00', '17:00', 4
FROM Agence a CROSS JOIN (VALUES (1),(2),(3),(4),(5)) AS j(jour);

INSERT INTO Marque (nom) VALUES
    (N'Volkswagen'),(N'Peugeot'),(N'Renault'),
    (N'Hyundai'),(N'Kia'),(N'Toyota'),(N'Seat');

INSERT INTO Modele (marque_id, nom, annee_debut) VALUES
    (1,N'Golf','2012'),(1,N'Polo','2010'),(1,N'Passat','2015'),
    (2,N'208','2012'),(2,N'308','2013'),
    (3,N'Clio','2012'),(3,N'Megane','2016'),
    (4,N'Tucson','2015'),(5,N'Sportage','2016'),(6,N'Corolla','2019');

INSERT INTO Version (modele_id, nom, motorisation, transmission) VALUES
    (1,N'Golf 1.6 TDI Trendline',   N'1.6 TDI 105ch',    'MANUELLE'),
    (1,N'Golf 2.0 TDI Highline',    N'2.0 TDI 150ch',    'DSG'),
    (2,N'Polo 1.2 TSI Comfortline', N'1.2 TSI 90ch',     'MANUELLE'),
    (4,N'208 1.2 PureTech Active',  N'1.2 PureTech 82ch','MANUELLE'),
    (6,N'Clio 1.5 dCi Zen',         N'1.5 dCi 90ch',     'MANUELLE'),
    (8,N'Tucson 2.0 CRDi Premium',  N'2.0 CRDi 185ch',   'AUTOMATIQUE');

INSERT INTO TypeIntervention (nom, delai_moyen) VALUES
    (N'Vidange',30),(N'Freinage',90),(N'Pneumatiques',45),
    (N'Révision complète',180),(N'Diagnostic',60),
    (N'Climatisation',90),(N'Carrosserie',240);

INSERT INTO SousTypeIntervention (type_intervention_id, nom, duree_estimee) VALUES
    (1,N'Vidange huile moteur 5W30',30),(1,N'Vidange huile moteur 10W40',30),
    (1,N'Remplacement filtre à huile',15),(2,N'Remplacement plaquettes avant',60),
    (2,N'Remplacement disques avant',90),(2,N'Remplacement plaquettes arrière',60),
    (3,N'Permutation pneumatiques',30),(3,N'Équilibrage roues',30),
    (3,N'Remplacement pneu unique',20),(4,N'Révision 15 000 km',120),
    (4,N'Révision 30 000 km',180),(5,N'Diagnostic électronique',45),
    (5,N'Lecture codes défauts',30),(6,N'Recharge climatisation',60),
    (6,N'Nettoyage circuit climatisation',45);

INSERT INTO PackageIntervention (nom, description, prix_estimatif) VALUES
    (N'Pack Vidange Essentiel',  N'Vidange + filtre huile',                85.000),
    (N'Pack Révision 15 000 km', N'Vidange + filtres + points de contrôle',150.000),
    (N'Pack Révision 30 000 km', N'Révision complète + pneumatiques',      280.000),
    (N'Pack Freinage Complet',   N'Plaquettes + disques avant et arrière',  320.000),
    (N'Pack Climatisation',      N'Recharge + nettoyage circuit',           95.000);

INSERT INTO Package_SousType VALUES
    (1,1),(1,3),(2,1),(2,3),(2,10),(3,1),(3,3),(3,11),(3,7),(3,8),
    (4,4),(4,5),(4,6),(5,14),(5,15);
GO

-- ============================================================
--  VERIFICATION
-- ============================================================

SELECT TABLE_NAME AS [Table],
       (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS c
        WHERE c.TABLE_NAME = t.TABLE_NAME) AS [Colonnes]
FROM INFORMATION_SCHEMA.TABLES t
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;
GO

PRINT N'✅ Reset terminé — toutes les tables recréées avec succès.';
GO