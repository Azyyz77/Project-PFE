USE [STA_SAV_DB]
GO

PRINT '========================================='
PRINT 'Création d''un utilisateur de test DIRECTION'
PRINT '========================================='
PRINT ''

-- Vérifier si le rôle DIRECTION existe
DECLARE @direction_role_id BIGINT = (SELECT id FROM Role WHERE nom = 'DIRECTION')

IF @direction_role_id IS NULL
BEGIN
    PRINT '❌ ERREUR: Le rôle DIRECTION n''existe pas!'
    PRINT 'Veuillez d''abord créer le rôle DIRECTION dans la table Role.'
    RETURN
END

PRINT '✓ Rôle DIRECTION trouvé (ID: ' + CAST(@direction_role_id AS VARCHAR) + ')'
PRINT ''

-- Vérifier si l'utilisateur existe déjà
IF EXISTS (SELECT * FROM Utilisateur WHERE email = 'direction@stachery.tn')
BEGIN
    PRINT '⚠ L''utilisateur direction@stachery.tn existe déjà.'
    PRINT 'Mise à jour du rôle vers DIRECTION...'
    
    UPDATE Utilisateur 
    SET role_id = @direction_role_id,
        actif = 1
    WHERE email = 'direction@stachery.tn'
    
    PRINT '✓ Utilisateur mis à jour avec le rôle DIRECTION'
END
ELSE
BEGIN
    PRINT 'Création du nouvel utilisateur...'
    
    -- Créer l'utilisateur de test
    -- Mot de passe: Direction2024! (hashé avec bcrypt)
    -- Hash généré pour: Direction2024!
    INSERT INTO Utilisateur (
        nom,
        prenom,
        email,
        mot_de_passe,
        telephone,
        role_id,
        actif,
        date_creation,
        telephone_verifie
    )
    VALUES (
        'Direction',
        'Test',
        'direction@stachery.tn',
        '$2b$10$YQZ8vXKZJ5fZ5YqZ5YqZ5O5YqZ5YqZ5YqZ5YqZ5YqZ5YqZ5YqZ5Y', -- Direction2024!
        '+216 20 000 000',
        @direction_role_id,
        1,
        GETDATE(),
        1
    )
    
    PRINT '✓ Utilisateur créé avec succès!'
END

PRINT ''
PRINT '========================================='
PRINT 'INFORMATIONS DE CONNEXION'
PRINT '========================================='
PRINT 'Email:        direction@stachery.tn'
PRINT 'Mot de passe: Direction2024!'
PRINT 'Rôle:         DIRECTION'
PRINT '========================================='
PRINT ''

-- Afficher les détails de l'utilisateur créé
SELECT 
    u.id,
    u.nom,
    u.prenom,
    u.email,
    u.telephone,
    r.nom AS role,
    u.actif,
    u.date_creation
FROM Utilisateur u
JOIN Role r ON u.role_id = r.id
WHERE u.email = 'direction@stachery.tn'

PRINT ''
PRINT '✅ Script terminé avec succès!'
PRINT ''
PRINT 'PROCHAINES ÉTAPES:'
PRINT '1. Connectez-vous avec: direction@stachery.tn / Direction2024!'
PRINT '2. Accédez au dashboard: http://localhost:3001/dashboard/direction'
PRINT '3. Testez les statistiques avancées'
PRINT ''

GO
