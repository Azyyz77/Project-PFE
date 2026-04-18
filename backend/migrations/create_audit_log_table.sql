-- Create AuditLog table for tracking all system modifications
-- This table provides comprehensive audit trail for compliance and debugging

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AuditLog')
BEGIN
    CREATE TABLE AuditLog (
        id BIGINT PRIMARY KEY IDENTITY(1,1),
        
        -- Who performed the action
        utilisateur_id BIGINT NOT NULL,
        utilisateur_nom NVARCHAR(200),
        utilisateur_role NVARCHAR(50),
        
        -- What action was performed
        action NVARCHAR(50) NOT NULL, -- CREATE, UPDATE, DELETE, LOGIN, LOGOUT, etc.
        entite_type NVARCHAR(100) NOT NULL, -- RendezVous, Vehicule, Utilisateur, etc.
        entite_id NVARCHAR(100), -- ID of the affected entity
        
        -- Details of the change
        ancien_valeur NVARCHAR(MAX), -- JSON of old values
        nouveau_valeur NVARCHAR(MAX), -- JSON of new values
        description NVARCHAR(500), -- Human-readable description
        
        -- Context
        ip_address NVARCHAR(50),
        user_agent NVARCHAR(500),
        endpoint NVARCHAR(255), -- API endpoint called
        methode_http NVARCHAR(10), -- GET, POST, PUT, DELETE
        
        -- Metadata
        date_action DATETIME NOT NULL DEFAULT GETDATE(),
        statut NVARCHAR(20) DEFAULT 'SUCCESS', -- SUCCESS, FAILED, PARTIAL
        erreur_message NVARCHAR(MAX), -- Error details if failed
        
        -- Foreign key
        CONSTRAINT FK_AuditLog_Utilisateur FOREIGN KEY (utilisateur_id) 
            REFERENCES Utilisateur(id)
    );
    
    -- Indexes for performance
    CREATE INDEX IX_AuditLog_Utilisateur ON AuditLog(utilisateur_id);
    CREATE INDEX IX_AuditLog_EntiteType ON AuditLog(entite_type);
    CREATE INDEX IX_AuditLog_EntiteId ON AuditLog(entite_id);
    CREATE INDEX IX_AuditLog_Action ON AuditLog(action);
    CREATE INDEX IX_AuditLog_DateAction ON AuditLog(date_action DESC);
    CREATE INDEX IX_AuditLog_Composite ON AuditLog(entite_type, entite_id, date_action DESC);
    
    PRINT 'Table AuditLog créée avec succès';
END
ELSE
BEGIN
    PRINT 'Table AuditLog existe déjà';
END
GO
