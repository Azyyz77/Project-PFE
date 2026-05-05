-- ============================================
-- Script: Ajouter des Donnees de Test aux Tables Vides
-- Date: 3 Mai 2026
-- Description: Remplir les 7 tables vides (sauf sysdiagrams)
-- ============================================

USE STA_SAV_DB;
GO

PRINT 'Debut ajout donnees de test...';
PRINT '';

-- ============================================
-- 1. INTERVENTION CATALOG (8 interventions)
-- ============================================
PRINT '1. Ajout InterventionCatalog...';

INSERT INTO InterventionCatalog (nom, description, prix, duree_minutes, actif, date_creation)
VALUES 
    ('Vidange Moteur Complete', 'Vidange huile moteur avec remplacement filtre a huile', 150.00, 45, 1, GETDATE()),
    ('Revision Annuelle', 'Revision complete selon preconisations constructeur', 350.00, 120, 1, GETDATE()),
    ('Changement Plaquettes Frein', 'Remplacement plaquettes avant et arriere', 200.00, 60, 1, GETDATE()),
    ('Diagnostic Electronique', 'Diagnostic complet systeme electronique vehicule', 80.00, 30, 1, GETDATE()),
    ('Changement Pneus', 'Montage et equilibrage 4 pneus', 50.00, 40, 1, GETDATE()),
    ('Climatisation Recharge', 'Recharge gaz climatisation et verification', 120.00, 35, 1, GETDATE()),
    ('Geometrie et Parallalisme', 'Reglage geometrie et parallalisme 4 roues', 90.00, 50, 1, GETDATE()),
    ('Changement Batterie', 'Remplacement batterie avec test alternateur', 180.00, 25, 1, GETDATE());

PRINT 'InterventionCatalog: 8 lignes ajoutees';
PRINT '';

-- ============================================
-- 2. PROMOTION VEHICULE (5 promotions)
-- ============================================
PRINT '2. Ajout PromotionVehicule...';

DECLARE @AgenceId1 BIGINT = (SELECT TOP 1 id FROM Agence WHERE nom LIKE '%Tunis%');
DECLARE @AgenceId2 BIGINT = (SELECT TOP 1 id FROM Agence WHERE nom LIKE '%Sfax%');
DECLARE @MarqueChery BIGINT = (SELECT TOP 1 id FROM Marque WHERE nom = 'Chery');
DECLARE @ModeleId1 BIGINT = (SELECT TOP 1 id FROM Modele WHERE marque_id = @MarqueChery);

INSERT INTO PromotionVehicule (
    titre, description, reduction, type_reduction, 
    date_debut, date_fin, marque_id, modele_id, agence_id, 
    actif, conditions, image_url, priorite, date_creation
)
VALUES 
    (
        'Promotion Ete 2026', 
        'Reduction exceptionnelle de 5% sur tous les vehicules Chery',
        5.00, 'POURCENTAGE',
        GETDATE(), DATEADD(MONTH, 3, GETDATE()), 
        @MarqueChery, NULL, NULL,
        1, 'Valable pour tout achat avant fin juillet 2026', 
        '/images/promo-ete.jpg', 1, GETDATE()
    ),
    (
        'Offre Tiggo 8 Pro', 
        'Reduction de 3000 TND sur le modele Tiggo 8 Pro',
        3000.00, 'MONTANT',
        GETDATE(), DATEADD(MONTH, 2, GETDATE()), 
        @MarqueChery, @ModeleId1, NULL,
        1, 'Stock limite - Premier arrive premier servi', 
        '/images/tiggo8-promo.jpg', 2, GETDATE()
    ),
    (
        'Promo Agence Tunis', 
        'Offre speciale agence Tunis - 4% de reduction',
        4.00, 'POURCENTAGE',
        GETDATE(), DATEADD(MONTH, 1, GETDATE()), 
        @MarqueChery, NULL, @AgenceId1,
        1, 'Uniquement pour agence Tunis', 
        '/images/promo-tunis.jpg', 3, GETDATE()
    ),
    (
        'Pack Entretien Gratuit', 
        'Premiere revision gratuite pour tout achat',
        350.00, 'MONTANT',
        GETDATE(), DATEADD(MONTH, 6, GETDATE()), 
        @MarqueChery, NULL, NULL,
        1, 'Revision gratuite dans les 6 mois suivant achat', 
        '/images/pack-entretien.jpg', 4, GETDATE()
    ),
    (
        'Offre Fin de Serie', 
        'Reduction 8% sur modeles 2025',
        8.00, 'POURCENTAGE',
        GETDATE(), DATEADD(MONTH, 1, GETDATE()), 
        @MarqueChery, NULL, @AgenceId2,
        1, 'Modeles 2025 uniquement - Stock limite', 
        '/images/fin-serie.jpg', 5, GETDATE()
    );

PRINT 'PromotionVehicule: 5 lignes ajoutees';
PRINT '';

-- ============================================
-- 3. MESSAGE ACCUEIL (4 messages)
-- ============================================
PRINT '3. Ajout MessageAccueil...';

DECLARE @AdminId BIGINT = (SELECT TOP 1 id FROM Utilisateur WHERE role_id = (SELECT id FROM Role WHERE nom = 'ADMIN'));

INSERT INTO MessageAccueil (
    titre, contenu, type_message, cible_role, 
    date_debut, date_fin, actif, priorite, 
    afficher_popup, couleur_fond, icone, 
    auteur_id, date_creation, date_modification
)
VALUES 
    (
        'Bienvenue chez STA Chery Tunisia',
        '<h2>Bienvenue sur votre espace client!</h2><p>Gerez vos rendez-vous, suivez vos vehicules et contactez nos experts.</p>',
        'BIENVENUE', 'CLIENT',
        GETDATE(), NULL, 1, 1,
        1, '#4F46E5', 'welcome', 
        @AdminId, GETDATE(), GETDATE()
    ),
    (
        'Espace Agent - Tableau de Bord',
        '<h3>Bienvenue Agent!</h3><p>Consultez vos rendez-vous du jour et gerez les interventions.</p>',
        'BIENVENUE', 'AGENT',
        GETDATE(), NULL, 1, 1,
        0, '#10B981', 'dashboard', 
        @AdminId, GETDATE(), GETDATE()
    ),
    (
        'Nouvelle Fonctionnalite: Diagnostic en Ligne',
        '<h3>Nouveau!</h3><p>Vous pouvez maintenant demander un diagnostic en ligne avant votre rendez-vous.</p>',
        'INFORMATION', NULL,
        GETDATE(), DATEADD(MONTH, 1, GETDATE()), 1, 2,
        1, '#F59E0B', 'info', 
        @AdminId, GETDATE(), GETDATE()
    ),
    (
        'Maintenance Programmee',
        '<h3>Maintenance Systeme</h3><p>Une maintenance est prevue le 15 mai 2026 de 2h a 4h du matin.</p>',
        'ALERTE', NULL,
        DATEADD(DAY, 10, GETDATE()), DATEADD(DAY, 15, GETDATE()), 1, 3,
        1, '#EF4444', 'warning', 
        @AdminId, GETDATE(), GETDATE()
    );

PRINT 'MessageAccueil: 4 lignes ajoutees';
PRINT '';

-- ============================================
-- 4. FEEDBACK (10 feedbacks)
-- ============================================
PRINT '4. Ajout Feedback...';

DECLARE @RdvIds TABLE (id BIGINT);
INSERT INTO @RdvIds SELECT TOP 10 id FROM RendezVous WHERE statut_id = (SELECT id FROM StatutRDV WHERE nom = 'TERMINE') ORDER BY date_rdv DESC;

DECLARE @RdvId BIGINT;
DECLARE feedback_cursor CURSOR FOR SELECT id FROM @RdvIds;
OPEN feedback_cursor;
FETCH NEXT FROM feedback_cursor INTO @RdvId;

DECLARE @Counter INT = 1;
WHILE @@FETCH_STATUS = 0 AND @Counter <= 10
BEGIN
    INSERT INTO Feedback (rendez_vous_id, note, commentaire, date_creation)
    VALUES (
        @RdvId,
        CASE @Counter 
            WHEN 1 THEN 5
            WHEN 2 THEN 4
            WHEN 3 THEN 5
            WHEN 4 THEN 3
            WHEN 5 THEN 5
            WHEN 6 THEN 4
            WHEN 7 THEN 5
            WHEN 8 THEN 4
            WHEN 9 THEN 5
            WHEN 10 THEN 4
        END,
        CASE @Counter 
            WHEN 1 THEN 'Excellent service, equipe tres professionnelle!'
            WHEN 2 THEN 'Bon service mais un peu long'
            WHEN 3 THEN 'Parfait, je recommande vivement'
            WHEN 4 THEN 'Service correct mais peut mieux faire'
            WHEN 5 THEN 'Tres satisfait de la reparation'
            WHEN 6 THEN 'Bon accueil et travail soigne'
            WHEN 7 THEN 'Impeccable, rien a redire'
            WHEN 8 THEN 'Bien mais delai un peu long'
            WHEN 9 THEN 'Service de qualite, merci!'
            WHEN 10 THEN 'Satisfait du resultat'
        END,
        DATEADD(DAY, -@Counter, GETDATE())
    );
    
    SET @Counter = @Counter + 1;
    FETCH NEXT FROM feedback_cursor INTO @RdvId;
END;

CLOSE feedback_cursor;
DEALLOCATE feedback_cursor;

PRINT 'Feedback: 10 lignes ajoutees';
PRINT '';

-- ============================================
-- 5. HISTORIQUE RDV (15 entrees)
-- ============================================
PRINT '5. Ajout HistoriqueRDV...';

DECLARE @RdvForHistory TABLE (id BIGINT);
INSERT INTO @RdvForHistory SELECT TOP 5 id FROM RendezVous ORDER BY date_rdv DESC;

DECLARE @RdvHistId BIGINT;
DECLARE @AgentId BIGINT = (SELECT TOP 1 id FROM Utilisateur WHERE role_id = (SELECT id FROM Role WHERE nom = 'AGENT'));
DECLARE history_cursor CURSOR FOR SELECT id FROM @RdvForHistory;
OPEN history_cursor;
FETCH NEXT FROM history_cursor INTO @RdvHistId;

WHILE @@FETCH_STATUS = 0
BEGIN
    -- Creation du RDV
    INSERT INTO HistoriqueRDV (rendez_vous_id, ancien_statut, nouveau_statut, modifie_par, date_modification, commentaire)
    VALUES (
        @RdvHistId,
        NULL,
        'EN_ATTENTE',
        @AgentId,
        DATEADD(DAY, -5, GETDATE()),
        'Rendez-vous cree par le client'
    );
    
    -- Confirmation
    INSERT INTO HistoriqueRDV (rendez_vous_id, ancien_statut, nouveau_statut, modifie_par, date_modification, commentaire)
    VALUES (
        @RdvHistId,
        'EN_ATTENTE',
        'CONFIRME',
        @AgentId,
        DATEADD(DAY, -4, GETDATE()),
        'Rendez-vous confirme par agent'
    );
    
    -- En cours
    INSERT INTO HistoriqueRDV (rendez_vous_id, ancien_statut, nouveau_statut, modifie_par, date_modification, commentaire)
    VALUES (
        @RdvHistId,
        'CONFIRME',
        'EN_COURS',
        @AgentId,
        DATEADD(DAY, -3, GETDATE()),
        'Intervention demarree'
    );
    
    FETCH NEXT FROM history_cursor INTO @RdvHistId;
END;

CLOSE history_cursor;
DEALLOCATE history_cursor;

PRINT 'HistoriqueRDV: 15 lignes ajoutees';
PRINT '';

-- ============================================
-- 6. MESSAGE LECTURE (20 lectures)
-- ============================================
PRINT '6. Ajout MessageLecture...';

DECLARE @MessageIds TABLE (id BIGINT);
INSERT INTO @MessageIds SELECT id FROM MessageAccueil WHERE actif = 1;

DECLARE @UserIds TABLE (id BIGINT);
INSERT INTO @UserIds SELECT TOP 5 id FROM Utilisateur WHERE role_id = (SELECT id FROM Role WHERE nom = 'CLIENT');

DECLARE @MsgId BIGINT;
DECLARE @UsrId BIGINT;

DECLARE msg_cursor CURSOR FOR SELECT id FROM @MessageIds;
OPEN msg_cursor;
FETCH NEXT FROM msg_cursor INTO @MsgId;

WHILE @@FETCH_STATUS = 0
BEGIN
    DECLARE usr_cursor CURSOR FOR SELECT id FROM @UserIds;
    OPEN usr_cursor;
    FETCH NEXT FROM usr_cursor INTO @UsrId;
    
    WHILE @@FETCH_STATUS = 0
    BEGIN
        INSERT INTO MessageLecture (message_id, utilisateur_id, date_lecture)
        VALUES (@MsgId, @UsrId, DATEADD(HOUR, -FLOOR(RAND() * 48), GETDATE()));
        
        FETCH NEXT FROM usr_cursor INTO @UsrId;
    END;
    
    CLOSE usr_cursor;
    DEALLOCATE usr_cursor;
    
    FETCH NEXT FROM msg_cursor INTO @MsgId;
END;

CLOSE msg_cursor;
DEALLOCATE msg_cursor;

PRINT 'MessageLecture: 20 lignes ajoutees';
PRINT '';

-- ============================================
-- 7. AUDIT LOG (25 entrees)
-- ============================================
PRINT '7. Ajout AuditLog...';

DECLARE @AuditUserId BIGINT = (SELECT TOP 1 id FROM Utilisateur WHERE role_id = (SELECT id FROM Role WHERE nom = 'ADMIN'));
DECLARE @AuditAgentId BIGINT = (SELECT TOP 1 id FROM Utilisateur WHERE role_id = (SELECT id FROM Role WHERE nom = 'AGENT'));
DECLARE @AuditClientId BIGINT = (SELECT TOP 1 id FROM Utilisateur WHERE role_id = (SELECT id FROM Role WHERE nom = 'CLIENT'));

INSERT INTO AuditLog (
    utilisateur_id, action, entite_type, entite_id, 
    anciennes_valeurs, nouvelles_valeurs, ip_address, 
    user_agent, statut, message_erreur, duree_ms, date_action
)
VALUES 
    (@AuditUserId, 'CREATE', 'Utilisateur', @AuditClientId, NULL, '{"nom":"Client Test"}', '192.168.1.100', 'Mozilla/5.0', 'SUCCESS', NULL, 150, DATEADD(DAY, -10, GETDATE())),
    (@AuditAgentId, 'UPDATE', 'RendezVous', 1, '{"statut":"EN_ATTENTE"}', '{"statut":"CONFIRME"}', '192.168.1.101', 'Mozilla/5.0', 'SUCCESS', NULL, 200, DATEADD(DAY, -9, GETDATE())),
    (@AuditUserId, 'DELETE', 'Promotion', 1, '{"titre":"Ancienne promo"}', NULL, '192.168.1.100', 'Mozilla/5.0', 'SUCCESS', NULL, 100, DATEADD(DAY, -8, GETDATE())),
    (@AuditClientId, 'CREATE', 'Vehicule', 1, NULL, '{"immatriculation":"123TU456"}', '192.168.1.102', 'Mozilla/5.0', 'SUCCESS', NULL, 180, DATEADD(DAY, -7, GETDATE())),
    (@AuditAgentId, 'UPDATE', 'Diagnostic', 1, '{"etat":"EN_COURS"}', '{"etat":"TERMINE"}', '192.168.1.101', 'Mozilla/5.0', 'SUCCESS', NULL, 220, DATEADD(DAY, -6, GETDATE())),
    (@AuditUserId, 'CREATE', 'Agence', 1, NULL, '{"nom":"Nouvelle Agence"}', '192.168.1.100', 'Mozilla/5.0', 'SUCCESS', NULL, 130, DATEADD(DAY, -5, GETDATE())),
    (@AuditClientId, 'UPDATE', 'Utilisateur', @AuditClientId, '{"telephone":"12345"}', '{"telephone":"98765"}', '192.168.1.102', 'Mozilla/5.0', 'SUCCESS', NULL, 90, DATEADD(DAY, -4, GETDATE())),
    (@AuditAgentId, 'CREATE', 'InterventionRDV', 1, NULL, '{"type":"Vidange"}', '192.168.1.101', 'Mozilla/5.0', 'SUCCESS', NULL, 170, DATEADD(DAY, -3, GETDATE())),
    (@AuditUserId, 'DELETE', 'Ouvrier', 1, '{"nom":"Ancien Ouvrier"}', NULL, '192.168.1.100', 'Mozilla/5.0', 'SUCCESS', NULL, 110, DATEADD(DAY, -2, GETDATE())),
    (@AuditClientId, 'CREATE', 'Reclamation', 1, NULL, '{"sujet":"Probleme"}', '192.168.1.102', 'Mozilla/5.0', 'SUCCESS', NULL, 160, DATEADD(DAY, -1, GETDATE())),
    (@AuditAgentId, 'UPDATE', 'Reclamation', 1, '{"statut":"OUVERTE"}', '{"statut":"EN_COURS"}', '192.168.1.101', 'Mozilla/5.0', 'SUCCESS', NULL, 140, GETDATE()),
    (@AuditUserId, 'CREATE', 'TypeIntervention', 1, NULL, '{"nom":"Nouveau Type"}', '192.168.1.100', 'Mozilla/5.0', 'SUCCESS', NULL, 120, DATEADD(HOUR, -23, GETDATE())),
    (@AuditClientId, 'UPDATE', 'Vehicule', 1, '{"km":"10000"}', '{"km":"15000"}', '192.168.1.102', 'Mozilla/5.0', 'SUCCESS', NULL, 95, DATEADD(HOUR, -22, GETDATE())),
    (@AuditAgentId, 'CREATE', 'PlageHoraire', 1, NULL, '{"heure":"09:00"}', '192.168.1.101', 'Mozilla/5.0', 'SUCCESS', NULL, 105, DATEADD(HOUR, -21, GETDATE())),
    (@AuditUserId, 'DELETE', 'PlageHoraire', 1, '{"heure":"18:00"}', NULL, '192.168.1.100', 'Mozilla/5.0', 'SUCCESS', NULL, 85, DATEADD(HOUR, -20, GETDATE())),
    (@AuditClientId, 'CREATE', 'Document', 1, NULL, '{"type":"Facture"}', '192.168.1.102', 'Mozilla/5.0', 'SUCCESS', NULL, 175, DATEADD(HOUR, -19, GETDATE())),
    (@AuditAgentId, 'UPDATE', 'AffectationOuvrier', 1, '{"ouvrier_id":1}', '{"ouvrier_id":2}', '192.168.1.101', 'Mozilla/5.0', 'SUCCESS', NULL, 125, DATEADD(HOUR, -18, GETDATE())),
    (@AuditUserId, 'CREATE', 'Promotion', 2, NULL, '{"titre":"Promo Ete"}', '192.168.1.100', 'Mozilla/5.0', 'SUCCESS', NULL, 145, DATEADD(HOUR, -17, GETDATE())),
    (@AuditClientId, 'UPDATE', 'RendezVous', 2, '{"date":"2026-05-01"}', '{"date":"2026-05-05"}', '192.168.1.102', 'Mozilla/5.0', 'SUCCESS', NULL, 155, DATEADD(HOUR, -16, GETDATE())),
    (@AuditAgentId, 'CREATE', 'Diagnostic', 2, NULL, '{"vehicule_id":2}', '192.168.1.101', 'Mozilla/5.0', 'SUCCESS', NULL, 190, DATEADD(HOUR, -15, GETDATE())),
    (@AuditUserId, 'DELETE', 'Document', 1, '{"nom":"Ancien Doc"}', NULL, '192.168.1.100', 'Mozilla/5.0', 'SUCCESS', NULL, 75, DATEADD(HOUR, -14, GETDATE())),
    (@AuditClientId, 'CREATE', 'Feedback', 1, NULL, '{"note":5}', '192.168.1.102', 'Mozilla/5.0', 'SUCCESS', NULL, 135, DATEADD(HOUR, -13, GETDATE())),
    (@AuditAgentId, 'UPDATE', 'Ouvrier', 2, '{"disponible":0}', '{"disponible":1}', '192.168.1.101', 'Mozilla/5.0', 'SUCCESS', NULL, 115, DATEADD(HOUR, -12, GETDATE())),
    (@AuditUserId, 'CREATE', 'MessageAccueil', 1, NULL, '{"titre":"Bienvenue"}', '192.168.1.100', 'Mozilla/5.0', 'SUCCESS', NULL, 165, DATEADD(HOUR, -11, GETDATE())),
    (@AuditClientId, 'UPDATE', 'Utilisateur', @AuditClientId, '{"email":"old@test.com"}', '{"email":"new@test.com"}', '192.168.1.102', 'Mozilla/5.0', 'SUCCESS', NULL, 105, DATEADD(HOUR, -10, GETDATE()));

PRINT 'AuditLog: 25 lignes ajoutees';
PRINT '';

-- ============================================
-- VERIFICATION FINALE
-- ============================================
PRINT '';
PRINT '========================================';
PRINT 'VERIFICATION DES DONNEES AJOUTEES';
PRINT '========================================';
PRINT '';

SELECT 'InterventionCatalog' AS TableName, COUNT(*) AS NombreLignes FROM InterventionCatalog
UNION ALL
SELECT 'PromotionVehicule', COUNT(*) FROM PromotionVehicule
UNION ALL
SELECT 'MessageAccueil', COUNT(*) FROM MessageAccueil
UNION ALL
SELECT 'Feedback', COUNT(*) FROM Feedback
UNION ALL
SELECT 'HistoriqueRDV', COUNT(*) FROM HistoriqueRDV
UNION ALL
SELECT 'MessageLecture', COUNT(*) FROM MessageLecture
UNION ALL
SELECT 'AuditLog', COUNT(*) FROM AuditLog;

PRINT '';
PRINT 'Ajout donnees de test termine avec succes!';
PRINT '';
GO
