-- Vérifier les contraintes sur la table Promotion
SELECT 
    cc.CONSTRAINT_NAME,
    cc.CHECK_CLAUSE
FROM INFORMATION_SCHEMA.CHECK_CONSTRAINTS cc
JOIN INFORMATION_SCHEMA.CONSTRAINT_TABLE_USAGE ctu 
    ON cc.CONSTRAINT_NAME = ctu.CONSTRAINT_NAME
WHERE ctu.TABLE_NAME = 'Promotion';

-- Voir les données de la promotion ID 4
SELECT * FROM Promotion WHERE id = 4;
