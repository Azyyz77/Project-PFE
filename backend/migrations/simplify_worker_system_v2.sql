-- ============================================
-- Script: Simplify Worker Assignment System V2
-- Date: 3 Mai 2026
-- Description: Remove complex tables and simplify AffectationOuvrier
-- ============================================

USE STA_SAV_DB;
GO

PRINT 'Simplifying Worker Assignment System V2...';
PRINT '';

-- Drop CompetenceOuvrier table (already done)
IF OBJECT_ID('CompetenceOuvrier', 'U') IS NOT NULL
BEGIN
    PRINT 'Dropping CompetenceOuvrier table...';
    DROP TABLE CompetenceOuvrier;
    PRINT 'CompetenceOuvrier table dropped';
END
ELSE
BEGIN
    PRINT 'CompetenceOuvrier table already dropped';
END
PRINT '';

-- Drop DisponibiliteOuvrier table (already done)
IF OBJECT_ID('DisponibiliteOuvrier', 'U') IS NOT NULL
BEGIN
    PRINT 'Dropping DisponibiliteOuvrier table...';
    DROP TABLE DisponibiliteOuvrier;
    PRINT 'DisponibiliteOuvrier table dropped';
END
ELSE
BEGIN
    PRINT 'DisponibiliteOuvrier table already dropped';
END
PRINT '';

-- Drop all constraints and defaults on AffectationOuvrier
PRINT 'Dropping constraints on AffectationOuvrier...';

DECLARE @sql NVARCHAR(MAX) = '';

-- Drop all CHECK constraints
SELECT @sql = @sql + 'ALTER TABLE AffectationOuvrier DROP CONSTRAINT ' + name + ';' + CHAR(13)
FROM sys.check_constraints
WHERE parent_object_id = OBJECT_ID('AffectationOuvrier');

-- Drop all DEFAULT constraints
SELECT @sql = @sql + 'ALTER TABLE AffectationOuvrier DROP CONSTRAINT ' + name + ';' + CHAR(13)
FROM sys.default_constraints
WHERE parent_object_id = OBJECT_ID('AffectationOuvrier');

IF LEN(@sql) > 0
BEGIN
    EXEC sp_executesql @sql;
    PRINT 'Constraints dropped';
END
ELSE
BEGIN
    PRINT 'No constraints to drop';
END
PRINT '';

-- Now drop the complex columns
PRINT 'Dropping complex columns from AffectationOuvrier...';

DECLARE @dropSql NVARCHAR(MAX) = 'ALTER TABLE AffectationOuvrier DROP COLUMN ';
DECLARE @columns NVARCHAR(MAX) = '';

IF COL_LENGTH('AffectationOuvrier', 'priorite') IS NOT NULL
    SET @columns = @columns + 'priorite, ';

IF COL_LENGTH('AffectationOuvrier', 'temps_estime_minutes') IS NOT NULL
    SET @columns = @columns + 'temps_estime_minutes, ';

IF COL_LENGTH('AffectationOuvrier', 'temps_reel_minutes') IS NOT NULL
    SET @columns = @columns + 'temps_reel_minutes, ';

IF COL_LENGTH('AffectationOuvrier', 'date_debut') IS NOT NULL
    SET @columns = @columns + 'date_debut, ';

IF COL_LENGTH('AffectationOuvrier', 'date_fin') IS NOT NULL
    SET @columns = @columns + 'date_fin, ';

IF COL_LENGTH('AffectationOuvrier', 'notes_ouvrier') IS NOT NULL
    SET @columns = @columns + 'notes_ouvrier, ';

IF COL_LENGTH('AffectationOuvrier', 'evaluation') IS NOT NULL
    SET @columns = @columns + 'evaluation, ';

-- Remove trailing comma
IF LEN(@columns) > 0
BEGIN
    SET @columns = LEFT(@columns, LEN(@columns) - 1);
    SET @dropSql = @dropSql + @columns + ';';
    EXEC sp_executesql @dropSql;
    PRINT 'Complex columns dropped';
END
ELSE
BEGIN
    PRINT 'No columns to drop';
END
PRINT '';

-- Verify remaining structure
PRINT 'Verification - Remaining tables:';
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_NAME IN ('Ouvrier', 'AffectationOuvrier', 'CompetenceOuvrier', 'DisponibiliteOuvrier')
ORDER BY TABLE_NAME;
PRINT '';

PRINT 'Verification - AffectationOuvrier columns:';
SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'AffectationOuvrier'
ORDER BY ORDINAL_POSITION;
PRINT '';

PRINT 'Worker system simplified successfully!';
PRINT '';
PRINT 'SIMPLE STRUCTURE:';
PRINT '==================';
PRINT 'Ouvrier:';
PRINT '  - id, nom, prenom, telephone, email, specialite, agence_id, actif';
PRINT '';
PRINT 'AffectationOuvrier:';
PRINT '  - id, rendez_vous_id, ouvrier_id, agent_id, date_affectation, statut, notes_agent';
PRINT '';
PRINT 'WORKFLOW:';
PRINT '1. Client creates appointment';
PRINT '2. Agent clicks on appointment';
PRINT '3. Agent assigns worker';
PRINT '4. Done!';
GO
