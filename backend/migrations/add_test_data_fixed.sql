-- ============================================
-- Script: Ajouter des Donnees de Test aux Tables Vides (FIXED)
-- Date: 3 Mai 2026
-- Description: Remplir les 7 tables vides avec les bons noms de colonnes
-- ============================================

USE STA_SAV_DB;
GO

PRINT 'Debut ajout donnees de test...';
PRINT '';

-- ============================================
-- 1. INTERVENTION CATALOG (8 interventions)
-- ============================================
PRINT '1. Ajout InterventionCatalog...';

INSERT INTO InterventionCatalog (nom, description, prix, duree_estimee_min, actif, date_creation)
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
DECLARE @AdminId BIGINT = (SELECT TOP 1 id FROM Utilisateur WHERE role_id = (SELECT id FROM Role WHERE nom = 'ADMIN'));

INSERT INTO PromotionVehicule (
    titre, description, marque_id, modele_id, 
    prix_original, prix_promotion, pourcentage_reduction,
    date_debut, date_fin, actif, 
    conditions, image_url, agence_id, 
    created_by, created_at
)
VALUES 
    (
        'Promotion Ete 2026', 
        'Reduction exceptionnelle de 5% sur tous les vehicules Chery',
        @MarqueChery, NULL,
        80000.00, 76000.00, 5.00,
        GETDATE(), DATEADD(MONTH, 3, GETDATE()), 1,
        'Valable pour tout achat avant fin juillet 2026', 
        '/images/promo-ete.jpg', NULL,
        @AdminId, GETDATE()
    ),
    (
        'Offre Tiggo 8 Pro', 
        'Reduction de 3000 TND sur le modele Tiggo 8 Pro',
        @MarqueChery, @ModeleId1,
        95000.00, 92000.00, 3.16,
        GETDATE(), DATEADD(MONTH, 2, GETDATE()), 1,
        'Stock limite - Premier arrive premier servi', 
        '/images/tiggo8-promo.jpg', NULL,
        @AdminId, GETDATE()
    ),
    (
        'Promo Agence Tunis', 
        'Offre speciale agence Tunis - 4% de reduction',
        @MarqueChery, NULL,
        75000.00, 72000.00, 4.00,
        GETDATE(), DATEADD(MONTH, 1, GETDATE()), 1,
        'Uniquement pour agence Tunis', 
        '/images/promo-tunis.jpg', @AgenceId1,
        @AdminId, GETDATE()
    ),
    (
        'Pack Entretien Gratuit', 
        'Premiere revision gratuite pour tout achat',
        @MarqueChery, NULL,
        85000.00, 84650.00, 0.41,
        GETDATE(), DATEADD(MONTH, 6, GETDATE()), 1,
        'Revision gratuite dans les 6 mois suivant achat', 
        '/images/pack-entretien.jpg', NULL,
        @AdminId, GETDATE()
    ),
    (
        'Offre Fin de Serie', 
        'Reduction 8% sur modeles 2025',
        @MarqueChery, NULL,
        70000.00, 64400.00, 8.00,
        GETDATE(), DATEADD(MONTH, 1, GETDATE()), 1,
        'Modeles 2025 uniquement - Stock limite', 
        '/images/fin-serie.jpg', @AgenceId2,
        @AdminId, GETDATE()
    );

PRINT 'PromotionVehicule: 5 lignes ajoutees';
PRINT '';

-- ============================================
-- 3. MESSAGE ACCUEIL (4 messages)
-- ============================================
PRINT '3. Ajout MessageAccueil...';

INSERT INTO MessageAccueil (
    titre, contenu, type, priorite,
    date_debut, date_fin, actif, 
    afficher_accueil, afficher_dashboard,
    couleur_fond, icone, 
    created_by, created_at
)
VALUES 
    (
        'Bienvenue chez STA Chery Tunisia',
        '<h2>Bienvenue sur votre espace client!</h2><p>Gerez vos rendez-vous, suivez vos vehicules et contactez nos experts.</p>',
        'BIENVENUE', 1,
        GETDATE(), NULL, 1,
        1, 1,
        '#4F46E5', 'welcome',
        @AdminId, GETDATE()
    ),
    (
        'Espace Agent - Tableau de Bord',
        '<h3>Bienvenue Agent!</h3><p>Consultez vos rendez-vous du jour et gerez les interventions.</p>',
        'BIENVENUE', 1,
        GETDATE(), NULL, 1,
        1, 1,
        '#10B981', 'dashboard',
        @AdminId, GETDATE()
    ),
    (
        'Nouvelle Fonctionnalite: Diagnostic en Ligne',
        '<h3>Nouveau!</h3><p>Vous pouvez maintenant demander un diagnostic en ligne avant votre rendez-vous.</p>',
        'INFORMATION', 2,
        GETDATE(), DATEADD(MONTH, 1, GETDATE()), 1,
        1, 1,
        '#F59E0B', 'info',
        @AdminId, GETDATE()
    ),
    (
        'Maintenance Programmee',
        '<h3>Maintenance Systeme</h3><p>Une maintenance est prevue le 15 mai 2026 de 2h a 4h du matin.</p>',
        'ALERTE', 3,
        DATEADD(DAY, 10, GETDATE()), DATEADD(DAY, 15, GETDATE()), 1,
        1, 1,
        '#EF4444', 'warning',
        @AdminId, GETDATE()
    );

PRINT 'MessageAccueil: 4 lignes ajoutees';
PRINT '';

-- ============================================
-- 4. FEEDBACK (10 feedbacks)
-- ============================================
PRINT '4. Ajout Feedback...';

DECLARE @RdvIds TABLE (id BIGINT);
INSERT INTO @RdvIds 
SELECT TOP 10 id FROM RendezVous 
WHERE statut_id = (SELECT id FROM StatutRDV WHERE nom = 'TERMINE') 
ORDER BY date_rdv DESC;

DECLARE @RdvId BIGINT;
DECLARE feedback_cursor CURSOR FOR SELECT id FROM @RdvIds;
OPEN feedback_cursor;
FETCH NEXT FROM feedback_cursor INTO @RdvId;

DECLARE @Counter INT = 1;
WHILE @@FETCH_STATUS = 0 AND @Counter <= 10
BEGIN
    INSERT INTO Feedback (rendez_vous_id, note, commentaire, date_feedback)
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
    INSERT INTO HistoriqueRDV (rdv_id, ancien_statut, nouveau_statut, utilisateur_id, remarque, date_changement)
    VALUES (
        @RdvHistId,
        NULL,
        'EN_ATTENTE',
        @AgentId,
        'Rendez-vous cree par le client',
        DATEADD(DAY, -5, GETDATE())
    );
    
    -- Confirmation
    INSERT INTO HistoriqueRDV (rdv_id, ancien_statut, nouveau_statut, utilisateur_id, remarque, date_changement)
    VALUES (
        @RdvHistId,
        'EN_ATTENTE',
        'CONFIRME',
        @AgentId,
        'Rendez-vous confirme par agent',
        DATEADD(DAY, -4, GETDATE())
    );
    
    -- En cours
    INSERT INTO HistoriqueRDV (rdv_id, ancien_statut, nouveau_statut, utilisateur_id, remarque, date_changement)
    VALUES (
        @RdvHistId,
        'CONFIRME',
        'EN_COURS',
        @AgentId,
        'Intervention demarree',
        DATEADD(DAY, -3, GETDATE())
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
    utilisateur_id, utilisateur_nom, utilisateur_role,
    action, entite_type, entite_id, 
    ancien_valeur, nouveau_valeur, description,
    ip_address, user_agent, endpoint, methode_http,
    date_action, statut, erreur_message
)
VALUES 
    (@AuditUserId, 'Admin User', 'ADMIN', 'CREATE', 'Utilisateur', CAST(@AuditClientId AS NVARCHAR), NULL, '{"nom":"Client Test"}', 'Creation nouveau client', '192.168.1.100', 'Mozilla/5.0', '/api/users', 'POST', DATEADD(DAY, -10, GETDATE()), 'SUCCESS', NULL),
    (@AuditAgentId, 'Agent User', 'AGENT', 'UPDATE', 'RendezVous', '1', '{"statut":"EN_ATTENTE"}', '{"statut":"CONFIRME"}', 'Confirmation rendez-vous', '192.168.1.101', 'Mozilla/5.0', '/api/appointments/1', 'PUT', DATEADD(DAY, -9, GETDATE()), 'SUCCESS', NULL),
    (@AuditUserId, 'Admin User', 'ADMIN', 'DELETE', 'Promotion', '1', '{"titre":"Ancienne promo"}', NULL, 'Suppression promotion expiree', '192.168.1.100', 'Mozilla/5.0', '/api/promotions/1', 'DELETE', DATEADD(DAY, -8, GETDATE()), 'SUCCESS', NULL),
    (@AuditClientId, 'Client User', 'CLIENT', 'CREATE', 'Vehicule', '1', NULL, '{"immatriculation":"123TU456"}', 'Ajout nouveau vehicule', '192.168.1.102', 'Mozilla/5.0', '/api/vehicles', 'POST', DATEADD(DAY, -7, GETDATE()), 'SUCCESS', NULL),
    (@AuditAgentId, 'Agent User', 'AGENT', 'UPDATE', 'Diagnostic', '1', '{"etat":"EN_COURS"}', '{"etat":"TERMINE"}', 'Finalisation diagnostic', '192.168.1.101', 'Mozilla/5.0', '/api/diagnostics/1', 'PUT', DATEADD(DAY, -6, GETDATE()), 'SUCCESS', NULL),
    (@AuditUserId, 'Admin User', 'ADMIN', 'CREATE', 'Agence', '1', NULL, '{"nom":"Nouvelle Agence"}', 'Creation nouvelle agence', '192.168.1.100', 'Mozilla/5.0', '/api/agencies', 'POST', DATEADD(DAY, -5, GETDATE()), 'SUCCESS', NULL),
    (@AuditClientId, 'Client User', 'CLIENT', 'UPDATE', 'Utilisateur', CAST(@AuditClientId AS NVARCHAR), '{"telephone":"12345"}', '{"telephone":"98765"}', 'Mise a jour telephone', '192.168.1.102', 'Mozilla/5.0', '/api/users/profile', 'PUT', DATEADD(DAY, -4, GETDATE()), 'SUCCESS', NULL),
    (@AuditAgentId, 'Agent User', 'AGENT', 'CREATE', 'InterventionRDV', '1', NULL, '{"type":"Vidange"}', 'Ajout intervention', '192.168.1.101', 'Mozilla/5.0', '/api/interventions', 'POST', DATEADD(DAY, -3, GETDATE()), 'SUCCESS', NULL),
    (@AuditUserId, 'Admin User', 'ADMIN', 'DELETE', 'Ouvrier', '1', '{"nom":"Ancien Ouvrier"}', NULL, 'Suppression ouvrier', '192.168.1.100', 'Mozilla/5.0', '/api/workers/1', 'DELETE', DATEADD(DAY, -2, GETDATE()), 'SUCCESS', NULL),
    (@AuditClientId, 'Client User', 'CLIENT', 'CREATE', 'Reclamation', '1', NULL, '{"sujet":"Probleme"}', 'Creation reclamation', '192.168.1.102', 'Mozilla/5.0', '/api/complaints', 'POST', DATEADD(DAY, -1, GETDATE()), 'SUCCESS', NULL),
    (@AuditAgentId, 'Agent User', 'AGENT', 'UPDATE', 'Reclamation', '1', '{"statut":"OUVERTE"}', '{"statut":"EN_COURS"}', 'Traitement reclamation', '192.168.1.101', 'Mozilla/5.0', '/api/complaints/1', 'PUT', GETDATE(), 'SUCCESS', NULL),
    (@AuditUserId, 'Admin User', 'ADMIN', 'CREATE', 'TypeIntervention', '1', NULL, '{"nom":"Nouveau Type"}', 'Ajout type intervention', '192.168.1.100', 'Mozilla/5.0', '/api/intervention-types', 'POST', DATEADD(HOUR, -23, GETDATE()), 'SUCCESS', NULL),
    (@AuditClientId, 'Client User', 'CLIENT', 'UPDATE', 'Vehicule', '1', '{"km":"10000"}', '{"km":"15000"}', 'Mise a jour kilometrage', '192.168.1.102', 'Mozilla/5.0', '/api/vehicles/1', 'PUT', DATEADD(HOUR, -22, GETDATE()), 'SUCCESS', NULL),
    (@AuditAgentId, 'Agent User', 'AGENT', 'CREATE', 'PlageHoraire', '1', NULL, '{"heure":"09:00"}', 'Ajout plage horaire', '192.168.1.101', 'Mozilla/5.0', '/api/timeslots', 'POST', DATEADD(HOUR, -21, GETDATE()), 'SUCCESS', NULL),
    (@AuditUserId, 'Admin User', 'ADMIN', 'DELETE', 'PlageHoraire', '1', '{"heure":"18:00"}', NULL, 'Suppression plage horaire', '192.168.1.100', 'Mozilla/5.0', '/api/timeslots/1', 'DELETE', DATEADD(HOUR, -20, GETDATE()), 'SUCCESS', NULL),
    (@AuditClientId, 'Client User', 'CLIENT', 'CREATE', 'Document', '1', NULL, '{"type":"Facture"}', 'Upload document', '192.168.1.102', 'Mozilla/5.0', '/api/documents', 'POST', DATEADD(HOUR, -19, GETDATE()), 'SUCCESS', NULL),
    (@AuditAgentId, 'Agent User', 'AGENT', 'UPDATE', 'AffectationOuvrier', '1', '{"ouvrier_id":1}', '{"ouvrier_id":2}', 'Changement affectation', '192.168.1.101', 'Mozilla/5.0', '/api/worker-assignments/1', 'PUT', DATEADD(HOUR, -18, GETDATE()), 'SUCCESS', NULL),
    (@AuditUserId, 'Admin User', 'ADMIN', 'CREATE', 'Promotion', '2', NULL, '{"titre":"Promo Ete"}', 'Creation promotion', '192.168.1.100', 'Mozilla/5.0', '/api/promotions', 'POST', DATEADD(HOUR, -17, GETDATE()), 'SUCCESS', NULL),
    (@AuditClientId, 'Client User', 'CLIENT', 'UPDATE', 'RendezVous', '2', '{"date":"2026-05-01"}', '{"date":"2026-05-05"}', 'Report rendez-vous', '192.168.1.102', 'Mozilla/5.0', '/api/appointments/2', 'PUT', DATEADD(HOUR, -16, GETDATE()), 'SUCCESS', NULL),
    (@AuditAgentId, 'Agent User', 'AGENT', 'CREATE', 'Diagnostic', '2', NULL, '{"vehicule_id":2}', 'Creation diagnostic', '192.168.1.101', 'Mozilla/5.0', '/api/diagnostics', 'POST', DATEADD(HOUR, -15, GETDATE()), 'SUCCESS', NULL),
    (@AuditUserId, 'Admin User', 'ADMIN', 'DELETE', 'Document', '1', '{"nom":"Ancien Doc"}', NULL, 'Suppression document', '192.168.1.100', 'Mozilla/5.0', '/api/documents/1', 'DELETE', DATEADD(HOUR, -14, GETDATE()), 'SUCCESS', NULL),
    (@AuditClientId, 'Client User', 'CLIENT', 'CREATE', 'Feedback', '1', NULL, '{"note":5}', 'Ajout feedback', '192.168.1.102', 'Mozilla/5.0', '/api/feedback', 'POST', DATEADD(HOUR, -13, GETDATE()), 'SUCCESS', NULL),
    (@AuditAgentId, 'Agent User', 'AGENT', 'UPDATE', 'Ouvrier', '2', '{"disponible":0}', '{"disponible":1}', 'Mise a jour disponibilite', '192.168.1.101', 'Mozilla/5.0', '/api/workers/2', 'PUT', DATEADD(HOUR, -12, GETDATE()), 'SUCCESS', NULL),
    (@AuditUserId, 'Admin User', 'ADMIN', 'CREATE', 'MessageAccueil', '1', NULL, '{"titre":"Bienvenue"}', 'Creation message accueil', '192.168.1.100', 'Mozilla/5.0', '/api/welcome-messages', 'POST', DATEADD(HOUR, -11, GETDATE()), 'SUCCESS', NULL),
    (@AuditClientId, 'Client User', 'CLIENT', 'UPDATE', 'Utilisateur', CAST(@AuditClientId AS NVARCHAR), '{"email":"old@test.com"}', '{"email":"new@test.com"}', 'Mise a jour email', '192.168.1.102', 'Mozilla/5.0', '/api/users/profile', 'PUT', DATEADD(HOUR, -10, GETDATE()), 'SUCCESS', NULL);

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
