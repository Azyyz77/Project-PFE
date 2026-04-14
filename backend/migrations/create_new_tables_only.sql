-- Script SQL pour créer UNIQUEMENT les nouvelles tables
-- Exécuter ce script si les tables n'existent pas encore

USE STA_SAV_DB;
GO

-- 1. Table Couleur (si elle n'existe pas)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Couleur')
BEGIN
    CREATE TABLE Couleur (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        nom NVARCHAR(50) NOT NULL,
        code_hex VARCHAR(7),
        actif BIT DEFAULT 1,
        date_creation DATETIME2 DEFAULT GETDATE()
    );
    PRINT 'Table Couleur créée';
END
ELSE
BEGIN
    PRINT 'Table Couleur existe déjà';
END
GO

-- 2. Table PackageIntervention (si elle n'existe pas)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PackageIntervention')
BEGIN
    CREATE TABLE PackageIntervention (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        nom NVARCHAR(150) NOT NULL,
        description NVARCHAR(500),
        prix DECIMAL(10,3) NOT NULL,
        duree_estimee NVARCHAR(50),
        actif BIT DEFAULT 1,
        date_creation DATETIME2 DEFAULT GETDATE()
    );
    PRINT 'Table PackageIntervention créée';
END
ELSE
BEGIN
    PRINT 'Table PackageIntervention existe déjà';
END
GO

-- 3. Table Package_SousType (si elle n'existe pas)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Package_SousType')
BEGIN
    CREATE TABLE Package_SousType (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        package_id BIGINT NOT NULL,
        sous_type_id BIGINT NOT NULL,
        FOREIGN KEY (package_id) REFERENCES PackageIntervention(id),
        FOREIGN KEY (sous_type_id) REFERENCES SousTypeIntervention(id)
    );
    PRINT 'Table Package_SousType créée';
END
ELSE
BEGIN
    PRINT 'Table Package_SousType existe déjà';
END
GO

-- 4. Table PlageHoraire (si elle n'existe pas)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PlageHoraire')
BEGIN
    CREATE TABLE PlageHoraire (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        agence_id BIGINT NOT NULL,
        jour_semaine TINYINT NOT NULL, -- 0=Dimanche, 1=Lundi, ..., 6=Samedi
        heure_debut TIME NOT NULL,
        heure_fin TIME NOT NULL,
        capacite INT NOT NULL DEFAULT 5,
        actif BIT DEFAULT 1,
        date_creation DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (agence_id) REFERENCES Agence(id)
    );
    PRINT 'Table PlageHoraire créée';
END
ELSE
BEGIN
    PRINT 'Table PlageHoraire existe déjà';
END
GO

-- 5. Table ProblemesDiagnostic (si elle n'existe pas)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ProblemesDiagnostic')
BEGIN
    CREATE TABLE ProblemesDiagnostic (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        nom NVARCHAR(150) NOT NULL,
        description NVARCHAR(500),
        solution NVARCHAR(500),
        categorie NVARCHAR(100),
        actif BIT DEFAULT 1,
        date_creation DATETIME2 DEFAULT GETDATE()
    );
    PRINT 'Table ProblemesDiagnostic créée';
END
ELSE
BEGIN
    PRINT 'Table ProblemesDiagnostic existe déjà';
END
GO

-- 6. Table Document (si elle n'existe pas)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Document')
BEGIN
    CREATE TABLE Document (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        titre NVARCHAR(200) NOT NULL,
        type_document NVARCHAR(50) NOT NULL,
        categorie NVARCHAR(100),
        chemin_fichier NVARCHAR(500),
        utilisateur_id BIGINT,
        rendez_vous_id BIGINT,
        date_upload DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (utilisateur_id) REFERENCES Utilisateur(id),
        FOREIGN KEY (rendez_vous_id) REFERENCES RendezVous(id)
    );
    PRINT 'Table Document créée';
END
ELSE
BEGIN
    PRINT 'Table Document existe déjà';
END
GO

-- 7. Table Promotion (si elle n'existe pas)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Promotion')
BEGIN
    CREATE TABLE Promotion (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        titre NVARCHAR(200) NOT NULL,
        description NVARCHAR(1000),
        image_url NVARCHAR(500),
        date_debut DATE NOT NULL,
        date_fin DATE NOT NULL,
        actif BIT DEFAULT 1,
        date_creation DATETIME2 DEFAULT GETDATE()
    );
    PRINT 'Table Promotion créée';
END
ELSE
BEGIN
    PRINT 'Table Promotion existe déjà';
END
GO

-- 8. Table PieceJointe (si elle n'existe pas)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PieceJointe')
BEGIN
    CREATE TABLE PieceJointe (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        nom_fichier NVARCHAR(255) NOT NULL,
        chemin_fichier NVARCHAR(500) NOT NULL,
        type_fichier NVARCHAR(100),
        taille_fichier BIGINT,
        rendez_vous_id BIGINT,
        reclamation_id BIGINT,
        date_upload DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (rendez_vous_id) REFERENCES RendezVous(id),
        FOREIGN KEY (reclamation_id) REFERENCES Reclamation(id)
    );
    PRINT 'Table PieceJointe créée';
END
ELSE
BEGIN
    PRINT 'Table PieceJointe existe déjà';
END
GO

-- 9. Table Feedback (si elle n'existe pas)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Feedback')
BEGIN
    CREATE TABLE Feedback (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        rendez_vous_id BIGINT NOT NULL,
        note INT NOT NULL CHECK (note >= 1 AND note <= 5),
        commentaire NVARCHAR(1000),
        date_feedback DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (rendez_vous_id) REFERENCES RendezVous(id)
    );
    PRINT 'Table Feedback créée';
END
ELSE
BEGIN
    PRINT 'Table Feedback existe déjà';
END
GO

PRINT '';
PRINT '✅ Vérification et création des tables terminée!';
PRINT 'Toutes les nouvelles tables sont maintenant disponibles.';
GO
