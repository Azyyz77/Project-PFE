-- Insertion de données de test pour les agences
-- Vérifier d'abord si des agences existent déjà

-- Si la table est vide, insérer des agences de test
IF NOT EXISTS (SELECT 1 FROM Agence)
BEGIN
    PRINT 'Insertion des agences de test...';
    
    INSERT INTO Agence (nom, ville, telephone, adresse, email, horaires, latitude, longitude, actif, date_creation)
    VALUES 
        ('STA Tunis Nord', 'Tunis', '+216 71 123 456', 'Avenue Habib Bourguiba, Tunis', 'tunis.nord@chery.tn', 'Lun-Ven: 8h-18h, Sam: 8h-13h', 36.8065, 10.1815, 1, GETDATE()),
        ('STA Tunis Sud', 'Tunis', '+216 71 234 567', 'Route de la Marsa, Tunis', 'tunis.sud@chery.tn', 'Lun-Ven: 8h-18h, Sam: 8h-13h', 36.7538, 10.2254, 1, GETDATE()),
        ('STA Sfax', 'Sfax', '+216 74 345 678', 'Avenue Majida Boulila, Sfax', 'sfax@chery.tn', 'Lun-Ven: 8h-18h, Sam: 8h-13h', 34.7406, 10.7603, 1, GETDATE()),
        ('STA Sousse', 'Sousse', '+216 73 456 789', 'Boulevard Yahia Ibn Omar, Sousse', 'sousse@chery.tn', 'Lun-Ven: 8h-18h, Sam: 8h-13h', 35.8256, 10.6369, 1, GETDATE()),
        ('STA Monastir', 'Monastir', '+216 73 567 890', 'Route de la Corniche, Monastir', 'monastir@chery.tn', 'Lun-Ven: 8h-18h, Sam: 8h-13h', 35.7774, 10.8263, 1, GETDATE()),
        ('STA Bizerte', 'Bizerte', '+216 72 678 901', 'Avenue de la République, Bizerte', 'bizerte@chery.tn', 'Lun-Ven: 8h-18h, Sam: 8h-13h', 37.2746, 9.8739, 1, GETDATE());
    
    PRINT 'Agences de test insérées avec succès!';
END
ELSE
BEGIN
    PRINT 'Des agences existent déjà dans la base de données.';
    SELECT COUNT(*) as nombre_agences FROM Agence;
END
GO

-- Afficher les agences
SELECT 
    id,
    nom,
    ville,
    telephone,
    actif,
    date_creation
FROM Agence
ORDER BY ville, nom;
GO
