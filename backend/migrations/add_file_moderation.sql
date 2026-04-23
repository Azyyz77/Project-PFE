-- Ajouter des colonnes pour la modération des fichiers
ALTER TABLE PieceJointe ADD statut_moderation NVARCHAR(20) DEFAULT 'EN_ATTENTE';
ALTER TABLE PieceJointe ADD modere_par BIGINT NULL;
ALTER TABLE PieceJointe ADD date_moderation DATETIME2 NULL;
ALTER TABLE PieceJointe ADD commentaire_moderation NVARCHAR(500) NULL;

-- Contrainte pour le statut de modération
ALTER TABLE PieceJointe ADD CONSTRAINT CK_StatutModeration 
CHECK (statut_moderation IN ('EN_ATTENTE', 'APPROUVE', 'REJETE'));

-- Clé étrangère vers l'utilisateur qui modère
ALTER TABLE PieceJointe ADD CONSTRAINT FK_PieceJointe_Moderateur
FOREIGN KEY (modere_par) REFERENCES Utilisateur(id);