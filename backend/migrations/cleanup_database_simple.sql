-- ============================================================================
-- NETTOYAGE ET COMPLETION DE LA BASE DE DONNEES
-- Version simplifiee sans apostrophes
-- ============================================================================

USE STA_SAV_DB;
GO

PRINT '============================================================================';
PRINT 'NETTOYAGE ET COMPLETION DE LA BASE DE DONNEES';
PRINT '============================================================================';
PRINT '';

-- ============================================================================
-- 1. SUPPRIMER LES TABLES EN DOUBLE
-- ============================================================================
PRINT '1. SUPPRESSION DES TABLES EN DOUBLE';
PRINT '----------------------------------------------------------------------------';

IF OBJECT_ID('ProblemePredéfini', 'U') IS NOT NULL
BEGIN
    DROP TABLE [ProblemePredéfini];
    PRINT '   Table ProblemePredéfini supprimee';
END

IF OBJECT_ID('PiecesJointes', 'U') IS NOT NULL
BEGIN
    DROP TABLE PiecesJointes;
    PRINT '   Table PiecesJointes supprimee';
END

IF OBJECT_ID('appointment_logs', 'U') IS NOT NULL
BEGIN
    DROP TABLE appointment_logs;
    PRINT '   Table appointment_logs supprimee';
END

PRINT '';

-- ============================================================================
-- 2. AJOUTER LES COLONNES MANQUANTES
-- ============================================================================
PRINT '2. AJOUT DES COLONNES MANQUANTES';
PRINT '----------------------------------------------------------------------------';

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Vehicule') AND name = 'couleur_id')
BEGIN
    ALTER TABLE Vehicule ADD couleur_id BIGINT NULL;
    PRINT '   Colonne couleur_id ajoutee a Vehicule';
END

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('PieceJointe') AND name = 'entite_type')
BEGIN
    ALTER TABLE PieceJointe ADD entite_type NVARCHAR(50) NULL;
    PRINT '   Colonne entite_type ajoutee a PieceJointe';
END

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('PieceJointe') AND name = 'entite_id')
BEGIN
    ALTER TABLE PieceJointe ADD entite_id BIGINT NULL;
    PRINT '   Colonne entite_id ajoutee a PieceJointe';
END

PRINT '';

-- ============================================================================
-- 3. AJOUTER LES CONTRAINTES DE CLE ETRANGERE
-- ============================================================================
PRINT '3. AJOUT DES CONTRAINTES DE CLE ETRANGERE';
PRINT '----------------------------------------------------------------------------';

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Vehicule_Couleur')
BEGIN
    ALTER TABLE Vehicule 
    ADD CONSTRAINT FK_Vehicule_Couleur 
    FOREIGN KEY (couleur_id) REFERENCES Couleur(id);
    PRINT '   FK_Vehicule_Couleur creee';
END

PRINT '';

-- ============================================================================
-- 4. AJOUTER DES DONNEES DE TEST
-- ============================================================================
PRINT '4. AJOUT DE DONNEES DE TEST';
PRINT '----------------------------------------------------------------------------';

-- Ajouter des interventions au catalogue
IF NOT EXISTS (SELECT 1 FROM InterventionCatalog)
BEGIN
    INSERT INTO InterventionCatalog (nom, description, prix_base, duree_estimee_minutes, actif)
    VALUES 
        ('Vidange Moteur', 'Vidange complete du moteur avec filtre a huile', 150.00, 45, 1),
        ('Revision Complete', 'Revision complete du vehicule selon preconisations constructeur', 350.00, 120, 1),
        ('Changement Plaquettes Frein', 'Remplacement des plaquettes de frein avant ou arriere', 200.00, 60, 1),
        ('Diagnostic Electronique', 'Diagnostic complet du systeme electronique du vehicule', 80.00, 30, 1),
        ('Climatisation', 'Recharge et controle du systeme de climatisation', 120.00, 45, 1);
    
    PRINT '   5 interventions ajoutees au catalogue';
END

-- Ajouter des promotions vehicules
IF NOT EXISTS (SELECT 1 FROM PromotionVehicule)
BEGIN
    DECLARE @marqueId BIGINT = (SELECT TOP 1 id FROM Marque);
    DECLARE @agenceId BIGINT = (SELECT TOP 1 id FROM Agence);
    
    IF @marqueId IS NOT NULL AND @agenceId IS NOT NULL
    BEGIN
        INSERT INTO PromotionVehicule (
            titre, description, marque_id, type_promotion, valeur_reduction,
            date_debut, date_fin, actif, agence_id, created_by
        )
        VALUES 
            (
                'Promotion Ete 2026', 
                'Reduction de 5% sur tous les vehicules Chery',
                @marqueId,
                'POURCENTAGE',
                5.00,
                GETDATE(),
                DATEADD(MONTH, 3, GETDATE()),
                1,
                @agenceId,
                1
            );
        
        PRINT '   1 promotion vehicule ajoutee';
    END
END

-- Ajouter un message de bienvenue
IF NOT EXISTS (SELECT 1 FROM MessageAccueil)
BEGIN
    DECLARE @adminId BIGINT = (SELECT TOP 1 id FROM Utilisateur WHERE role_id = (SELECT id FROM Role WHERE nom = 'ADMIN'));
    
    IF @adminId IS NOT NULL
    BEGIN
        INSERT INTO MessageAccueil (
            titre, contenu, type_message, priorite, actif,
            date_debut, date_fin, cible_role, created_by
        )
        VALUES 
            (
                'Bienvenue chez STA Chery Tunisia',
                '<h2>Bienvenue!</h2><p>Nous sommes ravis de vous accueillir sur notre plateforme de gestion SAV.</p>',
                'BIENVENUE',
                'NORMALE',
                1,
                GETDATE(),
                DATEADD(YEAR, 1, GETDATE()),
                'CLIENT',
                @adminId
            );
        
        PRINT '   1 message de bienvenue ajoute';
    END
END

PRINT '';

-- ============================================================================
-- 5. METTRE A JOUR LES VEHICULES AVEC DES COULEURS
-- ============================================================================
PRINT '5. MISE A JOUR DES VEHICULES AVEC COULEURS';
PRINT '----------------------------------------------------------------------------';

IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Vehicule') AND name = 'couleur_id')
BEGIN
    DECLARE @couleurCount INT = (SELECT COUNT(*) FROM Couleur);
    
    IF @couleurCount > 0
    BEGIN
        UPDATE v
        SET v.couleur_id = (
            SELECT TOP 1 c.id 
            FROM Couleur c 
            ORDER BY NEWID()
        )
        FROM Vehicule v
        WHERE v.couleur_id IS NULL;
        
        DECLARE @updatedCount INT = @@ROWCOUNT;
        PRINT '   ' + CAST(@updatedCount AS VARCHAR) + ' vehicule(s) mis a jour avec des couleurs';
    END
END

PRINT '';

-- ============================================================================
-- 6. CREER DES INDEX POUR AMELIORER LES PERFORMANCES
-- ============================================================================
PRINT '6. CREATION D INDEX POUR LES PERFORMANCES';
PRINT '----------------------------------------------------------------------------';

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Vehicule_Couleur')
BEGIN
    CREATE INDEX IX_Vehicule_Couleur ON Vehicule(couleur_id);
    PRINT '   Index IX_Vehicule_Couleur cree';
END

IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('PieceJointe') AND name = 'entite_type')
   AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_PieceJointe_Entite')
BEGIN
    CREATE INDEX IX_PieceJointe_Entite ON PieceJointe(entite_type, entite_id);
    PRINT '   Index IX_PieceJointe_Entite cree';
END

PRINT '';

-- ============================================================================
-- 7. VERIFICATION FINALE
-- ============================================================================
PRINT '7. VERIFICATION FINALE';
PRINT '----------------------------------------------------------------------------';

SELECT 
    'Tables Totales' AS [Categorie],
    COUNT(*) AS [Nombre]
FROM sys.tables
WHERE is_ms_shipped = 0

UNION ALL

SELECT 
    'Tables Vides' AS [Categorie],
    COUNT(*) AS [Nombre]
FROM sys.tables t
INNER JOIN sys.partitions p ON t.object_id = p.object_id
WHERE t.is_ms_shipped = 0
  AND p.index_id IN (0, 1)
  AND p.rows = 0

UNION ALL

SELECT 
    'Tables avec Donnees' AS [Categorie],
    COUNT(*) AS [Nombre]
FROM sys.tables t
INNER JOIN sys.partitions p ON t.object_id = p.object_id
WHERE t.is_ms_shipped = 0
  AND p.index_id IN (0, 1)
  AND p.rows > 0;

PRINT '';
PRINT '============================================================================';
PRINT 'NETTOYAGE ET COMPLETION TERMINES';
PRINT '============================================================================';
