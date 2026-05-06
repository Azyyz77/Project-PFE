-- =============================================
-- Ajouter les colonnes manquantes pour le système de facturation
-- =============================================

USE CheryDB;
GO

PRINT '=== VÉRIFICATION ET AJOUT DES COLONNES MANQUANTES ===';
PRINT '';

-- =============================================
-- 1. TABLE FACTURE
-- =============================================
PRINT '1. Vérification de la table Facture...';

-- Vérifier si date_envoi existe
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Facture') AND name = 'date_envoi')
BEGIN
    ALTER TABLE Facture ADD date_envoi DATETIME2;
    PRINT '   ✓ Colonne date_envoi ajoutée';
END
ELSE
BEGIN
    PRINT '   ✓ Colonne date_envoi existe déjà';
END

-- Vérifier si date_paiement existe
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Facture') AND name = 'date_paiement')
BEGIN
    ALTER TABLE Facture ADD date_paiement DATETIME2;
    PRINT '   ✓ Colonne date_paiement ajoutée';
END
ELSE
BEGIN
    PRINT '   ✓ Colonne date_paiement existe déjà';
END

-- Vérifier si mode_paiement existe
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Facture') AND name = 'mode_paiement')
BEGIN
    ALTER TABLE Facture ADD mode_paiement VARCHAR(50);
    PRINT '   ✓ Colonne mode_paiement ajoutée';
END
ELSE
BEGIN
    PRINT '   ✓ Colonne mode_paiement existe déjà';
END

-- Vérifier si notes existe
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Facture') AND name = 'notes')
BEGIN
    ALTER TABLE Facture ADD notes NVARCHAR(MAX);
    PRINT '   ✓ Colonne notes ajoutée';
END
ELSE
BEGIN
    PRINT '   ✓ Colonne notes existe déjà';
END

PRINT '';

-- =============================================
-- 2. TABLE AGENCE
-- =============================================
PRINT '2. Vérification de la table Agence...';

-- Vérifier si email existe
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Agence') AND name = 'email')
BEGIN
    ALTER TABLE Agence ADD email VARCHAR(255);
    PRINT '   ✓ Colonne email ajoutée';
END
ELSE
BEGIN
    PRINT '   ✓ Colonne email existe déjà';
END

PRINT '';

-- =============================================
-- 3. VÉRIFICATION FINALE
-- =============================================
PRINT '3. Vérification finale...';
PRINT '';

-- Colonnes de Facture
PRINT '   Colonnes de la table Facture:';
SELECT 
    c.name AS colonne,
    t.name AS type,
    c.max_length AS taille,
    CASE WHEN c.is_nullable = 1 THEN 'NULL' ELSE 'NOT NULL' END AS nullable
FROM sys.columns c
JOIN sys.types t ON c.user_type_id = t.user_type_id
WHERE c.object_id = OBJECT_ID('Facture')
ORDER BY c.column_id;

PRINT '';

-- Colonnes de Agence
PRINT '   Colonnes de la table Agence:';
SELECT 
    c.name AS colonne,
    t.name AS type,
    c.max_length AS taille,
    CASE WHEN c.is_nullable = 1 THEN 'NULL' ELSE 'NOT NULL' END AS nullable
FROM sys.columns c
JOIN sys.types t ON c.user_type_id = t.user_type_id
WHERE c.object_id = OBJECT_ID('Agence')
ORDER BY c.column_id;

PRINT '';
PRINT '=== TERMINÉ ===';
PRINT '';
PRINT '✓ Toutes les colonnes nécessaires sont maintenant présentes';
PRINT '✓ Vous pouvez maintenant redémarrer le backend';
GO
