-- Vérifier la structure de la table Facture
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Facture'
ORDER BY ORDINAL_POSITION;

-- Vérifier les données existantes
SELECT TOP 5
    f.id,
    f.numero,
    f.commande_id,
    f.montant_ttc,
    f.statut,
    f.date_emission,
    f.date_echeance,
    f.date_envoi,
    f.date_paiement,
    f.mode_paiement
FROM Facture f;

-- Vérifier les relations avec CommandeReparation
SELECT TOP 5
    f.id AS facture_id,
    f.numero AS facture_numero,
    c.id AS commande_id,
    c.numero AS commande_numero,
    c.client_id,
    c.vehicule_id,
    c.agence_id,
    c.montant_total
FROM Facture f
JOIN CommandeReparation c ON c.id = f.commande_id;
