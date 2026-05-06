-- Drop Repair Order System Tables
-- This script removes all tables and triggers related to the repair order system

USE STA_SAV_DB;
GO

-- Drop triggers first
IF OBJECT_ID('TR_CommandeReparation_Numero', 'TR') IS NOT NULL
BEGIN
    DROP TRIGGER TR_CommandeReparation_Numero;
    PRINT 'Trigger TR_CommandeReparation_Numero dropped';
END
ELSE
BEGIN
    PRINT 'Trigger TR_CommandeReparation_Numero does not exist';
END
GO

IF OBJECT_ID('TR_LigneCommande_UpdateTotaux', 'TR') IS NOT NULL
BEGIN
    DROP TRIGGER TR_LigneCommande_UpdateTotaux;
    PRINT 'Trigger TR_LigneCommande_UpdateTotaux dropped';
END
ELSE
BEGIN
    PRINT 'Trigger TR_LigneCommande_UpdateTotaux does not exist';
END
GO

-- Drop tables in correct order (child tables first)
IF OBJECT_ID('HistoriqueStatutCommande', 'U') IS NOT NULL
BEGIN
    DROP TABLE HistoriqueStatutCommande;
    PRINT 'Table HistoriqueStatutCommande dropped';
END
ELSE
BEGIN
    PRINT 'Table HistoriqueStatutCommande does not exist';
END
GO

IF OBJECT_ID('PhotoCommande', 'U') IS NOT NULL
BEGIN
    DROP TABLE PhotoCommande;
    PRINT 'Table PhotoCommande dropped';
END
ELSE
BEGIN
    PRINT 'Table PhotoCommande does not exist';
END
GO

IF OBJECT_ID('LigneCommande', 'U') IS NOT NULL
BEGIN
    DROP TABLE LigneCommande;
    PRINT 'Table LigneCommande dropped';
END
ELSE
BEGIN
    PRINT 'Table LigneCommande does not exist';
END
GO

IF OBJECT_ID('CommandeReparation', 'U') IS NOT NULL
BEGIN
    DROP TABLE CommandeReparation;
    PRINT 'Table CommandeReparation dropped';
END
ELSE
BEGIN
    PRINT 'Table CommandeReparation does not exist';
END
GO

PRINT 'Repair order system cleanup completed';
GO
