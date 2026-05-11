-- ================================================================
-- Script: Ajouter des Données de Test pour les Statistiques Direction (CORRIGÉ)
-- Description: Remplit les tables avec des données réalistes pour tester les graphiques
-- Date: 11 mai 2026
-- Version: 2.0 (Corrigée)
-- ================================================================

USE STA_SAV_DB;
GO

PRINT '🚀 Début de l''ajout des données de test (version corrigée)...';
PRINT '';

-- ================================================================
-- ÉTAPE 1: Mettre à jour les rendez-vous avec des heures réelles
-- ================================================================
PRINT '📅 ÉTAPE 1: Mise à jour des heures réelles des rendez-vous...';

UPDATE RendezVous
SET 
    heure_reelle_debut = DATEADD(MINUTE, -FLOOR(RAND(CHECKSUM(NEWID())) * 30), date_heure),
    heure_reelle_fin = DATEADD(MINUTE, 30 + FLOOR(RAND(CHECKSUM(NEWID())) * 90), date_heure)
WHERE statut = 'TERMINE'
  AND heure_reelle_debut IS NULL;

DECLARE @rdv_updated INT = @@ROWCOUNT;
PRINT '   ✅ ' + CAST(@rdv_updated AS VARCHAR) + ' rendez-vous mis à jour avec heures réelles';
PRINT '';

-- ================================================================
-- ÉTAPE 2: Ajouter des feedbacks pour les rendez-vous terminés
-- ================================================================
PRINT '⭐ ÉTAPE 2: Création des feedbacks...';

DECLARE @rdv_id BIGINT;
DECLARE @date_rdv DATETIME;
DECLARE @note INT;
DECLARE @commentaire NVARCHAR(500);
DECLARE @feedback_count INT = 0;

DECLARE rdv_cursor CURSOR FOR
SELECT TOP 100 id, date_heure
FROM RendezVous 
WHERE statut = 'TERMINE' 
  AND id NOT IN (SELECT appointment_id FROM Feedback WHERE appointment_id IS NOT NULL)
ORDER BY NEWID();

OPEN rdv_cursor;
FETCH NEXT FROM rdv_cursor INTO @rdv_id, @date_rdv;

WHILE @@FETCH_STATUS = 0
BEGIN
    -- Note aléatoire entre 2 et 5 (pondérée vers le haut)
    DECLARE @rand FLOAT = RAND(CHECKSUM(NEWID()));
    
    IF @rand < 0.6
        SET @note = 5;  -- 60% de notes excellentes
    ELSE IF @rand < 0.85
        SET @note = 4;  -- 25% de bonnes notes
    ELSE IF @rand < 0.95
        SET @note = 3;  -- 10% de notes moyennes
    ELSE
        SET @note = 2;  -- 5% de notes faibles
    
    -- Commentaire selon la note
    SET @commentaire = CASE @note
        WHEN 5 THEN CASE FLOOR(RAND(CHECKSUM(NEWID())) * 5)
            WHEN 0 THEN 'Excellent service, très professionnel et rapide!'
            WHEN 1 THEN 'Parfait! Agent très compétent et à l''écoute.'
            WHEN 2 THEN 'Service impeccable, je recommande vivement.'
            WHEN 3 THEN 'Très satisfait de la qualité du service.'
            ELSE 'Équipe formidable, travail de qualité.'
        END
        WHEN 4 THEN CASE FLOOR(RAND(CHECKSUM(NEWID())) * 5)
            WHEN 0 THEN 'Bon service, quelques petites améliorations possibles.'
            WHEN 1 THEN 'Satisfait dans l''ensemble, bon travail.'
            WHEN 2 THEN 'Service correct, agent sympathique.'
            WHEN 3 THEN 'Bien, mais l''attente était un peu longue.'
            ELSE 'Bon accueil et service de qualité.'
        END
        WHEN 3 THEN CASE FLOOR(RAND(CHECKSUM(NEWID())) * 3)
            WHEN 0 THEN 'Service correct mais peut mieux faire.'
            WHEN 1 THEN 'Moyen, quelques problèmes de communication.'
            ELSE 'Acceptable, mais j''attendais mieux.'
        END
        ELSE CASE FLOOR(RAND(CHECKSUM(NEWID())) * 3)
            WHEN 0 THEN 'Déçu par le service, trop d''attente.'
            WHEN 1 THEN 'Pas satisfait, problème non résolu.'
            ELSE 'Service à améliorer, manque de professionnalisme.'
        END
    END;
    
    -- Insérer le feedback (SANS client_id car la colonne n'existe pas)
    INSERT INTO Feedback (
        appointment_id,
        note,
        commentaire,
        date_feedback
    ) VALUES (
        @rdv_id,
        @note,
        @commentaire,
        DATEADD(DAY, 1 + FLOOR(RAND(CHECKSUM(NEWID())) * 3), @date_rdv)
    );
    
    SET @feedback_count = @feedback_count + 1;
    
    FETCH NEXT FROM rdv_cursor INTO @rdv_id, @date_rdv;
END;

CLOSE rdv_cursor;
DEALLOCATE rdv_cursor;

PRINT '   ✅ ' + CAST(@feedback_count AS VARCHAR) + ' feedbacks créés';
PRINT '';

-- ================================================================
-- ÉTAPE 3: Créer des factures pour les commandes sans facture
-- ================================================================
PRINT '💰 ÉTAPE 3: Création des factures...';

-- Compter les commandes sans facture
DECLARE @commandes_sans_facture INT;
SELECT @commandes_sans_facture = COUNT(*)
FROM CommandeReparation c
WHERE c.id NOT IN (SELECT commande_id FROM Facture WHERE commande_id IS NOT NULL)
  AND c.montant_total > 0;

PRINT '   📊 ' + CAST(@commandes_sans_facture AS VARCHAR) + ' commandes sans facture trouvées';

-- Créer les factures
IF @commandes_sans_facture > 0
BEGIN
    -- Obtenir le dernier numéro de facture
    DECLARE @last_numero INT = 0;
    SELECT @last_numero = ISNULL(MAX(CAST(SUBSTRING(numero, 6, 5) AS INT)), 0)
    FROM Facture
    WHERE numero LIKE 'FACT-%';

    INSERT INTO Facture (
        commande_id,
        numero,
        date_emission,
        montant_ht,
        taux_tva,
        montant_ttc,
        statut,
        mode_paiement,
        date_paiement
    )
    SELECT 
        c.id,
        'FACT-' + RIGHT('00000' + CAST(@last_numero + ROW_NUMBER() OVER (ORDER BY c.id) AS VARCHAR), 5),
        DATEADD(DAY, 1, c.date_creation),
        ROUND(c.montant_total / 1.19, 2),
        19.00,
        c.montant_total,
        -- 70% payées, 20% émises, 10% envoyées
        CASE 
            WHEN (CAST(c.id AS FLOAT) / 10) - FLOOR(CAST(c.id AS FLOAT) / 10) < 0.7 THEN 'PAYEE'
            WHEN (CAST(c.id AS FLOAT) / 10) - FLOOR(CAST(c.id AS FLOAT) / 10) < 0.9 THEN 'EMISE'
            ELSE 'ENVOYEE'
        END,
        -- Modes de paiement variés
        CASE 
            WHEN (CAST(c.id AS FLOAT) / 7) - FLOOR(CAST(c.id AS FLOAT) / 7) < 0.4 THEN 'ESPECES'
            WHEN (CAST(c.id AS FLOAT) / 7) - FLOOR(CAST(c.id AS FLOAT) / 7) < 0.7 THEN 'CARTE_BANCAIRE'
            WHEN (CAST(c.id AS FLOAT) / 7) - FLOOR(CAST(c.id AS FLOAT) / 7) < 0.9 THEN 'VIREMENT'
            ELSE 'CHEQUE'
        END,
        -- Date de paiement si payée
        CASE 
            WHEN (CAST(c.id AS FLOAT) / 10) - FLOOR(CAST(c.id AS FLOAT) / 10) < 0.7 
            THEN DATEADD(DAY, 2 + FLOOR((CAST(c.id AS FLOAT) / 13) * 10), c.date_creation)
            ELSE NULL
        END
    FROM CommandeReparation c
    WHERE c.id NOT IN (SELECT commande_id FROM Facture WHERE commande_id IS NOT NULL)
      AND c.montant_total > 0;

    DECLARE @factures_created INT = @@ROWCOUNT;
    PRINT '   ✅ ' + CAST(@factures_created AS VARCHAR) + ' factures créées';
END
ELSE
BEGIN
    PRINT '   ℹ️  Aucune commande sans facture';
END

PRINT '';

-- ================================================================
-- ÉTAPE 4: Créer quelques réclamations pour tester (OPTIONNEL)
-- ================================================================
PRINT '📢 ÉTAPE 4: Création de réclamations de test (optionnel)...';

-- Vérifier d'abord si la table Reclamation existe et sa structure
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Reclamation')
BEGIN
    -- Vérifier si la colonne 'type' existe
    IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Reclamation' AND COLUMN_NAME = 'type')
    BEGIN
        DECLARE @existing_complaints INT;
        SELECT @existing_complaints = COUNT(*) FROM Reclamation;

        IF @existing_complaints < 10
        BEGIN
            DECLARE @rdv_for_complaint BIGINT;
            DECLARE @complaint_count INT = 0;
            DECLARE @max_complaints INT = 15;

            DECLARE complaint_cursor CURSOR FOR
            SELECT TOP 15 r.id
            FROM RendezVous r
            LEFT JOIN Reclamation rec ON rec.appointment_id = r.id
            WHERE r.statut IN ('TERMINE', 'ANNULE')
              AND rec.id IS NULL
            ORDER BY NEWID();

            OPEN complaint_cursor;
            FETCH NEXT FROM complaint_cursor INTO @rdv_for_complaint;

            WHILE @@FETCH_STATUS = 0 AND @complaint_count < @max_complaints
            BEGIN
                DECLARE @complaint_type NVARCHAR(50);
                DECLARE @complaint_desc NVARCHAR(MAX);
                DECLARE @complaint_status NVARCHAR(20);
                DECLARE @rand_complaint FLOAT = RAND(CHECKSUM(NEWID()));

                -- Type de réclamation
                IF @rand_complaint < 0.3
                    SET @complaint_type = 'DELAI';
                ELSE IF @rand_complaint < 0.5
                    SET @complaint_type = 'QUALITE';
                ELSE IF @rand_complaint < 0.7
                    SET @complaint_type = 'PRIX';
                ELSE
                    SET @complaint_type = 'AUTRE';

                -- Description selon le type
                SET @complaint_desc = CASE @complaint_type
                    WHEN 'DELAI' THEN 'Délai d''attente trop long, rendez-vous non respecté.'
                    WHEN 'QUALITE' THEN 'Qualité du service insatisfaisante, problème non résolu.'
                    WHEN 'PRIX' THEN 'Facturation incorrecte, prix plus élevé que prévu.'
                    ELSE 'Problème de communication avec l''agent.'
                END;

                -- Statut (70% résolues, 20% en cours, 10% nouvelles)
                IF @rand_complaint < 0.7
                    SET @complaint_status = 'RESOLU';
                ELSE IF @rand_complaint < 0.9
                    SET @complaint_status = 'EN_COURS';
                ELSE
                    SET @complaint_status = 'NOUVEAU';

                -- Insérer la réclamation
                INSERT INTO Reclamation (
                    numero,
                    appointment_id,
                    type,
                    description,
                    statut,
                    date_soumission,
                    date_cloture
                ) VALUES (
                    'REC-' + RIGHT('00000' + CAST(@existing_complaints + @complaint_count + 1 AS VARCHAR), 5),
                    @rdv_for_complaint,
                    @complaint_type,
                    @complaint_desc,
                    @complaint_status,
                    DATEADD(DAY, -FLOOR(RAND(CHECKSUM(NEWID())) * 30), GETDATE()),
                    CASE WHEN @complaint_status = 'RESOLU' 
                        THEN DATEADD(DAY, -FLOOR(RAND(CHECKSUM(NEWID())) * 10), GETDATE())
                        ELSE NULL 
                    END
                );

                SET @complaint_count = @complaint_count + 1;
                FETCH NEXT FROM complaint_cursor INTO @rdv_for_complaint;
            END;

            CLOSE complaint_cursor;
            DEALLOCATE complaint_cursor;

            PRINT '   ✅ ' + CAST(@complaint_count AS VARCHAR) + ' réclamations créées';
        END
        ELSE
        BEGIN
            PRINT '   ℹ️  Réclamations déjà présentes (' + CAST(@existing_complaints AS VARCHAR) + ')';
        END
    END
    ELSE
    BEGIN
        PRINT '   ⚠️  La colonne ''type'' n''existe pas dans la table Reclamation';
        PRINT '   ℹ️  Création de réclamations ignorée';
    END
END
ELSE
BEGIN
    PRINT '   ⚠️  La table Reclamation n''existe pas';
    PRINT '   ℹ️  Création de réclamations ignorée';
END

PRINT '';

-- ================================================================
-- ÉTAPE 5: Vérification finale
-- ================================================================
PRINT '🔍 ÉTAPE 5: Vérification des données...';
PRINT '';

-- Statistiques finales
DECLARE @total_rdv INT, @rdv_avec_duree INT;
DECLARE @total_feedbacks INT, @rdv_avec_feedback INT;
DECLARE @total_factures INT, @factures_payees INT;
DECLARE @agents_avec_feedbacks INT;

SELECT 
    @total_rdv = COUNT(*),
    @rdv_avec_duree = SUM(CASE WHEN heure_reelle_debut IS NOT NULL AND heure_reelle_fin IS NOT NULL THEN 1 ELSE 0 END)
FROM RendezVous;

SELECT 
    @total_feedbacks = COUNT(*),
    @rdv_avec_feedback = COUNT(DISTINCT appointment_id)
FROM Feedback;

SELECT 
    @total_factures = COUNT(*),
    @factures_payees = SUM(CASE WHEN statut = 'PAYEE' THEN 1 ELSE 0 END)
FROM Facture;

SELECT @agents_avec_feedbacks = COUNT(DISTINCT u.id)
FROM Utilisateur u
INNER JOIN RendezVous r ON r.agent_id = u.id
INNER JOIN Feedback f ON f.appointment_id = r.id
WHERE u.role_id = (SELECT id FROM Role WHERE nom = 'AGENT');

PRINT '📊 RÉSUMÉ DES DONNÉES:';
PRINT '   • Rendez-vous total: ' + CAST(@total_rdv AS VARCHAR);
PRINT '   • Rendez-vous avec durée: ' + CAST(@rdv_avec_duree AS VARCHAR) + ' (' + CAST(ROUND(CAST(@rdv_avec_duree AS FLOAT) / NULLIF(@total_rdv, 0) * 100, 1) AS VARCHAR) + '%)';
PRINT '   • Feedbacks total: ' + CAST(@total_feedbacks AS VARCHAR);
PRINT '   • RDV avec feedback: ' + CAST(@rdv_avec_feedback AS VARCHAR);
PRINT '   • Factures total: ' + CAST(@total_factures AS VARCHAR);
PRINT '   • Factures payées: ' + CAST(@factures_payees AS VARCHAR) + ' (' + CAST(ROUND(CAST(@factures_payees AS FLOAT) / NULLIF(@total_factures, 0) * 100, 1) AS VARCHAR) + '%)';
PRINT '   • Agents avec feedbacks: ' + CAST(@agents_avec_feedbacks AS VARCHAR);
PRINT '';

-- Vérifier si les données sont suffisantes
DECLARE @warnings INT = 0;

IF @rdv_avec_duree < 20
BEGIN
    PRINT '⚠️  AVERTISSEMENT: Peu de rendez-vous avec durée (' + CAST(@rdv_avec_duree AS VARCHAR) + ' < 20)';
    SET @warnings = @warnings + 1;
END

IF @total_feedbacks < 30
BEGIN
    PRINT '⚠️  AVERTISSEMENT: Peu de feedbacks (' + CAST(@total_feedbacks AS VARCHAR) + ' < 30)';
    SET @warnings = @warnings + 1;
END

IF @agents_avec_feedbacks < 5
BEGIN
    PRINT '⚠️  AVERTISSEMENT: Peu d''agents avec feedbacks (' + CAST(@agents_avec_feedbacks AS VARCHAR) + ' < 5)';
    SET @warnings = @warnings + 1;
END

IF @total_factures < 10
BEGIN
    PRINT '⚠️  AVERTISSEMENT: Peu de factures (' + CAST(@total_factures AS VARCHAR) + ' < 10)';
    SET @warnings = @warnings + 1;
END

PRINT '';

IF @warnings = 0
BEGIN
    PRINT '✅ SUCCÈS: Toutes les données sont suffisantes pour les graphiques!';
END
ELSE
BEGIN
    PRINT '⚠️  ' + CAST(@warnings AS VARCHAR) + ' avertissement(s) - Certains graphiques peuvent être vides';
    PRINT '   💡 Conseil: Créez plus de rendez-vous terminés dans l''application';
END

PRINT '';
PRINT '🎉 Script terminé avec succès!';
PRINT '';
PRINT '📝 PROCHAINES ÉTAPES:';
PRINT '   1. Redémarrer le backend (npm start)';
PRINT '   2. Rafraîchir les pages Direction dans le navigateur';
PRINT '   3. Vérifier que les graphiques affichent des données';
PRINT '';

GO
