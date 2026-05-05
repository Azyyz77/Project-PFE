-- ============================================
-- Script: Ajouter des Donnees de Test (SIMPLE)
-- Date: 3 Mai 2026
-- ============================================

USE STA_SAV_DB;
GO

PRINT 'Debut ajout donnees de test...';
PRINT '';

-- ============================================
-- 1. INTERVENTION CATALOG
-- ============================================
PRINT '1. InterventionCatalog...';

INSERT INTO InterventionCatalog (nom, description, prix, duree_estimee_min, actif, date_creation)
VALUES 
    ('Vidange Moteur', 'Vidange huile moteur avec filtre', 150.00, 45, 1, GETDATE()),
    ('Revision Annuelle', 'Revision complete', 350.00, 120, 1, GETDATE()),
    ('Changement Plaquettes', 'Plaquettes avant et arriere', 200.00, 60, 1, GETDATE()),
    ('Diagnostic Electronique', 'Diagnostic complet', 80.00, 30, 1, GETDATE()),
    ('Changement Pneus', 'Montage 4 pneus', 50.00, 40, 1, GETDATE()),
    ('Climatisation', 'Recharge gaz clim', 120.00, 35, 1, GETDATE()),
    ('Geometrie', 'Reglage geometrie', 90.00, 50, 1, GETDATE()),
    ('Changement Batterie', 'Remplacement batterie', 180.00, 25, 1, GETDATE());

PRINT 'OK - 8 lignes';
PRINT '';

-- ============================================
-- 2. PROMOTION VEHICULE
-- ============================================
PRINT '2. PromotionVehicule...';

DECLARE @MarqueId BIGINT = (SELECT TOP 1 id FROM Marque);
DECLARE @AdminId BIGINT = (SELECT TOP 1 id FROM Utilisateur WHERE role_id = (SELECT id FROM Role WHERE nom = 'ADMIN'));

INSERT INTO PromotionVehicule (
    titre, description, marque_id,
    prix_original, prix_promotion, pourcentage_reduction,
    date_debut, date_fin, actif, created_by, created_at
)
VALUES 
    ('Promotion Ete 2026', 'Reduction 5% sur tous vehicules', @MarqueId, 80000.00, 76000.00, 5.00, GETDATE(), DATEADD(MONTH, 3, GETDATE()), 1, @AdminId, GETDATE()),
    ('Offre Speciale', 'Reduction 3000 TND', @MarqueId, 95000.00, 92000.00, 3.16, GETDATE(), DATEADD(MONTH, 2, GETDATE()), 1, @AdminId, GETDATE()),
    ('Pack Entretien', 'Revision gratuite', @MarqueId, 85000.00, 84650.00, 0.41, GETDATE(), DATEADD(MONTH, 6, GETDATE()), 1, @AdminId, GETDATE()),
    ('Fin de Serie', 'Reduction 8%', @MarqueId, 70000.00, 64400.00, 8.00, GETDATE(), DATEADD(MONTH, 1, GETDATE()), 1, @AdminId, GETDATE());

PRINT 'OK - 4 lignes';
PRINT '';

-- ============================================
-- 3. MESSAGE ACCUEIL
-- ============================================
PRINT '3. MessageAccueil...';

INSERT INTO MessageAccueil (
    titre, contenu, type, priorite,
    date_debut, actif, afficher_accueil, afficher_dashboard,
    couleur_fond, icone, created_by, created_at
)
VALUES 
    ('Bienvenue', '<h2>Bienvenue chez STA Chery!</h2>', 'BIENVENUE', 1, GETDATE(), 1, 1, 1, '#4F46E5', 'welcome', @AdminId, GETDATE()),
    ('Espace Agent', '<h3>Bienvenue Agent!</h3>', 'BIENVENUE', 1, GETDATE(), 1, 1, 1, '#10B981', 'dashboard', @AdminId, GETDATE()),
    ('Nouveau Diagnostic', '<h3>Diagnostic en ligne disponible!</h3>', 'INFORMATION', 2, GETDATE(), 1, 1, 1, '#F59E0B', 'info', @AdminId, GETDATE());

PRINT 'OK - 3 lignes';
PRINT '';

-- ============================================
-- 4. FEEDBACK
-- ============================================
PRINT '4. Feedback...';

DECLARE @Rdv1 BIGINT = (SELECT TOP 1 id FROM RendezVous WHERE statut = 'TERMINE' ORDER BY date_heure DESC);
DECLARE @Rdv2 BIGINT = (SELECT TOP 1 id FROM RendezVous WHERE statut = 'TERMINE' AND id != @Rdv1 ORDER BY date_heure DESC);
DECLARE @Rdv3 BIGINT = (SELECT TOP 1 id FROM RendezVous WHERE statut = 'TERMINE' AND id NOT IN (@Rdv1, @Rdv2) ORDER BY date_heure DESC);

IF @Rdv1 IS NOT NULL
BEGIN
    INSERT INTO Feedback (rendez_vous_id, note, commentaire, date_feedback)
    VALUES 
        (@Rdv1, 5, 'Excellent service!', DATEADD(DAY, -1, GETDATE())),
        (@Rdv1, 4, 'Bon service', DATEADD(DAY, -2, GETDATE()));
END

IF @Rdv2 IS NOT NULL
BEGIN
    INSERT INTO Feedback (rendez_vous_id, note, commentaire, date_feedback)
    VALUES 
        (@Rdv2, 5, 'Parfait!', DATEADD(DAY, -3, GETDATE())),
        (@Rdv2, 4, 'Tres bien', DATEADD(DAY, -4, GETDATE()));
END

IF @Rdv3 IS NOT NULL
BEGIN
    INSERT INTO Feedback (rendez_vous_id, note, commentaire, date_feedback)
    VALUES 
        (@Rdv3, 5, 'Impeccable!', DATEADD(DAY, -5, GETDATE())),
        (@Rdv3, 3, 'Correct', DATEADD(DAY, -6, GETDATE()));
END

PRINT 'OK - Feedbacks ajoutes';
PRINT '';

-- ============================================
-- 5. HISTORIQUE RDV
-- ============================================
PRINT '5. HistoriqueRDV...';

DECLARE @RdvHist1 BIGINT = (SELECT TOP 1 id FROM RendezVous ORDER BY date_heure DESC);
DECLARE @AgentId BIGINT = (SELECT TOP 1 id FROM Utilisateur WHERE role_id = (SELECT id FROM Role WHERE nom = 'AGENT'));

IF @RdvHist1 IS NOT NULL AND @AgentId IS NOT NULL
BEGIN
    INSERT INTO HistoriqueRDV (rdv_id, ancien_statut, nouveau_statut, utilisateur_id, remarque, date_changement)
    VALUES 
        (@RdvHist1, NULL, 'EN_ATTENTE', @AgentId, 'Creation RDV', DATEADD(DAY, -5, GETDATE())),
        (@RdvHist1, 'EN_ATTENTE', 'CONFIRME', @AgentId, 'Confirmation', DATEADD(DAY, -4, GETDATE())),
        (@RdvHist1, 'CONFIRME', 'EN_COURS', @AgentId, 'Demarrage', DATEADD(DAY, -3, GETDATE()));
END

PRINT 'OK - Historique ajoute';
PRINT '';

-- ============================================
-- 6. MESSAGE LECTURE
-- ============================================
PRINT '6. MessageLecture...';

DECLARE @Msg1 BIGINT = (SELECT TOP 1 id FROM MessageAccueil WHERE actif = 1);
DECLARE @User1 BIGINT = (SELECT TOP 1 id FROM Utilisateur WHERE role_id = (SELECT id FROM Role WHERE nom = 'CLIENT'));

IF @Msg1 IS NOT NULL AND @User1 IS NOT NULL
BEGIN
    INSERT INTO MessageLecture (message_id, utilisateur_id, date_lecture)
    VALUES 
        (@Msg1, @User1, DATEADD(HOUR, -1, GETDATE()));
END

PRINT 'OK - Lectures ajoutees';
PRINT '';

-- ============================================
-- 7. AUDIT LOG
-- ============================================
PRINT '7. AuditLog...';

DECLARE @AuditUser BIGINT = (SELECT TOP 1 id FROM Utilisateur WHERE role_id = (SELECT id FROM Role WHERE nom = 'ADMIN'));

IF @AuditUser IS NOT NULL
BEGIN
    INSERT INTO AuditLog (
        utilisateur_id, utilisateur_nom, utilisateur_role,
        action, entite_type, entite_id, 
        ancien_valeur, nouveau_valeur, description,
        ip_address, user_agent, endpoint, methode_http,
        date_action, statut
    )
    VALUES 
        (@AuditUser, 'Admin', 'ADMIN', 'CREATE', 'Utilisateur', '1', NULL, '{"nom":"Test"}', 'Creation utilisateur', '192.168.1.1', 'Mozilla/5.0', '/api/users', 'POST', DATEADD(DAY, -10, GETDATE()), 'SUCCESS'),
        (@AuditUser, 'Admin', 'ADMIN', 'UPDATE', 'RendezVous', '1', '{"statut":"EN_ATTENTE"}', '{"statut":"CONFIRME"}', 'Confirmation RDV', '192.168.1.1', 'Mozilla/5.0', '/api/appointments/1', 'PUT', DATEADD(DAY, -9, GETDATE()), 'SUCCESS'),
        (@AuditUser, 'Admin', 'ADMIN', 'DELETE', 'Promotion', '1', '{"titre":"Old"}', NULL, 'Suppression promo', '192.168.1.1', 'Mozilla/5.0', '/api/promotions/1', 'DELETE', DATEADD(DAY, -8, GETDATE()), 'SUCCESS'),
        (@AuditUser, 'Admin', 'ADMIN', 'CREATE', 'Vehicule', '1', NULL, '{"immat":"123TU456"}', 'Ajout vehicule', '192.168.1.1', 'Mozilla/5.0', '/api/vehicles', 'POST', DATEADD(DAY, -7, GETDATE()), 'SUCCESS'),
        (@AuditUser, 'Admin', 'ADMIN', 'UPDATE', 'Diagnostic', '1', '{"etat":"EN_COURS"}', '{"etat":"TERMINE"}', 'Fin diagnostic', '192.168.1.1', 'Mozilla/5.0', '/api/diagnostics/1', 'PUT', DATEADD(DAY, -6, GETDATE()), 'SUCCESS');
END

PRINT 'OK - 5 lignes';
PRINT '';

-- ============================================
-- VERIFICATION
-- ============================================
PRINT '';
PRINT '========================================';
PRINT 'VERIFICATION';
PRINT '========================================';
PRINT '';

SELECT 'InterventionCatalog' AS TableName, COUNT(*) AS Lignes FROM InterventionCatalog
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
PRINT 'TERMINE!';
GO
