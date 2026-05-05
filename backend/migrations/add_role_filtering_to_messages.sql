-- ============================================
-- Script: Add Role Filtering to MessageAccueil
-- Date: 3 Mai 2026
-- Description: Add cible_role column to filter messages by user role
-- ============================================

USE STA_SAV_DB;
GO

PRINT 'Adding cible_role column to MessageAccueil...';

-- Add cible_role column (nullable - NULL means visible to all roles)
ALTER TABLE MessageAccueil
ADD cible_role NVARCHAR(50) NULL;
GO

PRINT 'Column added successfully';
PRINT '';

-- Update existing test data with appropriate roles
PRINT 'Updating existing messages with role filters...';

-- "Bienvenue" message - visible to all (NULL)
UPDATE MessageAccueil 
SET cible_role = NULL 
WHERE titre = 'Bienvenue';

-- "Espace Agent" message - only for AGENT role
UPDATE MessageAccueil 
SET cible_role = 'AGENT' 
WHERE titre = 'Espace Agent';

-- "Nouveau Diagnostic" message - visible to all (NULL)
UPDATE MessageAccueil 
SET cible_role = NULL 
WHERE titre = 'Nouveau Diagnostic';

PRINT 'Messages updated successfully';
PRINT '';

-- Verify the changes
PRINT 'Verification:';
SELECT id, titre, type, cible_role, actif 
FROM MessageAccueil 
ORDER BY id;

PRINT '';
PRINT 'Migration complete!';
GO
