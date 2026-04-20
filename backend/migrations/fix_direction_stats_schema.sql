-- Fix schema issues for direction statistics
-- This migration addresses missing tables and columns referenced in directionStatsController

-- 1. Check if InterventionCatalog table exists, if not create it
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'InterventionCatalog')
BEGIN
    CREATE TABLE InterventionCatalog (
        id BIGINT PRIMARY KEY IDENTITY(1,1),
        nom NVARCHAR(255) NOT NULL,
        description NVARCHAR(MAX),
        prix DECIMAL(10,2),
        duree_estimee_min INT,
        actif BIT DEFAULT 1,
        date_creation DATETIME DEFAULT GETDATE(),
        date_modification DATETIME DEFAULT GETDATE()
    );
    PRINT 'Table InterventionCatalog créée';
END
ELSE
BEGIN
    PRINT 'Table InterventionCatalog existe déjà';
END
GO

-- 2. Verify InterventionCatalog table structure
-- The table should already exist, this just verifies it
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'InterventionCatalog')
BEGIN
    PRINT 'Table InterventionCatalog vérifiée';
END
GO

-- 3. Check Feedback table for appointment_id column
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Feedback')
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Feedback') AND name = 'appointment_id')
    BEGIN
        -- If rdv_id exists, rename it
        IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Feedback') AND name = 'rdv_id')
        BEGIN
            EXEC sp_rename 'Feedback.rdv_id', 'appointment_id', 'COLUMN';
            PRINT 'Colonne rdv_id renommée en appointment_id dans Feedback';
        END
        ELSE
        BEGIN
            ALTER TABLE Feedback ADD appointment_id BIGINT NULL;
            PRINT 'Colonne appointment_id ajoutée à Feedback';
        END
    END
END
GO

-- 4. Check Reclamation table for appointment_id column
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Reclamation')
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Reclamation') AND name = 'appointment_id')
    BEGIN
        IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Reclamation') AND name = 'rdv_id')
        BEGIN
            EXEC sp_rename 'Reclamation.rdv_id', 'appointment_id', 'COLUMN';
            PRINT 'Colonne rdv_id renommée en appointment_id dans Reclamation';
        END
        ELSE
        BEGIN
            ALTER TABLE Reclamation ADD appointment_id BIGINT NULL;
            PRINT 'Colonne appointment_id ajoutée à Reclamation';
        END
    END
END
GO

-- 5. Create or update VW_StatsAgence view
IF EXISTS (SELECT * FROM sys.views WHERE name = 'VW_StatsAgence')
BEGIN
    DROP VIEW VW_StatsAgence;
    PRINT 'Vue VW_StatsAgence supprimée';
END
GO

CREATE VIEW VW_StatsAgence AS
SELECT 
    ag.id AS agence_id,
    ag.nom AS agence_nom,
    ag.ville,
    COUNT(r.id) AS total_rdv,
    SUM(CASE WHEN r.statut = 'TERMINE' THEN 1 ELSE 0 END) AS rdv_termines,
    SUM(CASE WHEN r.statut = 'ANNULE' THEN 1 ELSE 0 END) AS rdv_annules,
    SUM(CASE WHEN r.statut = 'NO_SHOW' THEN 1 ELSE 0 END) AS rdv_no_show,
    AVG(DATEDIFF(MINUTE, r.heure_reelle_debut, r.heure_reelle_fin)) AS duree_moy_min
FROM Agence ag
LEFT JOIN RendezVous r ON r.agence_id = ag.id
GROUP BY ag.id, ag.nom, ag.ville;
GO

PRINT 'Vue VW_StatsAgence créée';
GO

-- 6. Verify the schema
SELECT 'InterventionCatalog' AS TableName, COUNT(*) AS ColumnCount 
FROM sys.columns 
WHERE object_id = OBJECT_ID('InterventionCatalog')
UNION ALL
SELECT 'Appointment', COUNT(*) 
FROM sys.columns 
WHERE object_id = OBJECT_ID('Appointment')
UNION ALL
SELECT 'Feedback', COUNT(*) 
FROM sys.columns 
WHERE object_id = OBJECT_ID('Feedback')
UNION ALL
SELECT 'Reclamation', COUNT(*) 
FROM sys.columns 
WHERE object_id = OBJECT_ID('Reclamation');
GO
