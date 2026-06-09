USE [STA_SAV_DB]
GO
/****** Object:  Table [dbo].[Agence]    Script Date: 23/05/2026 8:15:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Agence](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[nom] [nvarchar](100) NOT NULL,
	[ville] [nvarchar](80) NOT NULL,
	[telephone] [nvarchar](20) NULL,
	[adresse] [nvarchar](255) NULL,
	[email] [varchar](255) NULL,
 CONSTRAINT [PK_Agence] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Utilisateur]    Script Date: 23/05/2026 8:15:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Utilisateur](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[nom] [nvarchar](100) NOT NULL,
	[prenom] [nvarchar](100) NOT NULL,
	[telephone] [nvarchar](20) NULL,
	[email] [nvarchar](150) NOT NULL,
	[mot_de_passe] [nvarchar](255) NOT NULL,
	[actif] [bit] NOT NULL,
	[date_creation] [datetime2](7) NOT NULL,
	[code_client] [nvarchar](30) NULL,
	[adresse] [nvarchar](255) NULL,
	[matricule] [nvarchar](30) NULL,
	[agence_id] [bigint] NULL,
	[niveau] [nvarchar](30) NULL,
	[fonction] [nvarchar](100) NULL,
	[telephone_verifie] [bit] NOT NULL,
	[role] [nvarchar](20) NULL,
 CONSTRAINT [PK_Utilisateur] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_Utilisateur_email] UNIQUE NONCLUSTERED 
(
	[email] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Marque]    Script Date: 23/05/2026 8:15:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Marque](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[nom] [nvarchar](80) NOT NULL,
	[logo_url] [nvarchar](500) NULL,
	[actif] [bit] NOT NULL,
 CONSTRAINT [PK_Marque] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_Marque_nom] UNIQUE NONCLUSTERED 
(
	[nom] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Modele]    Script Date: 23/05/2026 8:15:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Modele](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[marque_id] [bigint] NOT NULL,
	[nom] [nvarchar](100) NOT NULL,
	[annee_debut] [char](4) NULL,
	[annee_fin] [char](4) NULL,
	[actif] [bit] NOT NULL,
 CONSTRAINT [PK_Modele] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_Modele] UNIQUE NONCLUSTERED 
(
	[marque_id] ASC,
	[nom] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Version]    Script Date: 23/05/2026 8:15:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Version](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[modele_id] [bigint] NOT NULL,
	[nom] [nvarchar](100) NOT NULL,
	[motorisation] [nvarchar](100) NULL,
	[transmission] [nvarchar](30) NULL,
	[actif] [bit] NOT NULL,
 CONSTRAINT [PK_Version] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_Version] UNIQUE NONCLUSTERED 
(
	[modele_id] ASC,
	[nom] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Vehicule]    Script Date: 23/05/2026 8:15:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Vehicule](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[client_id] [bigint] NOT NULL,
	[version_id] [bigint] NOT NULL,
	[immatriculation] [nvarchar](20) NOT NULL,
	[numero_chassis] [nvarchar](17) NOT NULL,
	[couleur] [nvarchar](50) NULL,
	[annee] [smallint] NOT NULL,
	[date_ajout] [datetime2](7) NOT NULL,
	[statut_validation] [varchar](20) NOT NULL,
	[motif_refus] [nvarchar](255) NULL,
	[date_validation] [datetime2](7) NULL,
	[agent_validateur_id] [bigint] NULL,
	[image_vehicule] [nvarchar](max) NULL,
	[image_carte_grise] [nvarchar](max) NULL,
	[agent_validation_id] [bigint] NULL,
 CONSTRAINT [PK_Vehicule] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_Vehicule_Chassis] UNIQUE NONCLUSTERED 
(
	[numero_chassis] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_Vehicule_Immat] UNIQUE NONCLUSTERED 
(
	[immatriculation] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[RendezVous]    Script Date: 23/05/2026 8:15:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[RendezVous](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[client_id] [bigint] NOT NULL,
	[agent_id] [bigint] NULL,
	[vehicule_id] [bigint] NOT NULL,
	[agence_id] [bigint] NOT NULL,
	[date_heure] [datetime2](7) NOT NULL,
	[statut] [varchar](20) NOT NULL,
	[description] [nvarchar](max) NULL,
	[duree_estimee] [int] NULL,
	[heure_reelle_debut] [datetime2](7) NULL,
	[heure_reelle_fin] [datetime2](7) NULL,
	[date_creation] [datetime2](7) NOT NULL,
	[date_modification] [datetime2](7) NULL,
	[raison_annulation] [nvarchar](255) NULL,
	[date_annulation] [datetime2](7) NULL,
	[utilisateur_annulation] [bigint] NULL,
	[email_confirmation] [bit] NOT NULL,
	[sms_confirmation] [bit] NOT NULL,
	[rappel_24h_sent] [bit] NOT NULL,
	[rappel_2h_sent] [bit] NOT NULL,
	[feedback_note] [tinyint] NULL,
	[feedback_commentaire] [nvarchar](500) NULL,
	[date_feedback] [datetime2](7) NULL,
 CONSTRAINT [PK_RDV] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  View [dbo].[VW_PlanningRDV]    Script Date: 23/05/2026 8:15:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER OFF
GO

CREATE VIEW [dbo].[VW_PlanningRDV] AS
SELECT 
    rdv.id AS rdv_id,
    c.nom AS client_nom,
    c.prenom AS client_prenom,
    c.telephone AS client_telephone,
    v.immatriculation AS vehicule_immatriculation,
    m.nom AS vehicule_marque,
    mod.nom AS vehicule_modele,
    ag.id AS agence_id,
    ag.nom AS agence_nom,
    ag.ville AS agence_ville,
    rdv.date_heure,
    rdv.statut,
    rdv.description,
    rdv.duree_estimee,
    NULL AS type_intervention,
    NULL AS sous_type_intervention,
    agent.id AS agent_id,
    agent.nom AS agent_nom,
    agent.prenom AS agent_prenom
FROM RendezVous rdv
    INNER JOIN Utilisateur c ON rdv.client_id = c.id
    INNER JOIN Vehicule v ON rdv.vehicule_id = v.id
    INNER JOIN Version ver ON v.version_id = ver.id
    INNER JOIN Modele mod ON ver.modele_id = mod.id
    INNER JOIN Marque m ON mod.marque_id = m.id
    INNER JOIN Agence ag ON rdv.agence_id = ag.id
    LEFT JOIN Utilisateur agent ON rdv.agent_id = agent.id
WHERE rdv.statut != 'ANNULE';
GO
/****** Object:  Table [dbo].[Reclamation]    Script Date: 23/05/2026 8:15:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Reclamation](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[numero] [nvarchar](30) NOT NULL,
	[client_id] [bigint] NOT NULL,
	[agent_id] [bigint] NULL,
	[objet] [nvarchar](200) NOT NULL,
	[description] [nvarchar](max) NULL,
	[statut] [varchar](20) NOT NULL,
	[date_soumission] [datetime2](7) NOT NULL,
	[date_traitement] [datetime2](7) NULL,
	[date_cloture] [datetime2](7) NULL,
	[appointment_id] [bigint] NULL,
 CONSTRAINT [PK_Reclamation] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_Rec_numero] UNIQUE NONCLUSTERED 
(
	[numero] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  View [dbo].[VW_ReclamationsOuvertes]    Script Date: 23/05/2026 8:15:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE VIEW [dbo].[VW_ReclamationsOuvertes] AS
SELECT
    r.id, r.numero, r.objet, r.statut, r.date_soumission,
    DATEDIFF(DAY, r.date_soumission, GETDATE()) AS jours_ouvert,
    c.nom + ' ' + c.prenom AS client_nom, c.telephone AS client_tel,
    a.nom + ' ' + a.prenom AS agent_nom
FROM Reclamation r
JOIN Utilisateur c ON c.id = r.client_id
LEFT JOIN Utilisateur a ON a.id = r.agent_id
WHERE r.statut NOT IN ('CLOTUREE');
GO
/****** Object:  Table [dbo].[SousTypeIntervention]    Script Date: 23/05/2026 8:15:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[SousTypeIntervention](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[type_intervention_id] [bigint] NOT NULL,
	[nom] [nvarchar](150) NOT NULL,
	[duree_estimee] [int] NULL,
 CONSTRAINT [PK_SousType] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[InterventionRDV]    Script Date: 23/05/2026 8:15:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[InterventionRDV](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[rdv_id] [bigint] NOT NULL,
	[sous_type_id] [bigint] NOT NULL,
	[statut] [varchar](20) NOT NULL,
	[duree_reelle] [int] NULL,
	[commentaire] [nvarchar](max) NULL,
	[date_debut] [datetime2](7) NULL,
	[date_fin] [datetime2](7) NULL,
	[cout_reel] [decimal](10, 2) NULL,
	[date_creation] [datetime2](7) NOT NULL,
 CONSTRAINT [PK_IntRDV] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  View [dbo].[VW_HistoriqueVehicule]    Script Date: 23/05/2026 8:15:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE VIEW [dbo].[VW_HistoriqueVehicule] AS
SELECT
    vh.immatriculation,
    ma.nom AS marque, mo.nom AS modele, ve.nom AS version_nom,
    r.id AS rdv_id, r.date_heure, r.statut AS statut_rdv,
    ir.id AS intervention_id,
    st.nom AS sous_type, ir.duree_reelle,
    ir.statut AS statut_intervention, ir.commentaire
FROM Vehicule vh
JOIN Version    ve ON ve.id = vh.version_id
JOIN Modele     mo ON mo.id = ve.modele_id
JOIN Marque     ma ON ma.id = mo.marque_id
LEFT JOIN RendezVous r ON r.vehicule_id = vh.id
LEFT JOIN InterventionRDV ir ON ir.rdv_id = r.id
LEFT JOIN SousTypeIntervention st ON st.id = ir.sous_type_id;
GO
/****** Object:  View [dbo].[VW_StatsAgence]    Script Date: 23/05/2026 8:15:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[VW_StatsAgence] AS
SELECT 
    ag.id AS agence_id,
    ag.nom AS agence_nom,
    ag.ville,
    COUNT(r.id) AS total_rdv,
    SUM(CASE WHEN r.statut = 'TERMINE' THEN 1 ELSE 0 END) AS rdv_termines,
    SUM(CASE WHEN r.statut = 'ANNULE' THEN 1 ELSE 0 END) AS rdv_annules,
    SUM(CASE WHEN r.statut = 'NO_SHOW' THEN 1 ELSE 0 END) AS rdv_no_show,
    AVG(DATEDIFF(MINUTE, r.heure_reelle_debut, r.heure_reelle_fin)) AS duree_moy_min
FROM Agence ag
LEFT JOIN RendezVous r ON r.agence_id = ag.id
GROUP BY ag.id, ag.nom, ag.ville;
GO
/****** Object:  View [dbo].[VW_PiecesJointes]    Script Date: 23/05/2026 8:15:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- Créer une vue pour faciliter les requêtes
CREATE VIEW [dbo].[VW_PiecesJointes] AS
SELECT 
	pj.id,
	pj.rdv_id,
	pj.nom_fichier,
	pj.nom_original,
	pj.type_fichier,
	pj.taille_ko,
	pj.url_stockage,
	pj.description,
	pj.date_ajout,
	u.nom + ' ' + u.prenom AS ajoute_par_nom,
	u.role_id AS ajoute_par_role_id,
	ro.nom AS ajoute_par_role_nom,
	r.statut AS rdv_statut,
	r.date_heure AS rdv_date
FROM PiecesJointes pj
JOIN Utilisateur u ON u.id = pj.ajoute_par
JOIN Role ro ON ro.id = u.role_id
JOIN RendezVous r ON r.id = pj.rdv_id
GO
/****** Object:  View [dbo].[VueMessagesActifs]    Script Date: 23/05/2026 8:15:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER OFF
GO

-- Vue: Messages actifs avec statistiques de lecture
CREATE   VIEW [dbo].[VueMessagesActifs] AS
SELECT 
    m.id,
    m.titre,
    m.contenu,
    m.type,
    m.priorite,
    m.date_debut,
    m.date_fin,
    m.afficher_accueil,
    m.afficher_dashboard,
    m.couleur_fond,
    m.icone,
    m.lien_url,
    m.lien_texte,
    -- Agence
    a.id AS agence_id,
    a.nom AS agence_nom,
    -- CrÃ©ateur
    u.nom AS created_by_nom,
    u.prenom AS created_by_prenom,
    m.created_at,
    -- Statistiques
    (SELECT COUNT(*) FROM MessageLecture ml WHERE ml.message_id = m.id) AS nb_lectures
FROM MessageAccueil m
LEFT JOIN Agence a ON m.agence_id = a.id
INNER JOIN Utilisateur u ON m.created_by = u.id
WHERE m.actif = 1
  AND GETDATE() >= m.date_debut
  AND (m.date_fin IS NULL OR GETDATE() <= m.date_fin);
GO
/****** Object:  Table [dbo].[PromotionVehicule]    Script Date: 23/05/2026 8:15:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PromotionVehicule](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[titre] [nvarchar](255) NOT NULL,
	[description] [nvarchar](max) NULL,
	[marque_id] [bigint] NULL,
	[modele_id] [bigint] NULL,
	[version_id] [bigint] NULL,
	[prix_original] [decimal](18, 2) NULL,
	[prix_promotion] [decimal](18, 2) NOT NULL,
	[pourcentage_reduction] [decimal](5, 2) NULL,
	[image_url] [nvarchar](500) NULL,
	[date_debut] [date] NOT NULL,
	[date_fin] [date] NOT NULL,
	[actif] [bit] NULL,
	[stock_disponible] [int] NULL,
	[conditions] [nvarchar](max) NULL,
	[agence_id] [bigint] NULL,
	[created_by] [bigint] NULL,
	[created_at] [datetime] NULL,
	[updated_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  View [dbo].[VuePromotionsActives]    Script Date: 23/05/2026 8:15:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER OFF
GO
CREATE   VIEW [dbo].[VuePromotionsActives] AS SELECT p.id, p.titre, p.description, p.prix_original, p.prix_promotion, p.pourcentage_reduction, p.image_url, p.date_debut, p.date_fin, p.stock_disponible, p.conditions, mar.id AS marque_id, mar.nom AS marque_nom, mar.logo_url AS marque_logo, mod.id AS modele_id, mod.nom AS modele_nom, ver.id AS version_id, ver.nom AS version_nom, a.id AS agence_id, a.nom AS agence_nom, a.adresse AS agence_adresse, a.telephone AS agence_telephone, u.nom AS created_by_nom, u.prenom AS created_by_prenom, p.created_at FROM PromotionVehicule p LEFT JOIN Marque mar ON p.marque_id = mar.id LEFT JOIN Modele mod ON p.modele_id = mod.id LEFT JOIN Version ver ON p.version_id = ver.id LEFT JOIN Agence a ON p.agence_id = a.id INNER JOIN Utilisateur u ON p.created_by = u.id WHERE p.actif = 1 AND CAST(GETDATE() AS DATE) BETWEEN p.date_debut AND p.date_fin;
GO
/****** Object:  Table [dbo].[SectionInformation]    Script Date: 23/05/2026 8:15:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[SectionInformation](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[titre] [nvarchar](200) NOT NULL,
	[slug] [nvarchar](200) NOT NULL,
	[icone] [nvarchar](50) NULL,
	[ordre] [int] NOT NULL,
	[actif] [bit] NOT NULL,
	[date_creation] [datetime] NOT NULL,
	[date_modification] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[slug] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ContenuInformation]    Script Date: 23/05/2026 8:15:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ContenuInformation](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[section_id] [int] NOT NULL,
	[titre] [nvarchar](300) NOT NULL,
	[contenu] [nvarchar](max) NOT NULL,
	[ordre] [int] NOT NULL,
	[actif] [bit] NOT NULL,
	[date_creation] [datetime] NOT NULL,
	[date_modification] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[DocumentTelecharge]    Script Date: 23/05/2026 8:15:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[DocumentTelecharge](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[section_id] [int] NULL,
	[titre] [nvarchar](300) NOT NULL,
	[description] [nvarchar](max) NULL,
	[nom_fichier] [nvarchar](500) NOT NULL,
	[chemin_fichier] [nvarchar](1000) NOT NULL,
	[type_fichier] [nvarchar](100) NULL,
	[taille_octets] [bigint] NULL,
	[nombre_telechargements] [int] NOT NULL,
	[actif] [bit] NOT NULL,
	[date_creation] [datetime] NOT NULL,
	[date_modification] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  View [dbo].[VueSectionsInformation]    Script Date: 23/05/2026 8:15:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE VIEW [dbo].[VueSectionsInformation] AS
SELECT 
    s.id,
    s.titre,
    s.slug,
    s.icone,
    s.ordre,
    s.actif,
    s.date_creation,
    s.date_modification,
    COUNT(DISTINCT c.id) as nombre_contenus,
    COUNT(DISTINCT d.id) as nombre_documents
FROM SectionInformation s
LEFT JOIN ContenuInformation c ON s.id = c.section_id AND c.actif = 1
LEFT JOIN DocumentTelecharge d ON s.id = d.section_id AND d.actif = 1
GROUP BY s.id, s.titre, s.slug, s.icone, s.ordre, s.actif, s.date_creation, s.date_modification;
GO
/****** Object:  Table [dbo].[Ouvrier]    Script Date: 23/05/2026 8:15:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Ouvrier](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[nom] [nvarchar](100) NOT NULL,
	[prenom] [nvarchar](100) NOT NULL,
	[telephone] [nvarchar](20) NULL,
	[email] [nvarchar](255) NULL,
	[specialite] [nvarchar](100) NULL,
	[niveau_competence] [nvarchar](50) NULL,
	[agence_id] [bigint] NOT NULL,
	[actif] [bit] NULL,
	[date_embauche] [date] NULL,
	[photo_url] [nvarchar](500) NULL,
	[notes] [nvarchar](max) NULL,
	[created_at] [datetime] NULL,
	[updated_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[AffectationOuvrier]    Script Date: 23/05/2026 8:15:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[AffectationOuvrier](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[rendez_vous_id] [bigint] NOT NULL,
	[ouvrier_id] [bigint] NOT NULL,
	[agent_id] [bigint] NOT NULL,
	[date_affectation] [datetime] NULL,
	[statut] [nvarchar](50) NULL,
	[notes_agent] [nvarchar](max) NULL,
	[created_at] [datetime] NULL,
	[updated_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  View [dbo].[VueAffectationsDetaillees]    Script Date: 23/05/2026 8:15:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER OFF
GO

CREATE VIEW [dbo].[VueAffectationsDetaillees] AS
SELECT 
    -- Affectation fields
    a.id AS affectation_id,
    a.rendez_vous_id,
    a.ouvrier_id,
    a.agent_id,
    a.date_affectation,
    a.statut,
    a.notes_agent,
    a.created_at AS affectation_created_at,
    a.updated_at AS affectation_updated_at,
    
    -- Ouvrier fields
    o.nom AS ouvrier_nom,
    o.prenom AS ouvrier_prenom,
    o.telephone AS ouvrier_telephone,
    o.email AS ouvrier_email,
    o.specialite AS ouvrier_specialite,
    o.niveau_competence AS ouvrier_niveau,
    o.agence_id,
    
    -- Agent fields
    agent.nom AS agent_nom,
    agent.prenom AS agent_prenom,
    
    -- Rendez-vous fields
    rdv.date_heure AS rdv_date_heure,
    rdv.statut AS rdv_statut,
    rdv.client_id,
    rdv.vehicule_id,
    
    -- Client fields
    client.nom AS client_nom,
    client.prenom AS client_prenom,
    client.telephone AS client_telephone,
    
    -- Vehicle fields
    v.immatriculation,
    v.version_id,
    
    -- Version, Model, Brand (via Version)
    ver.nom AS version,
    mod.nom AS modele,
    marque.nom AS marque,
    
    -- Agency
    ag.nom AS agence_nom
    
FROM AffectationOuvrier a
INNER JOIN Ouvrier o ON a.ouvrier_id = o.id
INNER JOIN Utilisateur agent ON a.agent_id = agent.id
INNER JOIN RendezVous rdv ON a.rendez_vous_id = rdv.id
INNER JOIN Utilisateur client ON rdv.client_id = client.id
INNER JOIN Vehicule v ON rdv.vehicule_id = v.id
INNER JOIN Version ver ON v.version_id = ver.id
INNER JOIN Modele mod ON ver.modele_id = mod.id
INNER JOIN Marque marque ON mod.marque_id = marque.id
INNER JOIN Agence ag ON o.agence_id = ag.id;

GO
/****** Object:  Table [dbo].[CommandeReparation]    Script Date: 23/05/2026 8:15:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CommandeReparation](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[numero] [varchar](50) NULL,
	[rdv_id] [bigint] NULL,
	[client_id] [bigint] NULL,
	[vehicule_id] [bigint] NULL,
	[agence_id] [bigint] NULL,
	[statut] [varchar](20) NULL,
	[montant_total] [decimal](10, 2) NULL,
	[date_creation] [datetime2](7) NULL,
	[date_validation] [datetime2](7) NULL,
	[date_fin] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[numero] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Couleur]    Script Date: 23/05/2026 8:15:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Couleur](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[nom] [nvarchar](50) NOT NULL,
	[code_hex] [varchar](7) NULL,
	[actif] [bit] NOT NULL,
 CONSTRAINT [PK_Couleur] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Diagnostic]    Script Date: 23/05/2026 8:15:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Diagnostic](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[rdv_id] [bigint] NOT NULL,
	[agent_id] [bigint] NOT NULL,
	[observations_generales] [nvarchar](max) NULL,
	[recommandations] [nvarchar](max) NULL,
	[date_creation] [datetime2](7) NOT NULL,
	[date_modification] [datetime2](7) NULL,
 CONSTRAINT [PK_Diagnostic] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Document]    Script Date: 23/05/2026 8:15:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Document](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[titre] [nvarchar](200) NOT NULL,
	[description] [nvarchar](max) NULL,
	[url] [nvarchar](500) NOT NULL,
	[categorie] [nvarchar](50) NOT NULL,
	[type_mime] [nvarchar](100) NULL,
	[taille_mo] [decimal](8, 2) NULL,
	[admin_id] [bigint] NOT NULL,
	[actif] [bit] NOT NULL,
	[date_creation] [datetime2](7) NOT NULL,
 CONSTRAINT [PK_Document] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Facture]    Script Date: 23/05/2026 8:15:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Facture](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[numero] [varchar](50) NULL,
	[commande_id] [bigint] NULL,
	[montant_ht] [decimal](10, 2) NULL,
	[montant_tva] [decimal](10, 2) NULL,
	[montant_ttc] [decimal](10, 2) NULL,
	[statut] [varchar](20) NULL,
	[mode_paiement] [varchar](50) NULL,
	[date_emission] [datetime2](7) NULL,
	[date_paiement] [datetime2](7) NULL,
	[date_envoi] [datetime2](7) NULL,
	[notes] [nvarchar](max) NULL,
	[taux_tva] [decimal](5, 2) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[numero] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Feedback]    Script Date: 23/05/2026 8:15:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Feedback](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[rendez_vous_id] [bigint] NOT NULL,
	[note] [int] NOT NULL,
	[commentaire] [nvarchar](1000) NULL,
	[date_feedback] [datetime2](7) NULL,
	[appointment_id] [bigint] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[HistoriqueRDV]    Script Date: 23/05/2026 8:15:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[HistoriqueRDV](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[rdv_id] [bigint] NOT NULL,
	[ancien_statut] [varchar](30) NULL,
	[nouveau_statut] [varchar](30) NOT NULL,
	[utilisateur_id] [bigint] NULL,
	[remarque] [nvarchar](255) NULL,
	[date_changement] [datetime2](7) NOT NULL,
 CONSTRAINT [PK_HistRDV] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[InterventionCatalog]    Script Date: 23/05/2026 8:15:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[InterventionCatalog](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[nom] [nvarchar](255) NOT NULL,
	[description] [nvarchar](max) NULL,
	[prix] [decimal](10, 2) NULL,
	[duree_estimee_min] [int] NULL,
	[actif] [bit] NULL,
	[date_creation] [datetime] NULL,
	[date_modification] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[LigneCommande]    Script Date: 23/05/2026 8:15:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[LigneCommande](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[commande_id] [bigint] NULL,
	[type] [varchar](20) NULL,
	[intervention_id] [bigint] NULL,
	[piece_id] [bigint] NULL,
	[quantite] [int] NULL,
	[prix_unitaire] [decimal](10, 2) NULL,
	[prix_total] [decimal](10, 2) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Notification]    Script Date: 23/05/2026 8:15:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Notification](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[utilisateur_id] [bigint] NOT NULL,
	[titre] [nvarchar](200) NOT NULL,
	[message] [nvarchar](max) NOT NULL,
	[lu] [bit] NOT NULL,
	[type] [varchar](10) NOT NULL,
	[entite_type] [nvarchar](20) NULL,
	[entite_id] [bigint] NULL,
	[date_envoi] [datetime2](7) NOT NULL,
 CONSTRAINT [PK_Notification] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Package_SousType]    Script Date: 23/05/2026 8:15:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Package_SousType](
	[package_id] [bigint] NOT NULL,
	[sous_type_id] [bigint] NOT NULL,
 CONSTRAINT [PK_Package_SousType] PRIMARY KEY CLUSTERED 
(
	[package_id] ASC,
	[sous_type_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[PackageIntervention]    Script Date: 23/05/2026 8:15:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PackageIntervention](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[nom] [nvarchar](150) NOT NULL,
	[description] [nvarchar](500) NULL,
	[prix] [decimal](10, 3) NOT NULL,
	[actif] [bit] NOT NULL,
	[duree_estimee] [nvarchar](50) NULL,
 CONSTRAINT [PK_Package] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_Package_nom] UNIQUE NONCLUSTERED 
(
	[nom] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[PieceJointe]    Script Date: 23/05/2026 8:15:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PieceJointe](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[entite_type] [nvarchar](20) NOT NULL,
	[entite_id] [bigint] NOT NULL,
	[url] [nvarchar](500) NOT NULL,
	[type_mime] [nvarchar](100) NULL,
	[taille_mo] [decimal](8, 2) NULL,
	[date_upload] [datetime2](7) NOT NULL,
	[statut_moderation] [nvarchar](20) NULL,
	[modere_par] [bigint] NULL,
	[date_moderation] [datetime2](7) NULL,
	[commentaire_moderation] [nvarchar](500) NULL,
 CONSTRAINT [PK_PieceJointe] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[PlageHoraire]    Script Date: 23/05/2026 8:15:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PlageHoraire](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[agence_id] [bigint] NOT NULL,
	[jour_semaine] [tinyint] NOT NULL,
	[heure_ouverture] [time](7) NOT NULL,
	[heure_fermeture] [time](7) NOT NULL,
	[capacite] [int] NOT NULL,
 CONSTRAINT [PK_PlageHoraire] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_PlageHoraire] UNIQUE NONCLUSTERED 
(
	[agence_id] ASC,
	[jour_semaine] ASC,
	[heure_ouverture] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ProblemePredefini]    Script Date: 23/05/2026 8:15:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ProblemePredefini](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[nom] [nvarchar](150) NOT NULL,
	[description] [nvarchar](max) NULL,
	[solution] [nvarchar](max) NULL,
	[categorie] [nvarchar](50) NOT NULL,
	[actif] [bit] NOT NULL,
	[date_creation] [datetime2](7) NOT NULL,
 CONSTRAINT [PK_ProblemePredefini] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ProblemesDiagnostic]    Script Date: 23/05/2026 8:15:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ProblemesDiagnostic](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[diagnostic_id] [bigint] NOT NULL,
	[probleme_id] [bigint] NOT NULL,
	[description_specifique] [nvarchar](max) NULL,
	[gravite] [nvarchar](20) NULL,
	[date_ajout] [datetime2](7) NOT NULL,
 CONSTRAINT [PK_ProblemesDiagnostic] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Promotion]    Script Date: 23/05/2026 8:15:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Promotion](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[admin_id] [bigint] NOT NULL,
	[titre] [nvarchar](200) NOT NULL,
	[image_url] [nvarchar](500) NULL,
	[date_debut] [datetime2](7) NOT NULL,
	[date_fin] [datetime2](7) NOT NULL,
	[actif] [bit] NOT NULL,
	[date_creation] [datetime2](7) NOT NULL,
	[description] [nvarchar](max) NULL,
 CONSTRAINT [PK_Promotion] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[RDV_Package]    Script Date: 23/05/2026 8:15:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[RDV_Package](
	[rdv_id] [bigint] NOT NULL,
	[package_id] [bigint] NOT NULL,
	[quantite] [int] NOT NULL,
	[prix_unitaire] [decimal](10, 3) NOT NULL,
 CONSTRAINT [PK_RDV_Package] PRIMARY KEY CLUSTERED 
(
	[rdv_id] ASC,
	[package_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[StatutIntervention]    Script Date: 23/05/2026 8:15:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[StatutIntervention](
	[code] [varchar](20) NOT NULL,
	[libelle] [nvarchar](50) NOT NULL,
 CONSTRAINT [PK_StatutIntervention] PRIMARY KEY CLUSTERED 
(
	[code] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[StatutRDV]    Script Date: 23/05/2026 8:15:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[StatutRDV](
	[code] [varchar](20) NOT NULL,
	[libelle] [nvarchar](50) NOT NULL,
 CONSTRAINT [PK_StatutRDV] PRIMARY KEY CLUSTERED 
(
	[code] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[StatutReclamation]    Script Date: 23/05/2026 8:15:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[StatutReclamation](
	[code] [varchar](20) NOT NULL,
	[libelle] [nvarchar](50) NOT NULL,
 CONSTRAINT [PK_StatutRec] PRIMARY KEY CLUSTERED 
(
	[code] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TypeIntervention]    Script Date: 23/05/2026 8:15:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TypeIntervention](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[nom] [nvarchar](100) NOT NULL,
	[delai_moyen] [int] NULL,
 CONSTRAINT [PK_TypeInt] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_TypeInt_nom] UNIQUE NONCLUSTERED 
(
	[nom] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TypeNotification]    Script Date: 23/05/2026 8:15:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TypeNotification](
	[code] [varchar](10) NOT NULL,
	[libelle] [nvarchar](30) NOT NULL,
 CONSTRAINT [PK_TypeNotif] PRIMARY KEY CLUSTERED 
(
	[code] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[ContenuInformation] ADD  DEFAULT ((0)) FOR [ordre]
GO
ALTER TABLE [dbo].[ContenuInformation] ADD  DEFAULT ((1)) FOR [actif]
GO
ALTER TABLE [dbo].[ContenuInformation] ADD  DEFAULT (getdate()) FOR [date_creation]
GO
ALTER TABLE [dbo].[Couleur] ADD  DEFAULT ((1)) FOR [actif]
GO
ALTER TABLE [dbo].[Diagnostic] ADD  DEFAULT (getdate()) FOR [date_creation]
GO
ALTER TABLE [dbo].[Document] ADD  DEFAULT ((1)) FOR [actif]
GO
ALTER TABLE [dbo].[Document] ADD  DEFAULT (getdate()) FOR [date_creation]
GO
ALTER TABLE [dbo].[DocumentTelecharge] ADD  DEFAULT ((0)) FOR [nombre_telechargements]
GO
ALTER TABLE [dbo].[DocumentTelecharge] ADD  DEFAULT ((1)) FOR [actif]
GO
ALTER TABLE [dbo].[DocumentTelecharge] ADD  DEFAULT (getdate()) FOR [date_creation]
GO
ALTER TABLE [dbo].[Feedback] ADD  DEFAULT (getdate()) FOR [date_feedback]
GO
ALTER TABLE [dbo].[HistoriqueRDV] ADD  DEFAULT (getdate()) FOR [date_changement]
GO
ALTER TABLE [dbo].[InterventionCatalog] ADD  DEFAULT ((1)) FOR [actif]
GO
ALTER TABLE [dbo].[InterventionCatalog] ADD  DEFAULT (getdate()) FOR [date_creation]
GO
ALTER TABLE [dbo].[InterventionCatalog] ADD  DEFAULT (getdate()) FOR [date_modification]
GO
ALTER TABLE [dbo].[InterventionRDV] ADD  DEFAULT ('EN_ATTENTE') FOR [statut]
GO
ALTER TABLE [dbo].[InterventionRDV] ADD  DEFAULT (getdate()) FOR [date_creation]
GO
ALTER TABLE [dbo].[Marque] ADD  DEFAULT ((1)) FOR [actif]
GO
ALTER TABLE [dbo].[Modele] ADD  DEFAULT ((1)) FOR [actif]
GO
ALTER TABLE [dbo].[Notification] ADD  DEFAULT ((0)) FOR [lu]
GO
ALTER TABLE [dbo].[Notification] ADD  DEFAULT ('PUSH') FOR [type]
GO
ALTER TABLE [dbo].[Notification] ADD  DEFAULT (getdate()) FOR [date_envoi]
GO
ALTER TABLE [dbo].[Ouvrier] ADD  DEFAULT ((1)) FOR [actif]
GO
ALTER TABLE [dbo].[Ouvrier] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[Ouvrier] ADD  DEFAULT (getdate()) FOR [updated_at]
GO
ALTER TABLE [dbo].[PackageIntervention] ADD  DEFAULT ((0)) FOR [prix]
GO
ALTER TABLE [dbo].[PackageIntervention] ADD  DEFAULT ((1)) FOR [actif]
GO
ALTER TABLE [dbo].[PieceJointe] ADD  DEFAULT (getdate()) FOR [date_upload]
GO
ALTER TABLE [dbo].[PieceJointe] ADD  DEFAULT ('EN_ATTENTE') FOR [statut_moderation]
GO
ALTER TABLE [dbo].[PlageHoraire] ADD  DEFAULT ((4)) FOR [capacite]
GO
ALTER TABLE [dbo].[ProblemePredefini] ADD  DEFAULT ((1)) FOR [actif]
GO
ALTER TABLE [dbo].[ProblemePredefini] ADD  DEFAULT (getdate()) FOR [date_creation]
GO
ALTER TABLE [dbo].[ProblemesDiagnostic] ADD  DEFAULT (getdate()) FOR [date_ajout]
GO
ALTER TABLE [dbo].[Promotion] ADD  DEFAULT ((1)) FOR [actif]
GO
ALTER TABLE [dbo].[Promotion] ADD  DEFAULT (getdate()) FOR [date_creation]
GO
ALTER TABLE [dbo].[PromotionVehicule] ADD  DEFAULT ((1)) FOR [actif]
GO
ALTER TABLE [dbo].[PromotionVehicule] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[PromotionVehicule] ADD  DEFAULT (getdate()) FOR [updated_at]
GO
ALTER TABLE [dbo].[RDV_Package] ADD  DEFAULT ((1)) FOR [quantite]
GO
ALTER TABLE [dbo].[RDV_Package] ADD  DEFAULT ((0)) FOR [prix_unitaire]
GO
ALTER TABLE [dbo].[Reclamation] ADD  DEFAULT ('SOUMISE') FOR [statut]
GO
ALTER TABLE [dbo].[Reclamation] ADD  DEFAULT (getdate()) FOR [date_soumission]
GO
ALTER TABLE [dbo].[RendezVous] ADD  DEFAULT ('PLANIFIE') FOR [statut]
GO
ALTER TABLE [dbo].[RendezVous] ADD  DEFAULT (getdate()) FOR [date_creation]
GO
ALTER TABLE [dbo].[RendezVous] ADD  DEFAULT ((0)) FOR [email_confirmation]
GO
ALTER TABLE [dbo].[RendezVous] ADD  DEFAULT ((0)) FOR [sms_confirmation]
GO
ALTER TABLE [dbo].[RendezVous] ADD  DEFAULT ((0)) FOR [rappel_24h_sent]
GO
ALTER TABLE [dbo].[RendezVous] ADD  DEFAULT ((0)) FOR [rappel_2h_sent]
GO
ALTER TABLE [dbo].[SectionInformation] ADD  DEFAULT ((0)) FOR [ordre]
GO
ALTER TABLE [dbo].[SectionInformation] ADD  DEFAULT ((1)) FOR [actif]
GO
ALTER TABLE [dbo].[SectionInformation] ADD  DEFAULT (getdate()) FOR [date_creation]
GO
ALTER TABLE [dbo].[Utilisateur] ADD  DEFAULT ((1)) FOR [actif]
GO
ALTER TABLE [dbo].[Utilisateur] ADD  DEFAULT (getdate()) FOR [date_creation]
GO
ALTER TABLE [dbo].[Utilisateur] ADD  DEFAULT ((0)) FOR [telephone_verifie]
GO
ALTER TABLE [dbo].[Vehicule] ADD  DEFAULT (getdate()) FOR [date_ajout]
GO
ALTER TABLE [dbo].[Vehicule] ADD  CONSTRAINT [DF_Vehicule_StatutValidation]  DEFAULT ('EN_ATTENTE') FOR [statut_validation]
GO
ALTER TABLE [dbo].[Version] ADD  DEFAULT ((1)) FOR [actif]
GO
ALTER TABLE [dbo].[AffectationOuvrier]  WITH CHECK ADD  CONSTRAINT [FK_AffectationOuvrier_Agent] FOREIGN KEY([agent_id])
REFERENCES [dbo].[Utilisateur] ([id])
GO
ALTER TABLE [dbo].[AffectationOuvrier] CHECK CONSTRAINT [FK_AffectationOuvrier_Agent]
GO
ALTER TABLE [dbo].[AffectationOuvrier]  WITH CHECK ADD  CONSTRAINT [FK_AffectationOuvrier_Ouvrier] FOREIGN KEY([ouvrier_id])
REFERENCES [dbo].[Ouvrier] ([id])
GO
ALTER TABLE [dbo].[AffectationOuvrier] CHECK CONSTRAINT [FK_AffectationOuvrier_Ouvrier]
GO
ALTER TABLE [dbo].[AffectationOuvrier]  WITH CHECK ADD  CONSTRAINT [FK_AffectationOuvrier_RendezVous] FOREIGN KEY([rendez_vous_id])
REFERENCES [dbo].[RendezVous] ([id])
GO
ALTER TABLE [dbo].[AffectationOuvrier] CHECK CONSTRAINT [FK_AffectationOuvrier_RendezVous]
GO
ALTER TABLE [dbo].[ContenuInformation]  WITH CHECK ADD FOREIGN KEY([section_id])
REFERENCES [dbo].[SectionInformation] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[Diagnostic]  WITH CHECK ADD  CONSTRAINT [FK_Diagnostic_Agent] FOREIGN KEY([agent_id])
REFERENCES [dbo].[Utilisateur] ([id])
GO
ALTER TABLE [dbo].[Diagnostic] CHECK CONSTRAINT [FK_Diagnostic_Agent]
GO
ALTER TABLE [dbo].[Diagnostic]  WITH CHECK ADD  CONSTRAINT [FK_Diagnostic_RDV] FOREIGN KEY([rdv_id])
REFERENCES [dbo].[RendezVous] ([id])
GO
ALTER TABLE [dbo].[Diagnostic] CHECK CONSTRAINT [FK_Diagnostic_RDV]
GO
ALTER TABLE [dbo].[Document]  WITH CHECK ADD  CONSTRAINT [FK_Document_Admin] FOREIGN KEY([admin_id])
REFERENCES [dbo].[Utilisateur] ([id])
GO
ALTER TABLE [dbo].[Document] CHECK CONSTRAINT [FK_Document_Admin]
GO
ALTER TABLE [dbo].[DocumentTelecharge]  WITH CHECK ADD FOREIGN KEY([section_id])
REFERENCES [dbo].[SectionInformation] ([id])
ON DELETE SET NULL
GO
ALTER TABLE [dbo].[Feedback]  WITH CHECK ADD FOREIGN KEY([rendez_vous_id])
REFERENCES [dbo].[RendezVous] ([id])
GO
ALTER TABLE [dbo].[HistoriqueRDV]  WITH CHECK ADD  CONSTRAINT [FK_HistRDV_RDV] FOREIGN KEY([rdv_id])
REFERENCES [dbo].[RendezVous] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[HistoriqueRDV] CHECK CONSTRAINT [FK_HistRDV_RDV]
GO
ALTER TABLE [dbo].[HistoriqueRDV]  WITH CHECK ADD  CONSTRAINT [FK_HistRDV_User] FOREIGN KEY([utilisateur_id])
REFERENCES [dbo].[Utilisateur] ([id])
GO
ALTER TABLE [dbo].[HistoriqueRDV] CHECK CONSTRAINT [FK_HistRDV_User]
GO
ALTER TABLE [dbo].[InterventionRDV]  WITH CHECK ADD  CONSTRAINT [FK_IntRDV_RDV] FOREIGN KEY([rdv_id])
REFERENCES [dbo].[RendezVous] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[InterventionRDV] CHECK CONSTRAINT [FK_IntRDV_RDV]
GO
ALTER TABLE [dbo].[InterventionRDV]  WITH CHECK ADD  CONSTRAINT [FK_IntRDV_SousType] FOREIGN KEY([sous_type_id])
REFERENCES [dbo].[SousTypeIntervention] ([id])
GO
ALTER TABLE [dbo].[InterventionRDV] CHECK CONSTRAINT [FK_IntRDV_SousType]
GO
ALTER TABLE [dbo].[InterventionRDV]  WITH CHECK ADD  CONSTRAINT [FK_IntRDV_Statut] FOREIGN KEY([statut])
REFERENCES [dbo].[StatutIntervention] ([code])
GO
ALTER TABLE [dbo].[InterventionRDV] CHECK CONSTRAINT [FK_IntRDV_Statut]
GO
ALTER TABLE [dbo].[Modele]  WITH CHECK ADD  CONSTRAINT [FK_Modele_Marque] FOREIGN KEY([marque_id])
REFERENCES [dbo].[Marque] ([id])
GO
ALTER TABLE [dbo].[Modele] CHECK CONSTRAINT [FK_Modele_Marque]
GO
ALTER TABLE [dbo].[Notification]  WITH CHECK ADD  CONSTRAINT [FK_Notif_Type] FOREIGN KEY([type])
REFERENCES [dbo].[TypeNotification] ([code])
GO
ALTER TABLE [dbo].[Notification] CHECK CONSTRAINT [FK_Notif_Type]
GO
ALTER TABLE [dbo].[Notification]  WITH CHECK ADD  CONSTRAINT [FK_Notif_User] FOREIGN KEY([utilisateur_id])
REFERENCES [dbo].[Utilisateur] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[Notification] CHECK CONSTRAINT [FK_Notif_User]
GO
ALTER TABLE [dbo].[Ouvrier]  WITH CHECK ADD  CONSTRAINT [FK_Ouvrier_Agence] FOREIGN KEY([agence_id])
REFERENCES [dbo].[Agence] ([id])
GO
ALTER TABLE [dbo].[Ouvrier] CHECK CONSTRAINT [FK_Ouvrier_Agence]
GO
ALTER TABLE [dbo].[Package_SousType]  WITH CHECK ADD  CONSTRAINT [FK_PkgST_Package] FOREIGN KEY([package_id])
REFERENCES [dbo].[PackageIntervention] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[Package_SousType] CHECK CONSTRAINT [FK_PkgST_Package]
GO
ALTER TABLE [dbo].[Package_SousType]  WITH CHECK ADD  CONSTRAINT [FK_PkgST_SousType] FOREIGN KEY([sous_type_id])
REFERENCES [dbo].[SousTypeIntervention] ([id])
GO
ALTER TABLE [dbo].[Package_SousType] CHECK CONSTRAINT [FK_PkgST_SousType]
GO
ALTER TABLE [dbo].[PlageHoraire]  WITH CHECK ADD  CONSTRAINT [FK_PlageHoraire_Agence] FOREIGN KEY([agence_id])
REFERENCES [dbo].[Agence] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[PlageHoraire] CHECK CONSTRAINT [FK_PlageHoraire_Agence]
GO
ALTER TABLE [dbo].[ProblemesDiagnostic]  WITH CHECK ADD  CONSTRAINT [FK_ProblemesDiagnostic_Diagnostic] FOREIGN KEY([diagnostic_id])
REFERENCES [dbo].[Diagnostic] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[ProblemesDiagnostic] CHECK CONSTRAINT [FK_ProblemesDiagnostic_Diagnostic]
GO
ALTER TABLE [dbo].[ProblemesDiagnostic]  WITH CHECK ADD  CONSTRAINT [FK_ProblemesDiagnostic_Probleme] FOREIGN KEY([probleme_id])
REFERENCES [dbo].[ProblemePredefini] ([id])
GO
ALTER TABLE [dbo].[ProblemesDiagnostic] CHECK CONSTRAINT [FK_ProblemesDiagnostic_Probleme]
GO
ALTER TABLE [dbo].[Promotion]  WITH CHECK ADD  CONSTRAINT [FK_Promo_Admin] FOREIGN KEY([admin_id])
REFERENCES [dbo].[Utilisateur] ([id])
GO
ALTER TABLE [dbo].[Promotion] CHECK CONSTRAINT [FK_Promo_Admin]
GO
ALTER TABLE [dbo].[PromotionVehicule]  WITH CHECK ADD  CONSTRAINT [FK_PromotionVehicule_Agence] FOREIGN KEY([agence_id])
REFERENCES [dbo].[Agence] ([id])
GO
ALTER TABLE [dbo].[PromotionVehicule] CHECK CONSTRAINT [FK_PromotionVehicule_Agence]
GO
ALTER TABLE [dbo].[PromotionVehicule]  WITH CHECK ADD  CONSTRAINT [FK_PromotionVehicule_CreatedBy] FOREIGN KEY([created_by])
REFERENCES [dbo].[Utilisateur] ([id])
GO
ALTER TABLE [dbo].[PromotionVehicule] CHECK CONSTRAINT [FK_PromotionVehicule_CreatedBy]
GO
ALTER TABLE [dbo].[PromotionVehicule]  WITH CHECK ADD  CONSTRAINT [FK_PromotionVehicule_Marque] FOREIGN KEY([marque_id])
REFERENCES [dbo].[Marque] ([id])
GO
ALTER TABLE [dbo].[PromotionVehicule] CHECK CONSTRAINT [FK_PromotionVehicule_Marque]
GO
ALTER TABLE [dbo].[PromotionVehicule]  WITH CHECK ADD  CONSTRAINT [FK_PromotionVehicule_Modele] FOREIGN KEY([modele_id])
REFERENCES [dbo].[Modele] ([id])
GO
ALTER TABLE [dbo].[PromotionVehicule] CHECK CONSTRAINT [FK_PromotionVehicule_Modele]
GO
ALTER TABLE [dbo].[PromotionVehicule]  WITH CHECK ADD  CONSTRAINT [FK_PromotionVehicule_Version] FOREIGN KEY([version_id])
REFERENCES [dbo].[Version] ([id])
GO
ALTER TABLE [dbo].[PromotionVehicule] CHECK CONSTRAINT [FK_PromotionVehicule_Version]
GO
ALTER TABLE [dbo].[RDV_Package]  WITH CHECK ADD  CONSTRAINT [FK_RDVPkg_Package] FOREIGN KEY([package_id])
REFERENCES [dbo].[PackageIntervention] ([id])
GO
ALTER TABLE [dbo].[RDV_Package] CHECK CONSTRAINT [FK_RDVPkg_Package]
GO
ALTER TABLE [dbo].[RDV_Package]  WITH CHECK ADD  CONSTRAINT [FK_RDVPkg_RDV] FOREIGN KEY([rdv_id])
REFERENCES [dbo].[RendezVous] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[RDV_Package] CHECK CONSTRAINT [FK_RDVPkg_RDV]
GO
ALTER TABLE [dbo].[Reclamation]  WITH CHECK ADD  CONSTRAINT [FK_Rec_Agent] FOREIGN KEY([agent_id])
REFERENCES [dbo].[Utilisateur] ([id])
GO
ALTER TABLE [dbo].[Reclamation] CHECK CONSTRAINT [FK_Rec_Agent]
GO
ALTER TABLE [dbo].[Reclamation]  WITH CHECK ADD  CONSTRAINT [FK_Rec_Client] FOREIGN KEY([client_id])
REFERENCES [dbo].[Utilisateur] ([id])
GO
ALTER TABLE [dbo].[Reclamation] CHECK CONSTRAINT [FK_Rec_Client]
GO
ALTER TABLE [dbo].[Reclamation]  WITH CHECK ADD  CONSTRAINT [FK_Rec_Statut] FOREIGN KEY([statut])
REFERENCES [dbo].[StatutReclamation] ([code])
GO
ALTER TABLE [dbo].[Reclamation] CHECK CONSTRAINT [FK_Rec_Statut]
GO
ALTER TABLE [dbo].[RendezVous]  WITH CHECK ADD  CONSTRAINT [FK_RDV_Agence] FOREIGN KEY([agence_id])
REFERENCES [dbo].[Agence] ([id])
GO
ALTER TABLE [dbo].[RendezVous] CHECK CONSTRAINT [FK_RDV_Agence]
GO
ALTER TABLE [dbo].[RendezVous]  WITH CHECK ADD  CONSTRAINT [FK_RDV_Agent] FOREIGN KEY([agent_id])
REFERENCES [dbo].[Utilisateur] ([id])
GO
ALTER TABLE [dbo].[RendezVous] CHECK CONSTRAINT [FK_RDV_Agent]
GO
ALTER TABLE [dbo].[RendezVous]  WITH CHECK ADD  CONSTRAINT [FK_RDV_Annulation_User] FOREIGN KEY([utilisateur_annulation])
REFERENCES [dbo].[Utilisateur] ([id])
GO
ALTER TABLE [dbo].[RendezVous] CHECK CONSTRAINT [FK_RDV_Annulation_User]
GO
ALTER TABLE [dbo].[RendezVous]  WITH CHECK ADD  CONSTRAINT [FK_RDV_Client] FOREIGN KEY([client_id])
REFERENCES [dbo].[Utilisateur] ([id])
GO
ALTER TABLE [dbo].[RendezVous] CHECK CONSTRAINT [FK_RDV_Client]
GO
ALTER TABLE [dbo].[RendezVous]  WITH CHECK ADD  CONSTRAINT [FK_RDV_Statut] FOREIGN KEY([statut])
REFERENCES [dbo].[StatutRDV] ([code])
GO
ALTER TABLE [dbo].[RendezVous] CHECK CONSTRAINT [FK_RDV_Statut]
GO
ALTER TABLE [dbo].[RendezVous]  WITH CHECK ADD  CONSTRAINT [FK_RDV_Vehicule] FOREIGN KEY([vehicule_id])
REFERENCES [dbo].[Vehicule] ([id])
GO
ALTER TABLE [dbo].[RendezVous] CHECK CONSTRAINT [FK_RDV_Vehicule]
GO
ALTER TABLE [dbo].[SousTypeIntervention]  WITH CHECK ADD  CONSTRAINT [FK_SousType_TypeInt] FOREIGN KEY([type_intervention_id])
REFERENCES [dbo].[TypeIntervention] ([id])
GO
ALTER TABLE [dbo].[SousTypeIntervention] CHECK CONSTRAINT [FK_SousType_TypeInt]
GO
ALTER TABLE [dbo].[Utilisateur]  WITH CHECK ADD  CONSTRAINT [FK_Utilisateur_Agence] FOREIGN KEY([agence_id])
REFERENCES [dbo].[Agence] ([id])
GO
ALTER TABLE [dbo].[Utilisateur] CHECK CONSTRAINT [FK_Utilisateur_Agence]
GO
ALTER TABLE [dbo].[Vehicule]  WITH CHECK ADD  CONSTRAINT [FK_Vehicule_Agent_Validation] FOREIGN KEY([agent_validation_id])
REFERENCES [dbo].[Utilisateur] ([id])
GO
ALTER TABLE [dbo].[Vehicule] CHECK CONSTRAINT [FK_Vehicule_Agent_Validation]
GO
ALTER TABLE [dbo].[Vehicule]  WITH CHECK ADD  CONSTRAINT [FK_Vehicule_Client] FOREIGN KEY([client_id])
REFERENCES [dbo].[Utilisateur] ([id])
GO
ALTER TABLE [dbo].[Vehicule] CHECK CONSTRAINT [FK_Vehicule_Client]
GO
ALTER TABLE [dbo].[Vehicule]  WITH CHECK ADD  CONSTRAINT [FK_Vehicule_Version] FOREIGN KEY([version_id])
REFERENCES [dbo].[Version] ([id])
GO
ALTER TABLE [dbo].[Vehicule] CHECK CONSTRAINT [FK_Vehicule_Version]
GO
ALTER TABLE [dbo].[Version]  WITH CHECK ADD  CONSTRAINT [FK_Version_Modele] FOREIGN KEY([modele_id])
REFERENCES [dbo].[Modele] ([id])
GO
ALTER TABLE [dbo].[Version] CHECK CONSTRAINT [FK_Version_Modele]
GO
ALTER TABLE [dbo].[Feedback]  WITH CHECK ADD CHECK  (([note]>=(1) AND [note]<=(5)))
GO
ALTER TABLE [dbo].[PieceJointe]  WITH CHECK ADD  CONSTRAINT [CK_EntiteType] CHECK  (([entite_type]='RECLAMATION' OR [entite_type]='RDV'))
GO
ALTER TABLE [dbo].[PieceJointe] CHECK CONSTRAINT [CK_EntiteType]
GO
ALTER TABLE [dbo].[PieceJointe]  WITH CHECK ADD  CONSTRAINT [CK_StatutModeration] CHECK  (([statut_moderation]='REJETE' OR [statut_moderation]='APPROUVE' OR [statut_moderation]='EN_ATTENTE'))
GO
ALTER TABLE [dbo].[PieceJointe] CHECK CONSTRAINT [CK_StatutModeration]
GO
ALTER TABLE [dbo].[PlageHoraire]  WITH CHECK ADD  CONSTRAINT [CK_Horaires] CHECK  (([heure_ouverture]<[heure_fermeture]))
GO
ALTER TABLE [dbo].[PlageHoraire] CHECK CONSTRAINT [CK_Horaires]
GO
ALTER TABLE [dbo].[PlageHoraire]  WITH CHECK ADD  CONSTRAINT [CK_JourSemaine] CHECK  (([jour_semaine]>=(1) AND [jour_semaine]<=(7)))
GO
ALTER TABLE [dbo].[PlageHoraire] CHECK CONSTRAINT [CK_JourSemaine]
GO
ALTER TABLE [dbo].[Promotion]  WITH CHECK ADD  CONSTRAINT [CK_Promo_Dates] CHECK  (([date_debut]<[date_fin]))
GO
ALTER TABLE [dbo].[Promotion] CHECK CONSTRAINT [CK_Promo_Dates]
GO
ALTER TABLE [dbo].[PromotionVehicule]  WITH CHECK ADD  CONSTRAINT [CHK_PromotionVehicule_Dates] CHECK  (([date_fin]>=[date_debut]))
GO
ALTER TABLE [dbo].[PromotionVehicule] CHECK CONSTRAINT [CHK_PromotionVehicule_Dates]
GO
ALTER TABLE [dbo].[PromotionVehicule]  WITH CHECK ADD  CONSTRAINT [CHK_PromotionVehicule_Prix] CHECK  (([prix_promotion]>(0)))
GO
ALTER TABLE [dbo].[PromotionVehicule] CHECK CONSTRAINT [CHK_PromotionVehicule_Prix]
GO
ALTER TABLE [dbo].[RendezVous]  WITH CHECK ADD  CONSTRAINT [CK_RDV_DatePassee] CHECK  (([date_heure]>getdate() OR ([statut]='NO_SHOW' OR [statut]='ANNULE' OR [statut]='TERMINE')))
GO
ALTER TABLE [dbo].[RendezVous] CHECK CONSTRAINT [CK_RDV_DatePassee]
GO
ALTER TABLE [dbo].[RendezVous]  WITH CHECK ADD  CONSTRAINT [CK_RDV_Feedback_Note] CHECK  (([feedback_note] IS NULL OR [feedback_note]>=(1) AND [feedback_note]<=(5)))
GO
ALTER TABLE [dbo].[RendezVous] CHECK CONSTRAINT [CK_RDV_Feedback_Note]
GO
ALTER TABLE [dbo].[Vehicule]  WITH CHECK ADD  CONSTRAINT [CK_Annee] CHECK  (([annee]>=(1950) AND [annee]<=(2100)))
GO
ALTER TABLE [dbo].[Vehicule] CHECK CONSTRAINT [CK_Annee]
GO
ALTER TABLE [dbo].[Vehicule]  WITH CHECK ADD  CONSTRAINT [CK_Vehicule_Statut_Validation] CHECK  (([statut_validation]='REFUSE' OR [statut_validation]='VALIDE' OR [statut_validation]='EN_ATTENTE'))
GO
ALTER TABLE [dbo].[Vehicule] CHECK CONSTRAINT [CK_Vehicule_Statut_Validation]
GO
ALTER TABLE [dbo].[Vehicule]  WITH CHECK ADD  CONSTRAINT [CK_Vehicule_StatutValidation] CHECK  (([statut_validation]='REFUSE' OR [statut_validation]='VALIDE' OR [statut_validation]='EN_ATTENTE'))
GO
ALTER TABLE [dbo].[Vehicule] CHECK CONSTRAINT [CK_Vehicule_StatutValidation]
GO
ALTER TABLE [dbo].[Version]  WITH CHECK ADD  CONSTRAINT [CK_Transmission] CHECK  (([transmission]='CVT' OR [transmission]='DSG' OR [transmission]='AUTOMATIQUE' OR [transmission]='MANUELLE' OR [transmission] IS NULL))
GO
ALTER TABLE [dbo].[Version] CHECK CONSTRAINT [CK_Transmission]
GO
/****** Object:  StoredProcedure [dbo].[SP_ChangerStatutReclamation]    Script Date: 23/05/2026 8:15:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE   PROCEDURE [dbo].[SP_ChangerStatutReclamation]
    @rec_id   BIGINT,
    @agent_id BIGINT,
    @statut   VARCHAR(20),
    @reponse  NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        UPDATE Reclamation SET
            statut          = @statut,
            agent_id        = @agent_id,
            date_traitement = CASE WHEN @statut = 'EN_COURS' THEN GETDATE() ELSE date_traitement END,
            date_cloture    = CASE WHEN @statut = 'CLOTUREE'  THEN GETDATE() ELSE date_cloture    END
        WHERE id = @rec_id;

        DECLARE @clientId BIGINT;
        SELECT @clientId = client_id FROM Reclamation WHERE id = @rec_id;

        INSERT INTO Notification (utilisateur_id, titre, message, type, entite_type, entite_id)
        VALUES (@clientId, N'Mise à jour réclamation',
                ISNULL(@reponse, N'Statut de votre réclamation : ' + @statut),
                'PUSH', 'RECLAMATION', @rec_id);

        COMMIT;
    END TRY
    BEGIN CATCH ROLLBACK; THROW; END CATCH
END;
GO
/****** Object:  StoredProcedure [dbo].[SP_ConfirmerRDV]    Script Date: 23/05/2026 8:15:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE   PROCEDURE [dbo].[SP_ConfirmerRDV]
    @rdv_id   BIGINT,
    @agent_id BIGINT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM RendezVous WHERE id = @rdv_id AND statut = 'PLANIFIE')
            THROW 50010, 'Le RDV n''est pas dans l''état PLANIFIE.', 1;

        UPDATE RendezVous SET statut = 'CONFIRME', agent_id = @agent_id WHERE id = @rdv_id;

        DECLARE @clientId BIGINT;
        SELECT @clientId = client_id FROM RendezVous WHERE id = @rdv_id;

        INSERT INTO Notification (utilisateur_id, titre, message, type, entite_type, entite_id)
        VALUES (@clientId, N'Rendez-vous confirmé',
                N'Votre rendez-vous a été confirmé. Nous vous attendons !',
                'PUSH', 'RDV', @rdv_id);

        COMMIT;
    END TRY
    BEGIN CATCH ROLLBACK; THROW; END CATCH
END;
GO
/****** Object:  StoredProcedure [dbo].[SP_CreerRendezVous]    Script Date: 23/05/2026 8:15:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- ============================================================
--  ETAPE 9 — RECREER LES PROCEDURES STOCKEES
-- ============================================================

CREATE   PROCEDURE [dbo].[SP_CreerRendezVous]
    @client_id   BIGINT,
    @vehicule_id BIGINT,
    @agence_id   BIGINT,
    @date_heure  DATETIME2,
    @description NVARCHAR(MAX) = NULL,
    @duree_est   INT = 60
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM Vehicule WHERE id = @vehicule_id AND client_id = @client_id)
            THROW 50001, 'Ce véhicule n''appartient pas au client.', 1;

        DECLARE @jourISO  TINYINT = DATEPART(WEEKDAY, @date_heure);
        DECLARE @heureRDV TIME    = CAST(@date_heure AS TIME);
        DECLARE @capacite INT;

        SELECT TOP 1 @capacite = capacite FROM PlageHoraire
        WHERE agence_id = @agence_id AND jour_semaine = @jourISO
          AND @heureRDV BETWEEN heure_ouverture AND heure_fermeture;

        IF @capacite IS NULL
            THROW 50002, 'Aucune plage horaire disponible pour ce créneau.', 1;

        DECLARE @nbRDV INT;
        SELECT @nbRDV = COUNT(*) FROM RendezVous
        WHERE agence_id = @agence_id
          AND CAST(date_heure AS DATE)   = CAST(@date_heure AS DATE)
          AND DATEPART(HOUR, date_heure) = DATEPART(HOUR, @date_heure)
          AND statut NOT IN ('ANNULE','NO_SHOW');

        IF @nbRDV >= @capacite
            THROW 50003, 'Créneau complet pour cette agence à cette heure.', 1;

        INSERT INTO RendezVous (client_id, vehicule_id, agence_id, date_heure, description, duree_estimee, statut)
        VALUES (@client_id, @vehicule_id, @agence_id, @date_heure, @description, @duree_est, 'PLANIFIE');

        DECLARE @newId BIGINT = SCOPE_IDENTITY();

        INSERT INTO Notification (utilisateur_id, titre, message, type, entite_type, entite_id)
        VALUES (@client_id, N'Rendez-vous créé',
                N'Votre RDV du ' + FORMAT(@date_heure,'dd/MM/yyyy HH:mm') + N' est enregistré.',
                'PUSH', 'RDV', @newId);

        COMMIT;
        SELECT @newId AS rdv_id, 'PLANIFIE' AS statut;
    END TRY
    BEGIN CATCH ROLLBACK; THROW; END CATCH
END;
GO
/****** Object:  StoredProcedure [dbo].[SP_RapportJournalier]    Script Date: 23/05/2026 8:15:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE   PROCEDURE [dbo].[SP_RapportJournalier]
    @agence_id BIGINT,
    @date      DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    IF @date IS NULL SET @date = CAST(GETDATE() AS DATE);
    SELECT
        ag.nom AS agence, @date AS date_rapport,
        COUNT(r.id)                                            AS total_rdv,
        SUM(CASE WHEN r.statut='PLANIFIE' THEN 1 ELSE 0 END)  AS planifies,
        SUM(CASE WHEN r.statut='CONFIRME' THEN 1 ELSE 0 END)  AS confirmes,
        SUM(CASE WHEN r.statut='EN_COURS' THEN 1 ELSE 0 END)  AS en_cours,
        SUM(CASE WHEN r.statut='TERMINE'  THEN 1 ELSE 0 END)  AS termines,
        SUM(CASE WHEN r.statut='ANNULE'   THEN 1 ELSE 0 END)  AS annules,
        SUM(CASE WHEN r.statut='NO_SHOW'  THEN 1 ELSE 0 END)  AS no_shows,
        AVG(DATEDIFF(MINUTE, r.heure_reelle_debut,
                              r.heure_reelle_fin))              AS duree_moy_min
    FROM Agence ag
    LEFT JOIN RendezVous r
        ON r.agence_id = ag.id AND CAST(r.date_heure AS DATE) = @date
    WHERE ag.id = @agence_id
    GROUP BY ag.nom;
END;
GO
