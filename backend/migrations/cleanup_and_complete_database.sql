-- ============================================================================
-- NETTOYAGE ET COMPLÉTION DE LA BASE DE DONNÉES
-- Date: 3 Mai 2026
-- ============================================================================

USE STA_SAV_DB;
GO

PRINT '============================================================================';
PRINT 'NETTOYAGE ET COMPLÉTION DE LA BASE DE DONNÉES';
PRINT '============================================================================';
PRINT '';

-- ============================================================================
-- 1. SUPPRIMER LES TABLES EN DOUBLE
-- ============================================================================
PRINT '🗑️  1. SUPPRESSION DES TABLES EN DOUBLE';
PRINT '----------------------------------------------------------------------------';

-- Supprimer ProblemePredéfini (garder ProblemePredefini)
IF OBJECT_ID('ProblemePredéfini', 'U') IS NOT NULL
BEGIN
    DROP TABLE ProblemePredéfini;
    PRINT '   ✅ Table ProblemePredéfini supprimée (doublon)';
END
ELSE
    PRINT '   ℹ️  Table ProblemePredéfini n existe pas';

-- Supprimer PiecesJointes (garder PieceJointe)
IF OBJECT_ID('PiecesJointes', 'U') IS NOT NULL
BEGIN
    DROP TABLE PiecesJointes;
    PRINT '   ✅ Table PiecesJointes supprimée (doublon)';
END
ELSE
    PRINT '   ℹ️  Table PiecesJointes n existe pas';

-- Supprimer appointment_logs (non utilisée)
IF OBJECT_ID('appointment_logs', 'U') IS NOT NULL
BEGIN
    DROP TABLE appointment_logs;
    PRINT '   ✅ Table appointment_logs supprimée (non utilisée)';
END
ELSE
    PRINT '   ℹ️  Table appointment_logs n existe pas';

PRINT '';

-- ============================================================================
-- 2. AJOUTER LES COLONNES MANQUANTES
-- ============================================================================
PRINT '➕ 2. AJOUT DES COLONNES MANQUANTES';
PRINT '----------------------------------------------------------------------------';

-- Ajouter couleur_id à Vehicule si elle n'existe pas
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Vehicule') AND name = 'couleur_id')
BEGIN
    ALTER TABLE Vehicule ADD couleur_id BIGINT NULL;
    PRINT '   ✅ Colonne couleur_id ajoutée à Vehicule';
END
ELSE
    PRINT '   ℹ️  Colonne couleur_id existe déjà dans Vehicule';

-- Ajouter entite_type et entite_id à PieceJointe si elles n'existent pas
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('PieceJointe') AND name = 'entite_type')
BEGIN
    ALTER TABLE PieceJointe ADD entite_type NVARCHAR(50) NULL;
    PRINT '   ✅ Colonne entite_type ajoutée à PieceJointe';
END
ELSE
    PRINT '   ℹ️  Colonne entite_type existe déjà dans PieceJointe';

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('PieceJointe') AND name = 'entite_id')
BEGIN
    ALTER TABLE PieceJointe ADD entite_id BIGINT NULL;
    PRINT '   ✅ Colonne entite_id ajoutée à PieceJointe';
END
ELSE
    PRINT '   ℹ️  Colonne entite_id existe déjà dans PieceJointe';

PRINT '';

-- ============================================================================
-- 3. AJOUTER LES CONTRAINTES DE CLÉ ÉTRANGÈRE
-- ============================================================================
PRINT '🔗 3. AJOUT DES CONTRAINTES DE CLÉ ÉTRANGÈRE';
PRINT '----------------------------------------------------------------------------';

-- FK Vehicule -> Couleur
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Vehicule_Couleur')
BEGIN
    ALTER TABLE Vehicule 
    ADD CONSTRAINT FK_Vehicule_Couleur 
    FOREIGN KEY (couleur_id) REFERENCES Couleur(id);
    PRINT '   ✅ FK_Vehicule_Couleur créée';
END
ELSE
    PRINT '   ℹ️  FK_Vehicule_Couleur existe déjà';

PRINT '';

-- ============================================================================
-- 4. AJOUTER DES DONNÉES DE TEST POUR LES TABLES VIDES
-- ============================================================================
PRINT '📊 4. AJOUT DE DONNÉES DE TEST';
PRINT '----------------------------------------------------------------------------';

-- Ajouter des interventions au catalogue si vide
IF NOT EXISTS (SELECT 1 FROM InterventionCatalog)
BEGIN
    INSERT INTO InterventionCatalog (nom, description, prix_base, duree_estimee_minutes, actif)
    VALUES 
        ('Vidange Moteur', 'Vidange complète du moteur avec filtre à huile', 150.00, 45, 1),
        ('Révision Complète', 'Révision complète du véhicule selon préconisations constructeur', 350.00, 120, 1),
        ('Changement Plaquettes Frein', 'Remplacement des plaquettes de frein avant ou arrière', 200.00, 60, 1),
        ('Diagnostic Électronique', 'Diagnostic complet du système électronique du véhicule', 80.00, 30, 1),
        ('Climatisation', 'Recharge et contrôle du système de climatisation', 120.00, 45, 1);
    
    PRINT '   ✅ 5 interventions ajoutées au catalogue';
END
ELSE
    PRINT '   ℹ️  InterventionCatalog contient déjà des données';

-- Ajouter des promotions véhicules si vide
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
                'Promotion Été 2026', 
                'Réduction de 5% sur tous les véhicules Chery',
                @marqueId,
                'POURCENTAGE',
                5.00,
                GETDATE(),
                DATEADD(MONTH, 3, GETDATE()),
                1,
                @agenceId,
                1
            );
        
        PRINT '   ✅ 1 promotion véhicule ajoutée';
    END
    ELSE
        PRINT '   ⚠️  Impossible d''ajouter des promotions (pas de marque ou agence)';
END
ELSE
    PRINT '   ℹ️  PromotionVehicule contient déjà des données';

-- Ajouter un message de bienvenue si vide
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
        
        PRINT '   ✅ 1 message de bienvenue ajouté';
    END
    ELSE
        PRINT '   ⚠️  Impossible d''ajouter un message (pas d''admin)';
END
ELSE
    PRINT '   ℹ️  MessageAccueil contient déjà des données';

PRINT '';

-- ============================================================================
-- 5. METTRE À JOUR LES VÉHICULES EXISTANTS AVEC DES COULEURS
-- ============================================================================
PRINT '🎨 5. MISE À JOUR DES VÉHICULES AVEC COULEURS';
PRINT '----------------------------------------------------------------------------';

IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Vehicule') AND name = 'couleur_id')
BEGIN
    -- Assigner des couleurs aléatoires aux véhicules sans couleur
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
        PRINT '   ✅ ' + CAST(@updatedCount AS VARCHAR) + ' véhicule(s) mis à jour avec des couleurs';
    END
    ELSE
        PRINT '   ⚠️  Aucune couleur disponible dans la table Couleur';
END
ELSE
    PRINT '   ℹ️  Colonne couleur_id n''existe pas encore dans Vehicule';

PRINT '';

-- ============================================================================
-- 6. CRÉER DES INDEX POUR AMÉLIORER LES PERFORMANCES
-- ============================================================================
PRINT '⚡ 6. CRÉATION D''INDEX POUR LES PERFORMANCES';
PRINT '----------------------------------------------------------------------------';

-- Index sur Vehicule.couleur_id
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Vehicule_Couleur')
BEGIN
    CREATE INDEX IX_Vehicule_Couleur ON Vehicule(couleur_id);
    PRINT '   ✅ Index IX_Vehicule_Couleur créé';
END
ELSE
    PRINT '   ℹ️  Index IX_Vehicule_Couleur existe déjà';

-- Index sur PieceJointe.entite_type et entite_id
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('PieceJointe') AND name = 'entite_type')
   AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_PieceJointe_Entite')
BEGIN
    CREATE INDEX IX_PieceJointe_Entite ON PieceJointe(entite_type, entite_id);
    PRINT '   ✅ Index IX_PieceJointe_Entite créé';
END
ELSE
    PRINT '   ℹ️  Index IX_PieceJointe_Entite existe déjà ou colonnes manquantes';

PRINT '';

-- ============================================================================
-- 7. VÉRIFICATION FINALE
-- ============================================================================
PRINT '✅ 7. VÉRIFICATION FINALE';
PRINT '----------------------------------------------------------------------------';

SELECT 
    'Tables Totales' AS [Catégorie],
    COUNT(*) AS [Nombre]
FROM sys.tables
WHERE is_ms_shipped = 0

UNION ALL

SELECT 
    'Tables Vides' AS [Catégorie],
    COUNT(*) AS [Nombre]
FROM sys.tables t
INNER JOIN sys.partitions p ON t.object_id = p.object_id
WHERE t.is_ms_shipped = 0
  AND p.index_id IN (0, 1)
  AND p.rows = 0

UNION ALL

SELECT 
    'Tables avec Données' AS [Catégorie],
    COUNT(*) AS [Nombre]
FROM sys.tables t
INNER JOIN sys.partitions p ON t.object_id = p.object_id
WHERE t.is_ms_shipped = 0
  AND p.index_id IN (0, 1)
  AND p.rows > 0;

PRINT '';
PRINT '============================================================================';
PRINT '✅ NETTOYAGE ET COMPLÉTION TERMINÉS';
PRINT '============================================================================';
PRINT '';
PRINT '📋 Actions effectuées:';
PRINT '   1. ✅ Tables en double supprimées';
PRINT '   2. ✅ Colonnes manquantes ajoutées';
PRINT '   3. ✅ Contraintes FK ajoutées';
PRINT '   4. ✅ Données de test ajoutées';
PRINT '   5. ✅ Véhicules mis à jour avec couleurs';
PRINT '   6. ✅ Index de performance créés';
PRINT '';
PRINT '💡 Prochaines étapes:';
PRINT '   - Créer les controllers manquants (welcomeMessage, appointmentHistory)';
PRINT '   - Créer les routes correspondantes';
PRINT '   - Créer les pages frontend';
PRINT '   - Ajouter plus de données de test';
PRINT '';
