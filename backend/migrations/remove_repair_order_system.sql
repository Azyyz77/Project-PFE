-- =============================================
-- Script de Suppression du Système de Commandes de Réparation
-- Date: 5 Mai 2026
-- =============================================

USE STA_SAV_DB;
GO

PRINT '🗑️ Début de la suppression du système de commandes de réparation...';
GO

-- 1. Supprimer les triggers
PRINT '1️⃣ Suppression des triggers...';
GO

IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'TR_LigneCommande_UpdateTotaux')
BEGIN
    DROP TRIGGER TR_LigneCommande_UpdateTotaux;
    PRINT '   ✅ Trigger TR_LigneCommande_UpdateTotaux supprimé';
END
GO

IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'TR_CommandeReparation_Numero')
BEGIN
    DROP TRIGGER TR_CommandeReparation_Numero;
    PRINT '   ✅ Trigger TR_CommandeReparation_Numero supprimé';
END
GO

-- 2. Supprimer les tables (dans l'ordre inverse des dépendances)
PRINT '2️⃣ Suppression des tables...';
GO

-- Supprimer HistoriqueStatutCommande
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'HistoriqueStatutCommande')
BEGIN
    DROP TABLE HistoriqueStatutCommande;
    PRINT '   ✅ Table HistoriqueStatutCommande supprimée';
END
GO

-- Supprimer PhotoCommande
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'PhotoCommande')
BEGIN
    DROP TABLE PhotoCommande;
    PRINT '   ✅ Table PhotoCommande supprimée';
END
GO

-- Supprimer LigneCommande
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'LigneCommande')
BEGIN
    DROP TABLE LigneCommande;
    PRINT '   ✅ Table LigneCommande supprimée';
END
GO

-- Supprimer CommandeReparation
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'CommandeReparation')
BEGIN
    DROP TABLE CommandeReparation;
    PRINT '   ✅ Table CommandeReparation supprimée';
END
GO

PRINT '✅ Système de commandes de réparation supprimé avec succès!';
GO
