-- ============================================================================
-- Script SQL simple pour ajouter des ouvriers de base
-- Version rapide pour tests - SANS tables optionnelles
-- ============================================================================

PRINT 'Insertion d''ouvriers de base pour STA Tunis Nord (agence_id = 1)...'

-- Vérifier que l'agence existe
IF NOT EXISTS (SELECT 1 FROM Agence WHERE id = 1)
BEGIN
    PRINT 'ERREUR: Agence avec ID 1 n''existe pas!'
    PRINT 'Veuillez d''abord créer l''agence STA Tunis Nord avec ID = 1'
    RETURN
END

-- Insertion simple de 5 ouvriers pour l'agence 1
INSERT INTO Ouvrier (nom, prenom, telephone, email, specialite, niveau_competence, agence_id, actif) 
VALUES 
('Ben Ali', 'Ahmed', '+21698123456', 'ahmed.benali@sta.tn', 'Mécanique Générale', 'Expert', 1, 1),
('Sassi', 'Karim', '+21695456789', 'karim.sassi@sta.tn', 'Électricité Automobile', 'Expert', 1, 1),
('Bouaziz', 'Hedi', '+21693678901', 'hedi.bouaziz@sta.tn', 'Carrosserie', 'Intermédiaire', 1, 1),
('Jemli', 'Farid', '+21691890123', 'farid.jemli@sta.tn', 'Pneumatiques', 'Intermédiaire', 1, 1),
('Hamdi', 'Youssef', '+21690901234', 'youssef.hamdi@sta.tn', 'Diagnostic Électronique', 'Expert', 1, 1);

PRINT '✅ 5 ouvriers ajoutés avec succès!'
PRINT ''

-- Vérification et affichage
PRINT 'Ouvriers créés:'
SELECT 
    id, 
    nom + ' ' + prenom AS 'Nom Complet',
    specialite AS 'Spécialité', 
    niveau_competence AS 'Niveau',
    telephone AS 'Téléphone',
    CASE WHEN actif = 1 THEN 'Actif' ELSE 'Inactif' END AS 'Statut'
FROM Ouvrier 
WHERE agence_id = 1
ORDER BY id DESC;

PRINT ''
PRINT '🎯 Vous pouvez maintenant:'
PRINT '   1. Tester l''interface admin: /dashboard/admin/workers'
PRINT '   2. Tester l''affectation agent: /dashboard/agent/workers'
PRINT '   3. Créer des rendez-vous et affecter ces ouvriers'