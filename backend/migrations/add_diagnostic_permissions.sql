USE [STA_SAV_DB]
GO

PRINT 'Ajout des permissions pour le système de diagnostic...'
PRINT ''

-- Récupérer les IDs des rôles
DECLARE @agent_role_id BIGINT = (SELECT id FROM Role WHERE nom = 'AGENT')
DECLARE @admin_role_id BIGINT = (SELECT id FROM Role WHERE nom = 'ADMIN')

PRINT 'IDs des rôles:'
PRINT '  - AGENT: ' + CAST(@agent_role_id AS VARCHAR)
PRINT '  - ADMIN: ' + CAST(@admin_role_id AS VARCHAR)
PRINT ''

-- Ajouter les permissions DIAGNOSTICS pour le rôle AGENT
IF @agent_role_id IS NOT NULL
BEGIN
    -- READ
    IF NOT EXISTS (SELECT * FROM Permission WHERE role_id = @agent_role_id AND module = 'DIAGNOSTICS' AND action = 'READ')
    BEGIN
        INSERT INTO Permission (role_id, module, action, actif)
        VALUES (@agent_role_id, 'DIAGNOSTICS', 'READ', 1)
        PRINT '✓ Permission DIAGNOSTICS.READ créée pour AGENT'
    END
    ELSE
        PRINT '- Permission DIAGNOSTICS.READ existe déjà pour AGENT'
    
    -- CREATE
    IF NOT EXISTS (SELECT * FROM Permission WHERE role_id = @agent_role_id AND module = 'DIAGNOSTICS' AND action = 'CREATE')
    BEGIN
        INSERT INTO Permission (role_id, module, action, actif)
        VALUES (@agent_role_id, 'DIAGNOSTICS', 'CREATE', 1)
        PRINT '✓ Permission DIAGNOSTICS.CREATE créée pour AGENT'
    END
    ELSE
        PRINT '- Permission DIAGNOSTICS.CREATE existe déjà pour AGENT'
    
    -- UPDATE
    IF NOT EXISTS (SELECT * FROM Permission WHERE role_id = @agent_role_id AND module = 'DIAGNOSTICS' AND action = 'UPDATE')
    BEGIN
        INSERT INTO Permission (role_id, module, action, actif)
        VALUES (@agent_role_id, 'DIAGNOSTICS', 'UPDATE', 1)
        PRINT '✓ Permission DIAGNOSTICS.UPDATE créée pour AGENT'
    END
    ELSE
        PRINT '- Permission DIAGNOSTICS.UPDATE existe déjà pour AGENT'
END
ELSE
    PRINT '⚠ Rôle AGENT non trouvé'

PRINT ''

-- Ajouter toutes les permissions DIAGNOSTICS pour le rôle ADMIN
IF @admin_role_id IS NOT NULL
BEGIN
    -- READ
    IF NOT EXISTS (SELECT * FROM Permission WHERE role_id = @admin_role_id AND module = 'DIAGNOSTICS' AND action = 'READ')
    BEGIN
        INSERT INTO Permission (role_id, module, action, actif)
        VALUES (@admin_role_id, 'DIAGNOSTICS', 'READ', 1)
        PRINT '✓ Permission DIAGNOSTICS.READ créée pour ADMIN'
    END
    ELSE
        PRINT '- Permission DIAGNOSTICS.READ existe déjà pour ADMIN'
    
    -- CREATE
    IF NOT EXISTS (SELECT * FROM Permission WHERE role_id = @admin_role_id AND module = 'DIAGNOSTICS' AND action = 'CREATE')
    BEGIN
        INSERT INTO Permission (role_id, module, action, actif)
        VALUES (@admin_role_id, 'DIAGNOSTICS', 'CREATE', 1)
        PRINT '✓ Permission DIAGNOSTICS.CREATE créée pour ADMIN'
    END
    ELSE
        PRINT '- Permission DIAGNOSTICS.CREATE existe déjà pour ADMIN'
    
    -- UPDATE
    IF NOT EXISTS (SELECT * FROM Permission WHERE role_id = @admin_role_id AND module = 'DIAGNOSTICS' AND action = 'UPDATE')
    BEGIN
        INSERT INTO Permission (role_id, module, action, actif)
        VALUES (@admin_role_id, 'DIAGNOSTICS', 'UPDATE', 1)
        PRINT '✓ Permission DIAGNOSTICS.UPDATE créée pour ADMIN'
    END
    ELSE
        PRINT '- Permission DIAGNOSTICS.UPDATE existe déjà pour ADMIN'
    
    -- DELETE
    IF NOT EXISTS (SELECT * FROM Permission WHERE role_id = @admin_role_id AND module = 'DIAGNOSTICS' AND action = 'DELETE')
    BEGIN
        INSERT INTO Permission (role_id, module, action, actif)
        VALUES (@admin_role_id, 'DIAGNOSTICS', 'DELETE', 1)
        PRINT '✓ Permission DIAGNOSTICS.DELETE créée pour ADMIN'
    END
    ELSE
        PRINT '- Permission DIAGNOSTICS.DELETE existe déjà pour ADMIN'
END
ELSE
    PRINT '⚠ Rôle ADMIN non trouvé'

PRINT ''
PRINT '✅ Permissions de diagnostic configurées avec succès!'
PRINT ''
PRINT 'Permissions créées:'
PRINT '  - DIAGNOSTICS.READ'
PRINT '  - DIAGNOSTICS.CREATE'
PRINT '  - DIAGNOSTICS.UPDATE'
PRINT '  - DIAGNOSTICS.DELETE'
PRINT ''
PRINT 'Rôles configurés:'
PRINT '  - AGENT: READ, CREATE, UPDATE'
PRINT '  - ADMIN: READ, CREATE, UPDATE, DELETE'

GO
