-- ============================================================================
-- Script SQL pour ajouter des ouvriers d'exemple
-- Système STA (Station Technique Automobile)
-- ============================================================================

-- Vérifier que les agences existent
IF NOT EXISTS (SELECT 1 FROM Agence WHERE id = 1)
BEGIN
    PRINT 'ERREUR: Agence avec ID 1 n''existe pas. Veuillez d''abord créer les agences.'
    RETURN
END

-- ============================================================================
-- INSERTION DES OUVRIERS
-- ============================================================================

PRINT 'Insertion des ouvriers d''exemple...'

-- Ouvriers pour STA Tunis Nord (agence_id = 1)
INSERT INTO Ouvrier (
    nom, prenom, telephone, email, specialite, 
    niveau_competence, agence_id, date_embauche, notes, actif
) VALUES 
-- Mécaniciens
('Ben Ali', 'Ahmed', '+21698123456', 'ahmed.benali@sta-tunis.tn', 'Mécanique Générale', 'Expert', 1, '2020-03-15', 'Spécialiste moteur et transmission. 15 ans d''expérience.', 1),
('Trabelsi', 'Mohamed', '+21697234567', 'mohamed.trabelsi@sta-tunis.tn', 'Mécanique Générale', 'Intermédiaire', 1, '2022-01-10', 'Bon technicien polyvalent.', 1),
('Karray', 'Slim', '+21696345678', 'slim.karray@sta-tunis.tn', 'Mécanique Générale', 'Débutant', 1, '2023-09-01', 'Jeune diplômé, très motivé.', 1),

-- Électriciens
('Sassi', 'Karim', '+21695456789', 'karim.sassi@sta-tunis.tn', 'Électricité Automobile', 'Expert', 1, '2019-06-20', 'Expert en diagnostic électronique et systèmes embarqués.', 1),
('Mejri', 'Nabil', '+21694567890', 'nabil.mejri@sta-tunis.tn', 'Électricité Automobile', 'Intermédiaire', 1, '2021-11-05', 'Spécialisé dans les systèmes d''éclairage et climatisation.', 1),

-- Carrossiers
('Bouaziz', 'Hedi', '+21693678901', 'hedi.bouaziz@sta-tunis.tn', 'Carrosserie', 'Expert', 1, '2018-02-14', 'Maître carrossier, expert en peinture et redressage.', 1),
('Gharbi', 'Sami', '+21692789012', 'sami.gharbi@sta-tunis.tn', 'Carrosserie', 'Intermédiaire', 1, '2022-07-18', 'Bon niveau en réparation et préparation.', 1),

-- Spécialistes pneumatiques
('Jemli', 'Farid', '+21691890123', 'farid.jemli@sta-tunis.tn', 'Pneumatiques', 'Intermédiaire', 1, '2021-04-12', 'Spécialiste montage, équilibrage et géométrie.', 1),

-- Diagnosticien
('Hamdi', 'Youssef', '+21690901234', 'youssef.hamdi@sta-tunis.tn', 'Diagnostic Électronique', 'Expert', 1, '2020-08-30', 'Expert en diagnostic OBD et systèmes complexes.', 1),

-- Mécanicien polyvalent
('Cherni', 'Riadh', '+21689012345', 'riadh.cherni@sta-tunis.tn', 'Maintenance Préventive', 'Intermédiaire', 1, '2022-03-22', 'Spécialisé en révisions et entretien périodique.', 1);

-- Ouvriers pour STA Tunis Sud (agence_id = 2) - si elle existe
IF EXISTS (SELECT 1 FROM Agence WHERE id = 2)
BEGIN
    INSERT INTO Ouvrier (
        nom, prenom, telephone, email, specialite, 
        niveau_competence, agence_id, date_embauche, notes, actif
    ) VALUES 
    ('Mansouri', 'Tarek', '+21688123456', 'tarek.mansouri@sta-sud.tn', 'Mécanique Générale', 'Expert', 2, '2019-01-15', 'Chef d''équipe mécanique.', 1),
    ('Brahim', 'Salah', '+21687234567', 'salah.brahim@sta-sud.tn', 'Électricité Automobile', 'Intermédiaire', 2, '2021-05-10', 'Technicien électricien automobile.', 1),
    ('Ouali', 'Mondher', '+21686345678', 'mondher.ouali@sta-sud.tn', 'Carrosserie', 'Expert', 2, '2020-09-01', 'Spécialiste carrosserie et peinture.', 1),
    ('Rekik', 'Amine', '+21685456789', 'amine.rekik@sta-sud.tn', 'Pneumatiques', 'Débutant', 2, '2023-02-15', 'Apprenti pneumatiques.', 1),
    ('Zouari', 'Hafedh', '+21684567890', 'hafedh.zouari@sta-sud.tn', 'Diagnostic Électronique', 'Intermédiaire', 2, '2022-06-20', 'Technicien diagnostic.', 1);
END

-- Ouvriers pour STA Sfax (agence_id = 3) - si elle existe
IF EXISTS (SELECT 1 FROM Agence WHERE id = 3)
BEGIN
    INSERT INTO Ouvrier (
        nom, prenom, telephone, email, specialite, 
        niveau_competence, agence_id, date_embauche, notes, actif
    ) VALUES 
    ('Dridi', 'Belgacem', '+21674123456', 'belgacem.dridi@sta-sfax.tn', 'Mécanique Générale', 'Expert', 3, '2017-03-10', 'Responsable atelier mécanique Sfax.', 1),
    ('Ayari', 'Fethi', '+21674234567', 'fethi.ayari@sta-sfax.tn', 'Électricité Automobile', 'Expert', 3, '2018-07-22', 'Expert systèmes électroniques.', 1),
    ('Sellami', 'Khaled', '+21674345678', 'khaled.sellami@sta-sfax.tn', 'Carrosserie', 'Intermédiaire', 3, '2021-12-05', 'Carrossier expérimenté.', 1),
    ('Nasri', 'Walid', '+21674456789', 'walid.nasri@sta-sfax.tn', 'Maintenance Préventive', 'Intermédiaire', 3, '2022-04-18', 'Spécialiste entretien véhicules.', 1);
END

-- Ouvriers pour STA Sousse (agence_id = 4) - si elle existe
IF EXISTS (SELECT 1 FROM Agence WHERE id = 4)
BEGIN
    INSERT INTO Ouvrier (
        nom, prenom, telephone, email, specialite, 
        niveau_competence, agence_id, date_embauche, notes, actif
    ) VALUES 
    ('Mahfoudh', 'Ridha', '+21673123456', 'ridha.mahfoudh@sta-sousse.tn', 'Mécanique Générale', 'Expert', 4, '2019-05-12', 'Chef mécanicien Sousse.', 1),
    ('Chaabane', 'Lotfi', '+21673234567', 'lotfi.chaabane@sta-sousse.tn', 'Électricité Automobile', 'Intermédiaire', 4, '2020-10-08', 'Électricien automobile.', 1),
    ('Hammami', 'Nizar', '+21673345678', 'nizar.hammami@sta-sousse.tn', 'Pneumatiques', 'Expert', 4, '2018-12-15', 'Expert pneumatiques et géométrie.', 1);
END

-- ============================================================================
-- AJOUT DE COMPÉTENCES SPÉCIFIQUES (Optionnel)
-- ============================================================================

PRINT 'Ajout des compétences spécifiques...'

-- Vérifier si les tables CompetenceOuvrier et TypeIntervention existent
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'CompetenceOuvrier') 
   AND EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'TypeIntervention')
BEGIN
    -- Vérifier s'il y a des types d'intervention disponibles
    IF EXISTS (SELECT 1 FROM TypeIntervention)
    BEGIN
        -- Compétences pour Ahmed Ben Ali (Mécanicien Expert)
        DECLARE @ahmed_id BIGINT = (SELECT TOP 1 id FROM Ouvrier WHERE nom = 'Ben Ali' AND prenom = 'Ahmed')
        DECLARE @type_mecanique BIGINT = (SELECT TOP 1 id FROM TypeIntervention WHERE nom LIKE '%mécanique%' OR nom LIKE '%moteur%')
        
        IF @ahmed_id IS NOT NULL AND @type_mecanique IS NOT NULL
        BEGIN
            INSERT INTO CompetenceOuvrier (ouvrier_id, type_intervention_id, niveau_maitrise, certifie, date_certification)
            VALUES (@ahmed_id, @type_mecanique, 5, 1, '2021-06-15')
        END

        -- Compétences pour Karim Sassi (Électricien Expert)
        DECLARE @karim_id BIGINT = (SELECT TOP 1 id FROM Ouvrier WHERE nom = 'Sassi' AND prenom = 'Karim')
        DECLARE @type_electrique BIGINT = (SELECT TOP 1 id FROM TypeIntervention WHERE nom LIKE '%électr%' OR nom LIKE '%diagnostic%')
        
        IF @karim_id IS NOT NULL AND @type_electrique IS NOT NULL
        BEGIN
            INSERT INTO CompetenceOuvrier (ouvrier_id, type_intervention_id, niveau_maitrise, certifie, date_certification)
            VALUES (@karim_id, @type_electrique, 5, 1, '2020-11-25')
        END
        
        PRINT 'Compétences ajoutées avec succès'
    END
    ELSE
    BEGIN
        PRINT 'Aucun type d''intervention trouvé - compétences non ajoutées'
    END
END
ELSE
BEGIN
    PRINT 'Tables CompetenceOuvrier ou TypeIntervention non trouvées - compétences non ajoutées'
END

-- ============================================================================
-- AJOUT DE DISPONIBILITÉS (Optionnel)
-- ============================================================================

PRINT 'Configuration des disponibilités par défaut...'

-- Vérifier si la table DisponibiliteOuvrier existe
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'DisponibiliteOuvrier')
BEGIN
    -- Ajouter des disponibilités pour les 7 prochains jours pour tous les ouvriers actifs
    DECLARE @date_debut DATE = CAST(GETDATE() AS DATE)
    DECLARE @i INT = 0
    
    WHILE @i < 7
    BEGIN
        DECLARE @date_courante DATE = DATEADD(DAY, @i, @date_debut)
        
        -- Ajouter disponibilité 8h-17h pour tous les ouvriers actifs (sauf weekend)
        IF DATEPART(WEEKDAY, @date_courante) NOT IN (1, 7) -- Pas dimanche (1) ni samedi (7)
        BEGIN
            INSERT INTO DisponibiliteOuvrier (ouvrier_id, date, heure_debut, heure_fin, disponible)
            SELECT 
                o.id,
                @date_courante,
                '08:00:00',
                '17:00:00',
                1
            FROM Ouvrier o
            WHERE o.actif = 1
            AND NOT EXISTS (
                SELECT 1 FROM DisponibiliteOuvrier d 
                WHERE d.ouvrier_id = o.id AND d.date = @date_courante
            )
        END
        
        SET @i = @i + 1
    END
    
    PRINT 'Disponibilités ajoutées pour les 7 prochains jours'
END
ELSE
BEGIN
    PRINT 'Table DisponibiliteOuvrier non trouvée - disponibilités non ajoutées'
END

-- ============================================================================
-- VÉRIFICATION ET RÉSUMÉ
-- ============================================================================

PRINT ''
PRINT '============================================================================'
PRINT 'RÉSUMÉ DE L''INSERTION'
PRINT '============================================================================'

-- Compter les ouvriers par agence
SELECT 
    a.nom AS 'Agence',
    COUNT(o.id) AS 'Nombre d''ouvriers',
    SUM(CASE WHEN o.actif = 1 THEN 1 ELSE 0 END) AS 'Actifs',
    SUM(CASE WHEN o.actif = 0 THEN 1 ELSE 0 END) AS 'Inactifs'
FROM Agence a
LEFT JOIN Ouvrier o ON a.id = o.agence_id
GROUP BY a.id, a.nom
ORDER BY a.id

PRINT ''
PRINT 'Répartition par spécialité:'

-- Compter par spécialité
SELECT 
    ISNULL(specialite, 'Non spécifiée') AS 'Spécialité',
    COUNT(*) AS 'Nombre',
    COUNT(CASE WHEN actif = 1 THEN 1 END) AS 'Actifs'
FROM Ouvrier
GROUP BY specialite
ORDER BY COUNT(*) DESC

PRINT ''
PRINT 'Répartition par niveau de compétence:'

-- Compter par niveau
SELECT 
    ISNULL(niveau_competence, 'Non spécifié') AS 'Niveau',
    COUNT(*) AS 'Nombre'
FROM Ouvrier
WHERE actif = 1
GROUP BY niveau_competence
ORDER BY 
    CASE niveau_competence 
        WHEN 'Expert' THEN 1 
        WHEN 'Intermédiaire' THEN 2 
        WHEN 'Débutant' THEN 3 
        ELSE 4 
    END

PRINT ''
PRINT '✅ Insertion des ouvriers terminée avec succès!'
PRINT ''
PRINT 'Notes importantes:'
PRINT '- Tous les ouvriers sont créés avec le statut ACTIF'
PRINT '- Les emails utilisent des domaines fictifs (@sta-*.tn)'
PRINT '- Les numéros de téléphone sont fictifs mais au format tunisien'
PRINT '- Les dates d''embauche sont réalistes (2017-2023)'
PRINT '- Chaque agence a une équipe équilibrée avec différentes spécialités'
PRINT ''
PRINT 'Vous pouvez maintenant:'
PRINT '1. Tester l''interface admin pour voir les ouvriers'
PRINT '2. Tester l''affectation d''ouvriers aux rendez-vous'
PRINT '3. Modifier les informations via l''interface CRUD'
PRINT '============================================================================'