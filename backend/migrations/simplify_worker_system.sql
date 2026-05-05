-- ============================================
-- Script: Simplify Worker Assignment System
-- Date: 3 Mai 2026
-- Description: Remove complex tables, keep only Ouvrier and AffectationOuvrier
-- ============================================

USE STA_SAV_DB;
GO

PRINT 'Simplifying Worker Assignment System...';
PRINT '';

-- Drop CompetenceOuvrier table (too complex)
IF OBJECT_ID('CompetenceOuvrier', 'U') IS NOT NULL
BEGIN
    PRINT 'Dropping CompetenceOuvrier table...';
    DROP TABLE CompetenceOuvrier;
    PRINT 'CompetenceOuvrier table dropped';
END
ELSE
BEGIN
    PRINT 'CompetenceOuvrier table does not exist';
END
PRINT '';

-- Drop DisponibiliteOuvrier table (too complex)
IF OBJECT_ID('DisponibiliteOuvrier', 'U') IS NOT NULL
BEGIN
    PRINT 'Dropping DisponibiliteOuvrier table...';
    DROP TABLE DisponibiliteOuvrier;
    PRINT 'DisponibiliteOuvrier table dropped';
END
ELSE
BEGIN
    PRINT 'DisponibiliteOuvrier table does not exist';
END
PRINT '';

-- Simplify AffectationOuvrier table (remove complex fields)
PRINT 'Simplifying AffectationOuvrier table...';

-- Check and drop columns that are too complex
IF COL_LENGTH('AffectationOuvrier', 'priorite') IS NOT NULL
BEGIN
    ALTER TABLE AffectationOuvrier DROP COLUMN priorite;
    PRINT 'Removed priorite column';
END

IF COL_LENGTH('AffectationOuvrier', 'temps_estime_minutes') IS NOT NULL
BEGIN
    ALTER TABLE AffectationOuvrier DROP COLUMN temps_estime_minutes;
    PRINT 'Removed temps_estime_minutes column';
END

IF COL_LENGTH('AffectationOuvrier', 'temps_reel_minutes') IS NOT NULL
BEGIN
    ALTER TABLE AffectationOuvrier DROP COLUMN temps_reel_minutes;
    PRINT 'Removed temps_reel_minutes column';
END

IF COL_LENGTH('AffectationOuvrier', 'date_debut') IS NOT NULL
BEGIN
    ALTER TABLE AffectationOuvrier DROP COLUMN date_debut;
    PRINT 'Removed date_debut column';
END

IF COL_LENGTH('AffectationOuvrier', 'date_fin') IS NOT NULL
BEGIN
    ALTER TABLE AffectationOuvrier DROP COLUMN date_fin;
    PRINT 'Removed date_fin column';
END

IF COL_LENGTH('AffectationOuvrier', 'notes_ouvrier') IS NOT NULL
BEGIN
    ALTER TABLE AffectationOuvrier DROP COLUMN notes_ouvrier;
    PRINT 'Removed notes_ouvrier column';
END

IF COL_LENGTH('AffectationOuvrier', 'evaluation') IS NOT NULL
BEGIN
    ALTER TABLE AffectationOuvrier DROP COLUMN evaluation;
    PRINT 'Removed evaluation column';
END

PRINT 'AffectationOuvrier table simplified';
PRINT '';

-- Verify remaining tables
PRINT 'Verification - Remaining tables:';
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_NAME IN ('Ouvrier', 'AffectationOuvrier', 'CompetenceOuvrier', 'DisponibiliteOuvrier')
ORDER BY TABLE_NAME;

PRINT '';
PRINT 'Verification - AffectationOuvrier columns:';
SELECT COLUMN_NAME, DATA_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'AffectationOuvrier'
ORDER BY ORDINAL_POSITION;

PRINT '';
PRINT 'Worker system simplified successfully!';
PRINT '';
PRINT 'Remaining structure:';
PRINT '- Ouvrier: Basic worker info (nom, prenom, telephone, specialite, agence_id)';
PRINT '- AffectationOuvrier: Simple assignment (rendez_vous_id, ouvrier_id, agent_id, statut, notes_agent)';
GO
