-- =============================================
-- Script de Vérification des Tables de Commandes
-- Date: 6 Mai 2026
-- =============================================

USE STA_SAV_DB;
GO

PRINT '🔍 Vérification des tables de commandes de réparation...';
PRINT '';
GO

-- Vérifier CommandeReparation
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'CommandeReparation')
BEGIN
    PRINT '✅ Table CommandeReparation EXISTE';
    SELECT COUNT(*) AS nombre_commandes FROM CommandeReparation;
END
ELSE
BEGIN
    PRINT '❌ Table CommandeReparation MANQUANTE';
END
GO

-- Vérifier LigneCommande
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'LigneCommande')
BEGIN
    PRINT '✅ Table LigneCommande EXISTE';
    SELECT COUNT(*) AS nombre_lignes FROM LigneCommande;
END
ELSE
BEGIN
    PRINT '❌ Table LigneCommande MANQUANTE';
END
GO

-- Vérifier Facture
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Facture')
BEGIN
    PRINT '✅ Table Facture EXISTE';
    SELECT COUNT(*) AS nombre_factures FROM Facture;
END
ELSE
BEGIN
    PRINT '❌ Table Facture MANQUANTE';
END
GO

-- Vérifier Paiement
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Paiement')
BEGIN
    PRINT '✅ Table Paiement EXISTE';
    SELECT COUNT(*) AS nombre_paiements FROM Paiement;
END
ELSE
BEGIN
    PRINT '❌ Table Paiement MANQUANTE';
END
GO

-- Vérifier HistoriqueStatutCommande
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'HistoriqueStatutCommande')
BEGIN
    PRINT '✅ Table HistoriqueStatutCommande EXISTE';
END
ELSE
BEGIN
    PRINT '❌ Table HistoriqueStatutCommande MANQUANTE';
END
GO

-- Vérifier PhotoCommande
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'PhotoCommande')
BEGIN
    PRINT '✅ Table PhotoCommande EXISTE';
END
ELSE
BEGIN
    PRINT '❌ Table PhotoCommande MANQUANTE';
END
GO

PRINT '';
PRINT '─────────────────────────────────────────────';
PRINT 'Vérification terminée';
GO
