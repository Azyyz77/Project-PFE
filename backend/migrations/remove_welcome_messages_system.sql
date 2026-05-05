-- ============================================
-- Script: Remove Welcome Messages System Completely
-- Date: 3 Mai 2026
-- Description: Drop all welcome message tables and data
-- ============================================

USE STA_SAV_DB;
GO

PRINT 'Removing Welcome Messages System...';
PRINT '';

-- Drop MessageLecture table first (has FK to MessageAccueil)
IF OBJECT_ID('MessageLecture', 'U') IS NOT NULL
BEGIN
    PRINT 'Dropping MessageLecture table...';
    DROP TABLE MessageLecture;
    PRINT 'MessageLecture table dropped';
END
ELSE
BEGIN
    PRINT 'MessageLecture table does not exist';
END
PRINT '';

-- Drop MessageAccueil table
IF OBJECT_ID('MessageAccueil', 'U') IS NOT NULL
BEGIN
    PRINT 'Dropping MessageAccueil table...';
    DROP TABLE MessageAccueil;
    PRINT 'MessageAccueil table dropped';
END
ELSE
BEGIN
    PRINT 'MessageAccueil table does not exist';
END
PRINT '';

-- Verify tables are dropped
PRINT 'Verification:';
IF OBJECT_ID('MessageAccueil', 'U') IS NULL AND OBJECT_ID('MessageLecture', 'U') IS NULL
BEGIN
    PRINT 'SUCCESS: All welcome message tables removed';
END
ELSE
BEGIN
    PRINT 'WARNING: Some tables still exist';
END

PRINT '';
PRINT 'Welcome Messages System completely removed!';
GO
