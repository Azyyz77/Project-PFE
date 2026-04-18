-- ============================================================
-- MIGRATION: Corrections et optimisations de la base de données
-- Date: 2026-04-16
-- Description: Nettoyer les doublons, ajouter les colonnes manquantes,
--              créer les indexes manquants
-- ============================================================

USE [STA_SAV_DB];
GO

PRINT '========================================';
PRINT 'DÉBUT DE LA MIGRATION';
PRINT '========================================';

-- ============================================================
-- ÉTAPE 1: Supprimer la colonne type_utilisateur (doublon avec role_id)
-- ============================================================
PRINT '';
PRINT 'ÉTAPE 1: Nettoyage de la table Utilisateur';

IF EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID('Utilisateur') 
    AND name = 'type_utilisateur'
)
BEGIN
    -- Vérifier que tous les utilisateurs ont un role_id
    IF NOT EXISTS (SELECT 1 FROM Utilisateur WHERE role_id IS NULL)
    BEGIN
        ALTER TABLE Utilisateur DROP COLUMN type_utilisateur;
        PRINT '✓ Colonne type_utilisateur supprimée (doublon avec role_id)';
    END
    ELSE
    BEGIN
        PRINT '⚠ Impossible de supprimer type_utilisateur: certains utilisateurs n''ont pas de role_id';
        PRINT '  Action requise: Mettre à jour les utilisateurs sans role_id';
    END
END
ELSE
BEGIN
    PRINT '✓ Colonne type_utilisateur déjà supprimée';
END
GO

-- ============================================================
-- ÉTAPE 2: Ajouter statut_validation à Vehicule (si pas déjà fait)
-- ============================================================
PRINT '';
PRINT 'ÉTAPE 2: Ajout de statut_validation à Vehicule';

IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID('Vehicule') 
    AND name = 'statut_validation'
)
BEGIN
    ALTER TABLE Vehicule
    ADD statut_validation VARCHAR(20) NOT NULL DEFAULT 'EN_ATTENTE';
    
    PRINT '✓ Colonne statut_validation ajoutée';
    PRINT '  Valeurs possibles: EN_ATTENTE, VALIDE, REFUSE';
END
ELSE
BEGIN
    PRINT '✓ Colonne statut_validation existe déjà';
END
GO

-- ============================================================
-- ÉTAPE 3: Ajouter date_validation et agent_validation_id à Vehicule
-- ============================================================
PRINT '';
PRINT 'ÉTAPE 3: Ajout de colonnes de validation à Vehicule';

IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID('Vehicule') 
    AND name = 'date_validation'
)
BEGIN
    ALTER TABLE Vehicule
    ADD date_validation DATETIME2(7) NULL;
    
    PRINT '✓ Colonne date_validation ajoutée';
END
ELSE
BEGIN
    PRINT '✓ Colonne date_validation existe déjà';
END

IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID('Vehicule') 
    AND name = 'agent_validation_id'
)
BEGIN
    ALTER TABLE Vehicule
    ADD agent_validation_id BIGINT NULL;
    
    -- Ajouter la contrainte de clé étrangère
    ALTER TABLE Vehicule
    ADD CONSTRAINT FK_Vehicule_Agent_Validation
    FOREIGN KEY (agent_validation_id) REFERENCES Utilisateur(id);
    
    PRINT '✓ Colonne agent_validation_id ajoutée avec FK';
END
ELSE
BEGIN
    PRINT '✓ Colonne agent_validation_id existe déjà';
END
GO

-- ============================================================
-- ÉTAPE 4: Créer des indexes manquants pour optimiser les performances
-- ============================================================
PRINT '';
PRINT 'ÉTAPE 4: Création des indexes manquants';

-- Index sur Vehicule.statut_validation
IF NOT EXISTS (
    SELECT * FROM sys.indexes 
    WHERE name = 'IX_Vehicule_StatutValidation' 
    AND object_id = OBJECT_ID('Vehicule')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_Vehicule_StatutValidation
    ON Vehicule(statut_validation)
    WHERE statut_validation = 'EN_ATTENTE';
    
    PRINT '✓ Index IX_Vehicule_StatutValidation créé';
END
ELSE
BEGIN
    PRINT '✓ Index IX_Vehicule_StatutValidation existe déjà';
END

-- Index sur Utilisateur.email (pour login rapide)
IF NOT EXISTS (
    SELECT * FROM sys.indexes 
    WHERE name = 'IX_Utilisateur_Email' 
    AND object_id = OBJECT_ID('Utilisateur')
)
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX IX_Utilisateur_Email
    ON Utilisateur(email);
    
    PRINT '✓ Index IX_Utilisateur_Email créé';
END
ELSE
BEGIN
    PRINT '✓ Index IX_Utilisateur_Email existe déjà';
END

-- Index sur Utilisateur.telephone (pour recherche rapide)
IF NOT EXISTS (
    SELECT * FROM sys.indexes 
    WHERE name = 'IX_Utilisateur_Telephone' 
    AND object_id = OBJECT_ID('Utilisateur')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_Utilisateur_Telephone
    ON Utilisateur(telephone);
    
    PRINT '✓ Index IX_Utilisateur_Telephone créé';
END
ELSE
BEGIN
    PRINT '✓ Index IX_Utilisateur_Telephone existe déjà';
END

-- Index sur Utilisateur.telephone_verifie
IF NOT EXISTS (
    SELECT * FROM sys.indexes 
    WHERE name = 'IX_Utilisateur_TelephoneVerifie' 
    AND object_id = OBJECT_ID('Utilisateur')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_Utilisateur_TelephoneVerifie
    ON Utilisateur(telephone_verifie)
    WHERE telephone_verifie = 0;
    
    PRINT '✓ Index IX_Utilisateur_TelephoneVerifie créé';
END
ELSE
BEGIN
    PRINT '✓ Index IX_Utilisateur_TelephoneVerifie existe déjà';
END

-- Index sur RendezVous.statut
IF NOT EXISTS (
    SELECT * FROM sys.indexes 
    WHERE name = 'IX_RDV_Statut' 
    AND object_id = OBJECT_ID('RendezVous')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_RDV_Statut
    ON RendezVous(statut);
    
    PRINT '✓ Index IX_RDV_Statut créé';
END
ELSE
BEGIN
    PRINT '✓ Index IX_RDV_Statut existe déjà';
END

-- Index sur Reclamation.date_soumission
IF NOT EXISTS (
    SELECT * FROM sys.indexes 
    WHERE name = 'IX_Reclamation_DateSoumission' 
    AND object_id = OBJECT_ID('Reclamation')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_Reclamation_DateSoumission
    ON Reclamation(date_soumission DESC);
    
    PRINT '✓ Index IX_Reclamation_DateSoumission créé';
END
ELSE
BEGIN
    PRINT '✓ Index IX_Reclamation_DateSoumission existe déjà';
END
GO

-- ============================================================
-- ÉTAPE 5: Ajouter des contraintes CHECK manquantes
-- ============================================================
PRINT '';
PRINT 'ÉTAPE 5: Ajout des contraintes CHECK';

-- Contrainte sur Vehicule.statut_validation
IF NOT EXISTS (
    SELECT * FROM sys.check_constraints 
    WHERE name = 'CK_Vehicule_StatutValidation'
)
BEGIN
    ALTER TABLE Vehicule
    ADD CONSTRAINT CK_Vehicule_StatutValidation
    CHECK (statut_validation IN ('EN_ATTENTE', 'VALIDE', 'REFUSE'));
    
    PRINT '✓ Contrainte CK_Vehicule_StatutValidation ajoutée';
END
ELSE
BEGIN
    PRINT '✓ Contrainte CK_Vehicule_StatutValidation existe déjà';
END

-- Contrainte sur RendezVous.feedback_note
IF NOT EXISTS (
    SELECT * FROM sys.check_constraints 
    WHERE name = 'CK_RDV_FeedbackNote'
)
BEGIN
    ALTER TABLE RendezVous
    ADD CONSTRAINT CK_RDV_FeedbackNote
    CHECK (feedback_note IS NULL OR (feedback_note >= 1 AND feedback_note <= 5));
    
    PRINT '✓ Contrainte CK_RDV_FeedbackNote ajoutée';
END
ELSE
BEGIN
    PRINT '✓ Contrainte CK_RDV_FeedbackNote existe déjà';
END

-- Contrainte sur Vehicule.annee
IF NOT EXISTS (
    SELECT * FROM sys.check_constraints 
    WHERE name = 'CK_Vehicule_Annee'
)
BEGIN
    ALTER TABLE Vehicule
    ADD CONSTRAINT CK_Vehicule_Annee
    CHECK (annee >= 1900 AND annee <= YEAR(GETDATE()) + 1);
    
    PRINT '✓ Contrainte CK_Vehicule_Annee ajoutée';
END
ELSE
BEGIN
    PRINT '✓ Contrainte CK_Vehicule_Annee existe déjà';
END
GO

-- ============================================================
-- ÉTAPE 6: Mettre à jour les données existantes
-- ============================================================
PRINT '';
PRINT 'ÉTAPE 6: Mise à jour des données existantes';

-- Mettre à jour les véhicules sans statut_validation
UPDATE Vehicule
SET statut_validation = 'VALIDE'
WHERE statut_validation IS NULL OR statut_validation = '';

PRINT '✓ Véhicules sans statut mis à jour';

-- Mettre à jour les utilisateurs sans telephone_verifie
UPDATE Utilisateur
SET telephone_verifie = 0
WHERE telephone_verifie IS NULL;

PRINT '✓ Utilisateurs sans telephone_verifie mis à jour';
GO

-- ============================================================
-- ÉTAPE 7: Créer des vues utiles supplémentaires
-- ============================================================
PRINT '';
PRINT 'ÉTAPE 7: Création de vues supplémentaires';

-- Vue pour les véhicules en attente de validation
IF OBJECT_ID('VW_VehiculesEnAttenteValidation', 'V') IS NOT NULL
    DROP VIEW VW_VehiculesEnAttenteValidation;
GO

CREATE VIEW VW_VehiculesEnAttenteValidation AS
SELECT
    v.id AS vehicule_id,
    v.immatriculation,
    v.numero_chassis,
    v.annee,
    v.date_ajout,
    v.statut_validation,
    c.id AS client_id,
    c.nom + ' ' + c.prenom AS client_nom,
    c.telephone AS client_telephone,
    c.email AS client_email,
    ma.nom AS marque,
    mo.nom AS modele,
    ve.nom AS version_nom
FROM Vehicule v
JOIN Utilisateur c ON c.id = v.client_id
JOIN Version ve ON ve.id = v.version_id
JOIN Modele mo ON mo.id = ve.modele_id
JOIN Marque ma ON ma.id = mo.marque_id
WHERE v.statut_validation = 'EN_ATTENTE';
GO

PRINT '✓ Vue VW_VehiculesEnAttenteValidation créée';

-- Vue pour les utilisateurs non vérifiés
IF OBJECT_ID('VW_UtilisateursNonVerifies', 'V') IS NOT NULL
    DROP VIEW VW_UtilisateursNonVerifies;
GO

CREATE VIEW VW_UtilisateursNonVerifies AS
SELECT
    u.id,
    u.nom,
    u.prenom,
    u.email,
    u.telephone,
    u.date_creation,
    r.nom AS role_nom,
    DATEDIFF(DAY, u.date_creation, GETDATE()) AS jours_depuis_inscription
FROM Utilisateur u
JOIN Role r ON r.id = u.role_id
WHERE u.telephone_verifie = 0
  AND u.actif = 1;
GO

PRINT '✓ Vue VW_UtilisateursNonVerifies créée';

-- Vue pour les statistiques des rendez-vous par client
IF OBJECT_ID('VW_StatsClientRDV', 'V') IS NOT NULL
    DROP VIEW VW_StatsClientRDV;
GO

CREATE VIEW VW_StatsClientRDV AS
SELECT
    c.id AS client_id,
    c.nom + ' ' + c.prenom AS client_nom,
    c.email,
    c.telephone,
    COUNT(r.id) AS total_rdv,
    SUM(CASE WHEN r.statut = 'TERMINE' THEN 1 ELSE 0 END) AS rdv_termines,
    SUM(CASE WHEN r.statut = 'ANNULE' THEN 1 ELSE 0 END) AS rdv_annules,
    SUM(CASE WHEN r.statut = 'NO_SHOW' THEN 1 ELSE 0 END) AS rdv_no_show,
    MAX(r.date_heure) AS dernier_rdv,
    AVG(CAST(r.feedback_note AS FLOAT)) AS note_moyenne
FROM Utilisateur c
LEFT JOIN RendezVous r ON r.client_id = c.id
WHERE c.role_id = (SELECT id FROM Role WHERE nom = 'CLIENT')
GROUP BY c.id, c.nom, c.prenom, c.email, c.telephone;
GO

PRINT '✓ Vue VW_StatsClientRDV créée';
GO

-- ============================================================
-- ÉTAPE 8: Créer des procédures stockées utiles
-- ============================================================
PRINT '';
PRINT 'ÉTAPE 8: Création de procédures stockées';

-- Procédure pour valider un véhicule
IF OBJECT_ID('SP_ValiderVehicule', 'P') IS NOT NULL
    DROP PROCEDURE SP_ValiderVehicule;
GO

CREATE PROCEDURE SP_ValiderVehicule
    @vehicule_id BIGINT,
    @agent_id BIGINT,
    @statut VARCHAR(20), -- 'VALIDE' ou 'REFUSE'
    @commentaire NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Vérifier que le statut est valide
    IF @statut NOT IN ('VALIDE', 'REFUSE')
    BEGIN
        RAISERROR('Statut invalide. Utilisez VALIDE ou REFUSE', 16, 1);
        RETURN;
    END
    
    -- Vérifier que le véhicule existe
    IF NOT EXISTS (SELECT 1 FROM Vehicule WHERE id = @vehicule_id)
    BEGIN
        RAISERROR('Véhicule introuvable', 16, 1);
        RETURN;
    END
    
    -- Vérifier que l'agent existe et est bien un agent
    IF NOT EXISTS (
        SELECT 1 FROM Utilisateur u
        JOIN Role r ON r.id = u.role_id
        WHERE u.id = @agent_id AND r.nom IN ('AGENT', 'ADMIN')
    )
    BEGIN
        RAISERROR('Agent invalide', 16, 1);
        RETURN;
    END
    
    -- Mettre à jour le véhicule
    UPDATE Vehicule
    SET statut_validation = @statut,
        date_validation = GETDATE(),
        agent_validation_id = @agent_id
    WHERE id = @vehicule_id;
    
    -- Créer une notification pour le client
    DECLARE @client_id BIGINT;
    DECLARE @titre NVARCHAR(200);
    DECLARE @message NVARCHAR(MAX);
    
    SELECT @client_id = client_id FROM Vehicule WHERE id = @vehicule_id;
    
    IF @statut = 'VALIDE'
    BEGIN
        SET @titre = N'Véhicule validé';
        SET @message = N'Votre véhicule a été validé par un agent SAV. Vous pouvez maintenant prendre des rendez-vous.';
    END
    ELSE
    BEGIN
        SET @titre = N'Véhicule refusé';
        SET @message = N'Votre véhicule n''a pas pu être validé. ' + ISNULL(@commentaire, N'Veuillez contacter le service client.');
    END
    
    INSERT INTO Notification (utilisateur_id, titre, message, lu, type, entite_type, entite_id, date_envoi)
    VALUES (@client_id, @titre, @message, 0, 'PUSH', 'VEHICULE', @vehicule_id, GETDATE());
    
    PRINT '✓ Véhicule ' + CAST(@vehicule_id AS VARCHAR) + ' ' + @statut;
END
GO

PRINT '✓ Procédure SP_ValiderVehicule créée';
GO

-- ============================================================
-- ÉTAPE 9: Statistiques finales
-- ============================================================
PRINT '';
PRINT '========================================';
PRINT 'STATISTIQUES FINALES';
PRINT '========================================';

PRINT 'Total utilisateurs: ' + CAST((SELECT COUNT(*) FROM Utilisateur) AS VARCHAR);
PRINT 'Utilisateurs non vérifiés: ' + CAST((SELECT COUNT(*) FROM Utilisateur WHERE telephone_verifie = 0) AS VARCHAR);
PRINT 'Total véhicules: ' + CAST((SELECT COUNT(*) FROM Vehicule) AS VARCHAR);
PRINT 'Véhicules en attente: ' + CAST((SELECT COUNT(*) FROM Vehicule WHERE statut_validation = 'EN_ATTENTE') AS VARCHAR);
PRINT 'Total rendez-vous: ' + CAST((SELECT COUNT(*) FROM RendezVous) AS VARCHAR);
PRINT 'Total réclamations: ' + CAST((SELECT COUNT(*) FROM Reclamation) AS VARCHAR);

PRINT '';
PRINT '========================================';
PRINT 'MIGRATION TERMINÉE AVEC SUCCÈS';
PRINT '========================================';
GO
