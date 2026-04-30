-- Script pour insérer des couleurs de véhicules de base
-- À exécuter dans SQL Server Management Studio

USE STA_SAV_DB;
GO

-- Vérifier si des couleurs existent déjà
IF NOT EXISTS (SELECT 1 FROM Couleur)
BEGIN
    PRINT 'Insertion des couleurs de base...';
    
    -- Couleurs standards pour véhicules
    INSERT INTO Couleur (nom, code_hex, actif) VALUES
    ('Blanc', '#FFFFFF', 1),
    ('Noir', '#000000', 1),
    ('Gris', '#808080', 1),
    ('Gris Métallisé', '#A9A9A9', 1),
    ('Argent', '#C0C0C0', 1),
    ('Rouge', '#DC143C', 1),
    ('Bleu', '#0000FF', 1),
    ('Bleu Foncé', '#00008B', 1),
    ('Bleu Ciel', '#87CEEB', 1),
    ('Vert', '#008000', 1),
    ('Vert Foncé', '#006400', 1),
    ('Jaune', '#FFD700', 1),
    ('Orange', '#FF8C00', 1),
    ('Marron', '#8B4513', 1),
    ('Beige', '#F5F5DC', 1);
    
    PRINT 'Couleurs insérées avec succès!';
    
    -- Afficher le résultat
    SELECT 
        id,
        nom,
        code_hex,
        CASE WHEN actif = 1 THEN 'Actif' ELSE 'Inactif' END AS statut
    FROM Couleur
    ORDER BY nom;
END
ELSE
BEGIN
    PRINT 'Des couleurs existent déjà dans la base de données.';
    PRINT 'Nombre de couleurs existantes: ' + CAST((SELECT COUNT(*) FROM Couleur) AS VARCHAR);
END
GO
