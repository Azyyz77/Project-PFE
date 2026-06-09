-- ═══════════════════════════════════════════════════
--  Migration RAG — Nouvelles tables pour améliorer
--  l'assistant chatbot STA Chery
--  À exécuter sur la base SQL Server : STA_SAV_DB
-- ═══════════════════════════════════════════════════

-- 1. FAQ gérable par l'admin
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'FAQ')
BEGIN
  CREATE TABLE FAQ (
    id            BIGINT        IDENTITY(1,1) PRIMARY KEY,
    question      NVARCHAR(500) NOT NULL,
    reponse       NVARCHAR(MAX) NOT NULL,
    categorie     NVARCHAR(100) NULL,   -- 'rdv', 'garantie', 'paiement', 'vehicule'...
    ordre         INT           NOT NULL DEFAULT 0,
    actif         BIT           NOT NULL DEFAULT 1,
    date_creation DATETIME      NOT NULL DEFAULT GETDATE()
  );

  -- FAQ de démarrage
  INSERT INTO FAQ (question, reponse, categorie, ordre) VALUES
  (N'Comment prendre un rendez-vous ?',
   N'Vous pouvez prendre un rendez-vous directement depuis notre plateforme en ligne : connectez-vous, sélectionnez votre véhicule, choisissez une agence, un service et un créneau disponible.',
   'rdv', 1),
  (N'Quels documents dois-je apporter lors de mon rendez-vous ?',
   N'Merci d''apporter : votre carte grise, votre carnet d''entretien (si disponible) et votre certificat d''assurance en cours de validité.',
   'rdv', 2),
  (N'Quelle est la durée de la garantie Chery ?',
   N'Tous les véhicules Chery bénéficient d''une garantie constructeur de 5 ans ou 150 000 km (selon la première échéance atteinte).',
   'garantie', 3),
  (N'Comment annuler ou modifier un rendez-vous ?',
   N'Vous pouvez annuler ou modifier votre rendez-vous depuis votre espace client, rubrique "Mes rendez-vous". L''annulation est possible jusqu''à 24h avant l''heure prévue.',
   'rdv', 4),
  (N'Quels modes de paiement sont acceptés ?',
   N'Nous acceptons le paiement en espèces, par chèque et par virement bancaire. Le paiement par carte bancaire est disponible dans certaines agences.',
   'paiement', 5),
  (N'À quelle fréquence faire réviser mon véhicule ?',
   N'Une révision est recommandée tous les 10 000 km ou tous les 6 mois, selon la première échéance atteinte. Consultez votre carnet d''entretien pour les spécificités de votre modèle.',
   'entretien', 6);

  PRINT 'Table FAQ créée avec 6 FAQs initiales.';
END
ELSE
  PRINT 'Table FAQ existe déjà — ignorée.';
GO

-- 2. Historique des conversations chatbot
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'ChatHistory')
BEGIN
  CREATE TABLE ChatHistory (
    id          BIGINT       IDENTITY(1,1) PRIMARY KEY,
    client_id   BIGINT       NULL REFERENCES Utilisateur(id) ON DELETE SET NULL,
    session_id  NVARCHAR(100) NOT NULL,
    role        VARCHAR(10)  NOT NULL CHECK (role IN ('user', 'assistant')),
    contenu     NVARCHAR(MAX) NOT NULL,
    intent      VARCHAR(50)  NULL,       -- intent détecté (agence, package, rdv...)
    lang        VARCHAR(5)   NULL,       -- 'fr' ou 'ar'
    created_at  DATETIME     NOT NULL DEFAULT GETDATE()
  );

  CREATE INDEX IX_ChatHistory_client   ON ChatHistory(client_id);
  CREATE INDEX IX_ChatHistory_session  ON ChatHistory(session_id);
  CREATE INDEX IX_ChatHistory_date     ON ChatHistory(created_at);

  PRINT 'Table ChatHistory créée.';
END
ELSE
  PRINT 'Table ChatHistory existe déjà — ignorée.';
GO

PRINT '';
PRINT '✅ Migration terminée. Relancez node scripts/syncRAG.js pour inclure les FAQs.';
GO
