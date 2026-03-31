USE [master]
GO
/****** Object:  Database [STA_SAV_DB]    Script Date: 30/03/2026 1:54:31 PM ******/
-- ✅ Nouveau (chemins Linux Docker)
CREATE DATABASE [STA_SAV_DB]
ON PRIMARY (
  NAME = N'STA_SAV_DB',
  FILENAME = N'/var/opt/mssql/data/STA_SAV_DB.mdf'
)
LOG ON (
  NAME = N'STA_SAV_DB_log',
  FILENAME = N'/var/opt/mssql/data/STA_SAV_DB_log.ldf'
)
 WITH CATALOG_COLLATION = DATABASE_DEFAULT
GO
ALTER DATABASE [STA_SAV_DB] SET COMPATIBILITY_LEVEL = 150
GO
IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC [STA_SAV_DB].[dbo].[sp_fulltext_database] @action = 'enable'
end
GO
ALTER DATABASE [STA_SAV_DB] SET ANSI_NULL_DEFAULT OFF 
GO
ALTER DATABASE [STA_SAV_DB] SET ANSI_NULLS OFF 
GO
ALTER DATABASE [STA_SAV_DB] SET ANSI_PADDING OFF 
GO
ALTER DATABASE [STA_SAV_DB] SET ANSI_WARNINGS OFF 
GO
ALTER DATABASE [STA_SAV_DB] SET ARITHABORT OFF 
GO
ALTER DATABASE [STA_SAV_DB] SET AUTO_CLOSE OFF 
GO
ALTER DATABASE [STA_SAV_DB] SET AUTO_SHRINK OFF 
GO
ALTER DATABASE [STA_SAV_DB] SET AUTO_UPDATE_STATISTICS ON 
GO
ALTER DATABASE [STA_SAV_DB] SET CURSOR_CLOSE_ON_COMMIT OFF 
GO
ALTER DATABASE [STA_SAV_DB] SET CURSOR_DEFAULT  GLOBAL 
GO
ALTER DATABASE [STA_SAV_DB] SET CONCAT_NULL_YIELDS_NULL OFF 
GO
ALTER DATABASE [STA_SAV_DB] SET NUMERIC_ROUNDABORT OFF 
GO
ALTER DATABASE [STA_SAV_DB] SET QUOTED_IDENTIFIER OFF 
GO
ALTER DATABASE [STA_SAV_DB] SET RECURSIVE_TRIGGERS OFF 
GO
ALTER DATABASE [STA_SAV_DB] SET  ENABLE_BROKER 
GO
ALTER DATABASE [STA_SAV_DB] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
GO
ALTER DATABASE [STA_SAV_DB] SET DATE_CORRELATION_OPTIMIZATION OFF 
GO
ALTER DATABASE [STA_SAV_DB] SET TRUSTWORTHY OFF 
GO
ALTER DATABASE [STA_SAV_DB] SET ALLOW_SNAPSHOT_ISOLATION OFF 
GO
ALTER DATABASE [STA_SAV_DB] SET PARAMETERIZATION SIMPLE 
GO
ALTER DATABASE [STA_SAV_DB] SET READ_COMMITTED_SNAPSHOT OFF 
GO
ALTER DATABASE [STA_SAV_DB] SET HONOR_BROKER_PRIORITY OFF 
GO
ALTER DATABASE [STA_SAV_DB] SET RECOVERY FULL 
GO
ALTER DATABASE [STA_SAV_DB] SET  MULTI_USER 
GO
ALTER DATABASE [STA_SAV_DB] SET PAGE_VERIFY CHECKSUM  
GO
ALTER DATABASE [STA_SAV_DB] SET DB_CHAINING OFF 
GO
ALTER DATABASE [STA_SAV_DB] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF ) 
GO
ALTER DATABASE [STA_SAV_DB] SET TARGET_RECOVERY_TIME = 60 SECONDS 
GO
ALTER DATABASE [STA_SAV_DB] SET DELAYED_DURABILITY = DISABLED 
GO
ALTER DATABASE [STA_SAV_DB] SET ACCELERATED_DATABASE_RECOVERY = OFF  
GO
EXEC sys.sp_db_vardecimal_storage_format N'STA_SAV_DB', N'ON'
GO
ALTER DATABASE [STA_SAV_DB] SET QUERY_STORE = OFF
GO
USE [STA_SAV_DB]
GO
/****** Object:  Table [dbo].[Agence]    Script Date: 30/03/2026 1:54:31 PM ******/
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
 CONSTRAINT [PK_Agence] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Utilisateur]    Script Date: 30/03/2026 1:54:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Utilisateur](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[type_utilisateur] [nvarchar](20) NOT NULL,
	[nom] [nvarchar](100) NOT NULL,
	[prenom] [nvarchar](100) NOT NULL,
	[telephone] [nvarchar](20) NULL,
	[email] [nvarchar](150) NOT NULL,
	[mot_de_passe] [nvarchar](255) NOT NULL,
	[actif] [bit] NOT NULL,
	[date_creation] [datetime2](7) NOT NULL,
	[role_id] [bigint] NOT NULL,
	[code_client] [nvarchar](30) NULL,
	[adresse] [nvarchar](255) NULL,
	[matricule] [nvarchar](30) NULL,
	[agence_id] [bigint] NULL,
	[niveau] [nvarchar](30) NULL,
	[fonction] [nvarchar](100) NULL,
 CONSTRAINT [PK_Utilisateur] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Marque]    Script Date: 30/03/2026 1:54:31 PM ******/
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
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Modele]    Script Date: 30/03/2026 1:54:31 PM ******/
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
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Version]    Script Date: 30/03/2026 1:54:31 PM ******/
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
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Vehicule]    Script Date: 30/03/2026 1:54:31 PM ******/
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
 CONSTRAINT [PK_Vehicule] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[RendezVous]    Script Date: 30/03/2026 1:54:31 PM ******/
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
/****** Object:  View [dbo].[VW_PlanningRDV]    Script Date: 30/03/2026 1:54:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- ============================================================
--  ETAPE 8 — RECREER LES VUES
-- ============================================================

CREATE VIEW [dbo].[VW_PlanningRDV] AS
SELECT
    r.id AS rdv_id, r.date_heure, r.statut, r.duree_estimee,
    c.nom  + ' ' + c.prenom  AS client_nom,  c.telephone AS client_tel,
    a.nom  + ' ' + a.prenom  AS agent_nom,
    ag.nom AS agence_nom, ag.ville,
    ma.nom AS marque, mo.nom AS modele, ve.nom AS version_nom,
    vh.immatriculation
FROM RendezVous r
JOIN Utilisateur c  ON c.id  = r.client_id
LEFT JOIN Utilisateur a  ON a.id  = r.agent_id
JOIN Agence      ag ON ag.id = r.agence_id
JOIN Vehicule    vh ON vh.id = r.vehicule_id
JOIN Version     ve ON ve.id = vh.version_id
JOIN Modele      mo ON mo.id = ve.modele_id
JOIN Marque      ma ON ma.id = mo.marque_id;
GO
/****** Object:  Table [dbo].[Reclamation]    Script Date: 30/03/2026 1:54:31 PM ******/
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
 CONSTRAINT [PK_Reclamation] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  View [dbo].[VW_ReclamationsOuvertes]    Script Date: 30/03/2026 1:54:31 PM ******/
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
/****** Object:  View [dbo].[VW_StatsAgence]    Script Date: 30/03/2026 1:54:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE VIEW [dbo].[VW_StatsAgence] AS
SELECT
    ag.id AS agence_id, ag.nom AS agence_nom, ag.ville,
    COUNT(r.id)                                              AS total_rdv,
    SUM(CASE WHEN r.statut='TERMINE' THEN 1 ELSE 0 END)     AS rdv_termines,
    SUM(CASE WHEN r.statut='ANNULE'  THEN 1 ELSE 0 END)     AS rdv_annules,
    SUM(CASE WHEN r.statut='NO_SHOW' THEN 1 ELSE 0 END)     AS rdv_no_show,
    AVG(DATEDIFF(MINUTE, r.heure_reelle_debut,
                          r.heure_reelle_fin))                AS duree_moy_min
FROM Agence ag
LEFT JOIN RendezVous r ON r.agence_id = ag.id
GROUP BY ag.id, ag.nom, ag.ville;
GO
/****** Object:  Table [dbo].[SousTypeIntervention]    Script Date: 30/03/2026 1:54:31 PM ******/
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
/****** Object:  Table [dbo].[InterventionRDV]    Script Date: 30/03/2026 1:54:31 PM ******/
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
/****** Object:  View [dbo].[VW_HistoriqueVehicule]    Script Date: 30/03/2026 1:54:31 PM ******/
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
/****** Object:  Table [dbo].[HistoriqueRDV]    Script Date: 30/03/2026 1:54:31 PM ******/
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
/****** Object:  Table [dbo].[Notification]    Script Date: 30/03/2026 1:54:31 PM ******/
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
/****** Object:  Table [dbo].[Package_SousType]    Script Date: 30/03/2026 1:54:31 PM ******/
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
/****** Object:  Table [dbo].[PackageIntervention]    Script Date: 30/03/2026 1:54:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PackageIntervention](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[nom] [nvarchar](150) NOT NULL,
	[description] [nvarchar](500) NULL,
	[prix_estimatif] [decimal](10, 3) NOT NULL,
	[actif] [bit] NOT NULL,
 CONSTRAINT [PK_Package] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Permission]    Script Date: 30/03/2026 1:54:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Permission](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[role_id] [bigint] NOT NULL,
	[module] [nvarchar](50) NOT NULL,
	[action] [nvarchar](20) NOT NULL,
	[actif] [bit] NOT NULL,
 CONSTRAINT [PK_Permission] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[PieceJointe]    Script Date: 30/03/2026 1:54:31 PM ******/
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
 CONSTRAINT [PK_PieceJointe] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[PlageHoraire]    Script Date: 30/03/2026 1:54:31 PM ******/
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
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Promotion]    Script Date: 30/03/2026 1:54:31 PM ******/
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
 CONSTRAINT [PK_Promotion] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[RDV_Package]    Script Date: 30/03/2026 1:54:31 PM ******/
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
/****** Object:  Table [dbo].[Role]    Script Date: 30/03/2026 1:54:31 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Role](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[nom] [nvarchar](50) NOT NULL,
	[description] [nvarchar](200) NULL,
 CONSTRAINT [PK_Role] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[StatutIntervention]    Script Date: 30/03/2026 1:54:31 PM ******/
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
/****** Object:  Table [dbo].[StatutRDV]    Script Date: 30/03/2026 1:54:31 PM ******/
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
/****** Object:  Table [dbo].[StatutReclamation]    Script Date: 30/03/2026 1:54:31 PM ******/
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
/****** Object:  Table [dbo].[TypeIntervention]    Script Date: 30/03/2026 1:54:32 PM ******/
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
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TypeNotification]    Script Date: 30/03/2026 1:54:32 PM ******/
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
SET IDENTITY_INSERT [dbo].[Agence] ON 

INSERT [dbo].[Agence] ([id], [nom], [ville], [telephone], [adresse]) VALUES (1, N'STA Tunis Nord', N'Tunis', N'+216 71 000 001', N'Avenue Habib Bourguiba, Tunis')
INSERT [dbo].[Agence] ([id], [nom], [ville], [telephone], [adresse]) VALUES (2, N'STA Tunis Sud', N'Tunis', N'+216 71 000 002', N'Route de Sfax, Tunis')
INSERT [dbo].[Agence] ([id], [nom], [ville], [telephone], [adresse]) VALUES (3, N'STA Sfax', N'Sfax', N'+216 74 000 001', N'Avenue Taieb Mhiri, Sfax')
INSERT [dbo].[Agence] ([id], [nom], [ville], [telephone], [adresse]) VALUES (4, N'STA Sousse', N'Sousse', N'+216 73 000 001', N'Rue Ibn Khaldoun, Sousse')
INSERT [dbo].[Agence] ([id], [nom], [ville], [telephone], [adresse]) VALUES (5, N'STA Bizerte', N'Bizerte', N'+216 72 000 001', N'Avenue Habib Bourguiba, Bizerte')
INSERT [dbo].[Agence] ([id], [nom], [ville], [telephone], [adresse]) VALUES (6, N'STA Monastir', N'Monastir', N'+216 73 000 002', N'Route Touristique, Monastir')
SET IDENTITY_INSERT [dbo].[Agence] OFF
GO
SET IDENTITY_INSERT [dbo].[InterventionRDV] ON 

INSERT [dbo].[InterventionRDV] ([id], [rdv_id], [sous_type_id], [statut], [duree_reelle], [commentaire], [date_debut], [date_fin], [cout_reel], [date_creation]) VALUES (1, 4, 13, N'EN_ATTENTE', NULL, NULL, NULL, NULL, NULL, CAST(N'2026-03-28T16:14:21.1866667' AS DateTime2))
INSERT [dbo].[InterventionRDV] ([id], [rdv_id], [sous_type_id], [statut], [duree_reelle], [commentaire], [date_debut], [date_fin], [cout_reel], [date_creation]) VALUES (2, 5, 10, N'EN_ATTENTE', NULL, NULL, NULL, NULL, NULL, CAST(N'2026-03-30T12:08:17.4133333' AS DateTime2))
INSERT [dbo].[InterventionRDV] ([id], [rdv_id], [sous_type_id], [statut], [duree_reelle], [commentaire], [date_debut], [date_fin], [cout_reel], [date_creation]) VALUES (3, 6, 3, N'EN_ATTENTE', NULL, NULL, NULL, NULL, NULL, CAST(N'2026-03-30T12:10:10.5900000' AS DateTime2))
SET IDENTITY_INSERT [dbo].[InterventionRDV] OFF
GO
SET IDENTITY_INSERT [dbo].[Marque] ON 

INSERT [dbo].[Marque] ([id], [nom], [logo_url], [actif]) VALUES (1, N'Volkswagen', NULL, 1)
INSERT [dbo].[Marque] ([id], [nom], [logo_url], [actif]) VALUES (2, N'Peugeot', NULL, 1)
INSERT [dbo].[Marque] ([id], [nom], [logo_url], [actif]) VALUES (3, N'Renault', NULL, 1)
INSERT [dbo].[Marque] ([id], [nom], [logo_url], [actif]) VALUES (4, N'Hyundai', NULL, 1)
INSERT [dbo].[Marque] ([id], [nom], [logo_url], [actif]) VALUES (5, N'Kia', NULL, 1)
INSERT [dbo].[Marque] ([id], [nom], [logo_url], [actif]) VALUES (6, N'Toyota', NULL, 1)
INSERT [dbo].[Marque] ([id], [nom], [logo_url], [actif]) VALUES (7, N'Seat', NULL, 1)
SET IDENTITY_INSERT [dbo].[Marque] OFF
GO
SET IDENTITY_INSERT [dbo].[Modele] ON 

INSERT [dbo].[Modele] ([id], [marque_id], [nom], [annee_debut], [annee_fin], [actif]) VALUES (1, 1, N'Golf', N'2012', NULL, 1)
INSERT [dbo].[Modele] ([id], [marque_id], [nom], [annee_debut], [annee_fin], [actif]) VALUES (2, 1, N'Polo', N'2010', NULL, 1)
INSERT [dbo].[Modele] ([id], [marque_id], [nom], [annee_debut], [annee_fin], [actif]) VALUES (3, 1, N'Passat', N'2015', NULL, 1)
INSERT [dbo].[Modele] ([id], [marque_id], [nom], [annee_debut], [annee_fin], [actif]) VALUES (4, 2, N'208', N'2012', NULL, 1)
INSERT [dbo].[Modele] ([id], [marque_id], [nom], [annee_debut], [annee_fin], [actif]) VALUES (5, 2, N'308', N'2013', NULL, 1)
INSERT [dbo].[Modele] ([id], [marque_id], [nom], [annee_debut], [annee_fin], [actif]) VALUES (6, 3, N'Clio', N'2012', NULL, 1)
INSERT [dbo].[Modele] ([id], [marque_id], [nom], [annee_debut], [annee_fin], [actif]) VALUES (7, 3, N'Megane', N'2016', NULL, 1)
INSERT [dbo].[Modele] ([id], [marque_id], [nom], [annee_debut], [annee_fin], [actif]) VALUES (8, 4, N'Tucson', N'2015', NULL, 1)
INSERT [dbo].[Modele] ([id], [marque_id], [nom], [annee_debut], [annee_fin], [actif]) VALUES (9, 5, N'Sportage', N'2016', NULL, 1)
INSERT [dbo].[Modele] ([id], [marque_id], [nom], [annee_debut], [annee_fin], [actif]) VALUES (10, 6, N'Corolla', N'2019', NULL, 1)
SET IDENTITY_INSERT [dbo].[Modele] OFF
GO
SET IDENTITY_INSERT [dbo].[Notification] ON 

INSERT [dbo].[Notification] ([id], [utilisateur_id], [titre], [message], [lu], [type], [entite_type], [entite_id], [date_envoi]) VALUES (1, 3, N'Rendez-vous cree', N'Votre RDV du 30/03/2026 08:00 est enregistre.', 0, N'PUSH', N'RDV', 1, CAST(N'2026-03-28T15:32:24.8100000' AS DateTime2))
INSERT [dbo].[Notification] ([id], [utilisateur_id], [titre], [message], [lu], [type], [entite_type], [entite_id], [date_envoi]) VALUES (2, 3, N'Rendez-vous cree', N'Votre RDV du 03/04/2026 08:00 est enregistre.', 0, N'PUSH', N'RDV', 2, CAST(N'2026-03-28T15:32:56.9366667' AS DateTime2))
INSERT [dbo].[Notification] ([id], [utilisateur_id], [titre], [message], [lu], [type], [entite_type], [entite_id], [date_envoi]) VALUES (3, 3, N'Rendez-vous cree', N'Votre RDV du 30/03/2026 11:00 est enregistre.', 0, N'PUSH', N'RDV', 3, CAST(N'2026-03-28T15:33:55.9433333' AS DateTime2))
INSERT [dbo].[Notification] ([id], [utilisateur_id], [titre], [message], [lu], [type], [entite_type], [entite_id], [date_envoi]) VALUES (4, 3, N'Rendez-vous annulé', N'Votre rendez-vous a été annulé.', 0, N'PUSH', N'RDV', 2, CAST(N'2026-03-28T15:40:56.2300000' AS DateTime2))
INSERT [dbo].[Notification] ([id], [utilisateur_id], [titre], [message], [lu], [type], [entite_type], [entite_id], [date_envoi]) VALUES (5, 3, N'Rendez-vous cree', N'Votre RDV du 15/05/2026 11:00 est enregistre.', 0, N'PUSH', N'RDV', 4, CAST(N'2026-03-28T15:46:58.5733333' AS DateTime2))
INSERT [dbo].[Notification] ([id], [utilisateur_id], [titre], [message], [lu], [type], [entite_type], [entite_id], [date_envoi]) VALUES (6, 3, N'Rendez-vous annulé', N'Votre rendez-vous a été annulé.', 0, N'PUSH', N'RDV', 1, CAST(N'2026-03-28T15:59:11.6000000' AS DateTime2))
INSERT [dbo].[Notification] ([id], [utilisateur_id], [titre], [message], [lu], [type], [entite_type], [entite_id], [date_envoi]) VALUES (7, 3, N'Rendez-vous cree', N'Votre RDV du 05/06/2026 09:00 est enregistre.', 0, N'PUSH', N'RDV', 5, CAST(N'2026-03-30T12:08:17.4066667' AS DateTime2))
INSERT [dbo].[Notification] ([id], [utilisateur_id], [titre], [message], [lu], [type], [entite_type], [entite_id], [date_envoi]) VALUES (8, 3, N'Rendez-vous cree', N'Votre RDV du 21/07/2026 09:00 est enregistre.', 0, N'PUSH', N'RDV', 6, CAST(N'2026-03-30T12:10:10.5833333' AS DateTime2))
SET IDENTITY_INSERT [dbo].[Notification] OFF
GO
INSERT [dbo].[Package_SousType] ([package_id], [sous_type_id]) VALUES (1, 1)
INSERT [dbo].[Package_SousType] ([package_id], [sous_type_id]) VALUES (1, 3)
INSERT [dbo].[Package_SousType] ([package_id], [sous_type_id]) VALUES (2, 1)
INSERT [dbo].[Package_SousType] ([package_id], [sous_type_id]) VALUES (2, 3)
INSERT [dbo].[Package_SousType] ([package_id], [sous_type_id]) VALUES (2, 10)
INSERT [dbo].[Package_SousType] ([package_id], [sous_type_id]) VALUES (3, 1)
INSERT [dbo].[Package_SousType] ([package_id], [sous_type_id]) VALUES (3, 3)
INSERT [dbo].[Package_SousType] ([package_id], [sous_type_id]) VALUES (3, 7)
INSERT [dbo].[Package_SousType] ([package_id], [sous_type_id]) VALUES (3, 8)
INSERT [dbo].[Package_SousType] ([package_id], [sous_type_id]) VALUES (3, 11)
INSERT [dbo].[Package_SousType] ([package_id], [sous_type_id]) VALUES (4, 4)
INSERT [dbo].[Package_SousType] ([package_id], [sous_type_id]) VALUES (4, 5)
INSERT [dbo].[Package_SousType] ([package_id], [sous_type_id]) VALUES (4, 6)
INSERT [dbo].[Package_SousType] ([package_id], [sous_type_id]) VALUES (5, 14)
INSERT [dbo].[Package_SousType] ([package_id], [sous_type_id]) VALUES (5, 15)
GO
SET IDENTITY_INSERT [dbo].[PackageIntervention] ON 

INSERT [dbo].[PackageIntervention] ([id], [nom], [description], [prix_estimatif], [actif]) VALUES (1, N'Pack Vidange Essentiel', N'Vidange + filtre huile', CAST(85.000 AS Decimal(10, 3)), 1)
INSERT [dbo].[PackageIntervention] ([id], [nom], [description], [prix_estimatif], [actif]) VALUES (2, N'Pack Révision 15 000 km', N'Vidange + filtres + points de contrôle', CAST(150.000 AS Decimal(10, 3)), 1)
INSERT [dbo].[PackageIntervention] ([id], [nom], [description], [prix_estimatif], [actif]) VALUES (3, N'Pack Révision 30 000 km', N'Révision complète + pneumatiques', CAST(280.000 AS Decimal(10, 3)), 1)
INSERT [dbo].[PackageIntervention] ([id], [nom], [description], [prix_estimatif], [actif]) VALUES (4, N'Pack Freinage Complet', N'Plaquettes + disques avant et arrière', CAST(320.000 AS Decimal(10, 3)), 1)
INSERT [dbo].[PackageIntervention] ([id], [nom], [description], [prix_estimatif], [actif]) VALUES (5, N'Pack Climatisation', N'Recharge + nettoyage circuit', CAST(95.000 AS Decimal(10, 3)), 1)
SET IDENTITY_INSERT [dbo].[PackageIntervention] OFF
GO
SET IDENTITY_INSERT [dbo].[PlageHoraire] ON 

INSERT [dbo].[PlageHoraire] ([id], [agence_id], [jour_semaine], [heure_ouverture], [heure_fermeture], [capacite]) VALUES (1, 1, 1, CAST(N'08:00:00' AS Time), CAST(N'17:00:00' AS Time), 4)
INSERT [dbo].[PlageHoraire] ([id], [agence_id], [jour_semaine], [heure_ouverture], [heure_fermeture], [capacite]) VALUES (2, 1, 2, CAST(N'08:00:00' AS Time), CAST(N'17:00:00' AS Time), 4)
INSERT [dbo].[PlageHoraire] ([id], [agence_id], [jour_semaine], [heure_ouverture], [heure_fermeture], [capacite]) VALUES (3, 1, 3, CAST(N'08:00:00' AS Time), CAST(N'17:00:00' AS Time), 4)
INSERT [dbo].[PlageHoraire] ([id], [agence_id], [jour_semaine], [heure_ouverture], [heure_fermeture], [capacite]) VALUES (4, 1, 4, CAST(N'08:00:00' AS Time), CAST(N'17:00:00' AS Time), 4)
INSERT [dbo].[PlageHoraire] ([id], [agence_id], [jour_semaine], [heure_ouverture], [heure_fermeture], [capacite]) VALUES (5, 1, 5, CAST(N'08:00:00' AS Time), CAST(N'17:00:00' AS Time), 4)
INSERT [dbo].[PlageHoraire] ([id], [agence_id], [jour_semaine], [heure_ouverture], [heure_fermeture], [capacite]) VALUES (6, 2, 1, CAST(N'08:00:00' AS Time), CAST(N'17:00:00' AS Time), 4)
INSERT [dbo].[PlageHoraire] ([id], [agence_id], [jour_semaine], [heure_ouverture], [heure_fermeture], [capacite]) VALUES (7, 2, 2, CAST(N'08:00:00' AS Time), CAST(N'17:00:00' AS Time), 4)
INSERT [dbo].[PlageHoraire] ([id], [agence_id], [jour_semaine], [heure_ouverture], [heure_fermeture], [capacite]) VALUES (8, 2, 3, CAST(N'08:00:00' AS Time), CAST(N'17:00:00' AS Time), 4)
INSERT [dbo].[PlageHoraire] ([id], [agence_id], [jour_semaine], [heure_ouverture], [heure_fermeture], [capacite]) VALUES (9, 2, 4, CAST(N'08:00:00' AS Time), CAST(N'17:00:00' AS Time), 4)
INSERT [dbo].[PlageHoraire] ([id], [agence_id], [jour_semaine], [heure_ouverture], [heure_fermeture], [capacite]) VALUES (10, 2, 5, CAST(N'08:00:00' AS Time), CAST(N'17:00:00' AS Time), 4)
INSERT [dbo].[PlageHoraire] ([id], [agence_id], [jour_semaine], [heure_ouverture], [heure_fermeture], [capacite]) VALUES (11, 3, 1, CAST(N'08:00:00' AS Time), CAST(N'17:00:00' AS Time), 4)
INSERT [dbo].[PlageHoraire] ([id], [agence_id], [jour_semaine], [heure_ouverture], [heure_fermeture], [capacite]) VALUES (12, 3, 2, CAST(N'08:00:00' AS Time), CAST(N'17:00:00' AS Time), 4)
INSERT [dbo].[PlageHoraire] ([id], [agence_id], [jour_semaine], [heure_ouverture], [heure_fermeture], [capacite]) VALUES (13, 3, 3, CAST(N'08:00:00' AS Time), CAST(N'17:00:00' AS Time), 4)
INSERT [dbo].[PlageHoraire] ([id], [agence_id], [jour_semaine], [heure_ouverture], [heure_fermeture], [capacite]) VALUES (14, 3, 4, CAST(N'08:00:00' AS Time), CAST(N'17:00:00' AS Time), 4)
INSERT [dbo].[PlageHoraire] ([id], [agence_id], [jour_semaine], [heure_ouverture], [heure_fermeture], [capacite]) VALUES (15, 3, 5, CAST(N'08:00:00' AS Time), CAST(N'17:00:00' AS Time), 4)
INSERT [dbo].[PlageHoraire] ([id], [agence_id], [jour_semaine], [heure_ouverture], [heure_fermeture], [capacite]) VALUES (16, 4, 1, CAST(N'08:00:00' AS Time), CAST(N'17:00:00' AS Time), 4)
INSERT [dbo].[PlageHoraire] ([id], [agence_id], [jour_semaine], [heure_ouverture], [heure_fermeture], [capacite]) VALUES (17, 4, 2, CAST(N'08:00:00' AS Time), CAST(N'17:00:00' AS Time), 4)
INSERT [dbo].[PlageHoraire] ([id], [agence_id], [jour_semaine], [heure_ouverture], [heure_fermeture], [capacite]) VALUES (18, 4, 3, CAST(N'08:00:00' AS Time), CAST(N'17:00:00' AS Time), 4)
INSERT [dbo].[PlageHoraire] ([id], [agence_id], [jour_semaine], [heure_ouverture], [heure_fermeture], [capacite]) VALUES (19, 4, 4, CAST(N'08:00:00' AS Time), CAST(N'17:00:00' AS Time), 4)
INSERT [dbo].[PlageHoraire] ([id], [agence_id], [jour_semaine], [heure_ouverture], [heure_fermeture], [capacite]) VALUES (20, 4, 5, CAST(N'08:00:00' AS Time), CAST(N'17:00:00' AS Time), 4)
INSERT [dbo].[PlageHoraire] ([id], [agence_id], [jour_semaine], [heure_ouverture], [heure_fermeture], [capacite]) VALUES (21, 5, 1, CAST(N'08:00:00' AS Time), CAST(N'17:00:00' AS Time), 4)
INSERT [dbo].[PlageHoraire] ([id], [agence_id], [jour_semaine], [heure_ouverture], [heure_fermeture], [capacite]) VALUES (22, 5, 2, CAST(N'08:00:00' AS Time), CAST(N'17:00:00' AS Time), 4)
INSERT [dbo].[PlageHoraire] ([id], [agence_id], [jour_semaine], [heure_ouverture], [heure_fermeture], [capacite]) VALUES (23, 5, 3, CAST(N'08:00:00' AS Time), CAST(N'17:00:00' AS Time), 4)
INSERT [dbo].[PlageHoraire] ([id], [agence_id], [jour_semaine], [heure_ouverture], [heure_fermeture], [capacite]) VALUES (24, 5, 4, CAST(N'08:00:00' AS Time), CAST(N'17:00:00' AS Time), 4)
INSERT [dbo].[PlageHoraire] ([id], [agence_id], [jour_semaine], [heure_ouverture], [heure_fermeture], [capacite]) VALUES (25, 5, 5, CAST(N'08:00:00' AS Time), CAST(N'17:00:00' AS Time), 4)
INSERT [dbo].[PlageHoraire] ([id], [agence_id], [jour_semaine], [heure_ouverture], [heure_fermeture], [capacite]) VALUES (26, 6, 1, CAST(N'08:00:00' AS Time), CAST(N'17:00:00' AS Time), 4)
INSERT [dbo].[PlageHoraire] ([id], [agence_id], [jour_semaine], [heure_ouverture], [heure_fermeture], [capacite]) VALUES (27, 6, 2, CAST(N'08:00:00' AS Time), CAST(N'17:00:00' AS Time), 4)
INSERT [dbo].[PlageHoraire] ([id], [agence_id], [jour_semaine], [heure_ouverture], [heure_fermeture], [capacite]) VALUES (28, 6, 3, CAST(N'08:00:00' AS Time), CAST(N'17:00:00' AS Time), 4)
INSERT [dbo].[PlageHoraire] ([id], [agence_id], [jour_semaine], [heure_ouverture], [heure_fermeture], [capacite]) VALUES (29, 6, 4, CAST(N'08:00:00' AS Time), CAST(N'17:00:00' AS Time), 4)
INSERT [dbo].[PlageHoraire] ([id], [agence_id], [jour_semaine], [heure_ouverture], [heure_fermeture], [capacite]) VALUES (30, 6, 5, CAST(N'08:00:00' AS Time), CAST(N'17:00:00' AS Time), 4)
SET IDENTITY_INSERT [dbo].[PlageHoraire] OFF
GO
SET IDENTITY_INSERT [dbo].[RendezVous] ON 

INSERT [dbo].[RendezVous] ([id], [client_id], [agent_id], [vehicule_id], [agence_id], [date_heure], [statut], [description], [duree_estimee], [heure_reelle_debut], [heure_reelle_fin], [date_creation], [date_modification], [raison_annulation], [date_annulation], [utilisateur_annulation], [email_confirmation], [sms_confirmation], [rappel_24h_sent], [rappel_2h_sent], [feedback_note], [feedback_commentaire], [date_feedback]) VALUES (1, 3, NULL, 7, 5, CAST(N'2026-03-30T08:00:00.0000000' AS DateTime2), N'ANNULE', NULL, 60, NULL, NULL, CAST(N'2026-03-28T15:32:24.7966667' AS DateTime2), CAST(N'2026-03-28T15:59:11.5966667' AS DateTime2), NULL, NULL, NULL, 0, 0, 0, 0, NULL, NULL, NULL)
INSERT [dbo].[RendezVous] ([id], [client_id], [agent_id], [vehicule_id], [agence_id], [date_heure], [statut], [description], [duree_estimee], [heure_reelle_debut], [heure_reelle_fin], [date_creation], [date_modification], [raison_annulation], [date_annulation], [utilisateur_annulation], [email_confirmation], [sms_confirmation], [rappel_24h_sent], [rappel_2h_sent], [feedback_note], [feedback_commentaire], [date_feedback]) VALUES (2, 3, NULL, 7, 5, CAST(N'2026-04-03T08:00:00.0000000' AS DateTime2), N'ANNULE', NULL, 60, NULL, NULL, CAST(N'2026-03-28T15:32:56.9333333' AS DateTime2), CAST(N'2026-03-28T15:40:56.2266667' AS DateTime2), NULL, NULL, NULL, 0, 0, 0, 0, NULL, NULL, NULL)
INSERT [dbo].[RendezVous] ([id], [client_id], [agent_id], [vehicule_id], [agence_id], [date_heure], [statut], [description], [duree_estimee], [heure_reelle_debut], [heure_reelle_fin], [date_creation], [date_modification], [raison_annulation], [date_annulation], [utilisateur_annulation], [email_confirmation], [sms_confirmation], [rappel_24h_sent], [rappel_2h_sent], [feedback_note], [feedback_commentaire], [date_feedback]) VALUES (3, 3, NULL, 6, 1, CAST(N'2026-03-30T11:00:00.0000000' AS DateTime2), N'PLANIFIE', NULL, 60, NULL, NULL, CAST(N'2026-03-28T15:33:55.9366667' AS DateTime2), NULL, NULL, NULL, NULL, 0, 0, 0, 0, NULL, NULL, NULL)
INSERT [dbo].[RendezVous] ([id], [client_id], [agent_id], [vehicule_id], [agence_id], [date_heure], [statut], [description], [duree_estimee], [heure_reelle_debut], [heure_reelle_fin], [date_creation], [date_modification], [raison_annulation], [date_annulation], [utilisateur_annulation], [email_confirmation], [sms_confirmation], [rappel_24h_sent], [rappel_2h_sent], [feedback_note], [feedback_commentaire], [date_feedback]) VALUES (4, 3, NULL, 7, 3, CAST(N'2026-05-15T11:00:00.0000000' AS DateTime2), N'PLANIFIE', NULL, 60, NULL, NULL, CAST(N'2026-03-28T15:46:58.5666667' AS DateTime2), NULL, NULL, NULL, NULL, 0, 0, 0, 0, NULL, NULL, NULL)
INSERT [dbo].[RendezVous] ([id], [client_id], [agent_id], [vehicule_id], [agence_id], [date_heure], [statut], [description], [duree_estimee], [heure_reelle_debut], [heure_reelle_fin], [date_creation], [date_modification], [raison_annulation], [date_annulation], [utilisateur_annulation], [email_confirmation], [sms_confirmation], [rappel_24h_sent], [rappel_2h_sent], [feedback_note], [feedback_commentaire], [date_feedback]) VALUES (5, 3, NULL, 7, 6, CAST(N'2026-06-05T09:00:00.0000000' AS DateTime2), N'PLANIFIE', N'kgcgc', 60, NULL, NULL, CAST(N'2026-03-30T12:08:17.3966667' AS DateTime2), NULL, NULL, NULL, NULL, 0, 0, 0, 0, NULL, NULL, NULL)
INSERT [dbo].[RendezVous] ([id], [client_id], [agent_id], [vehicule_id], [agence_id], [date_heure], [statut], [description], [duree_estimee], [heure_reelle_debut], [heure_reelle_fin], [date_creation], [date_modification], [raison_annulation], [date_annulation], [utilisateur_annulation], [email_confirmation], [sms_confirmation], [rappel_24h_sent], [rappel_2h_sent], [feedback_note], [feedback_commentaire], [date_feedback]) VALUES (6, 3, NULL, 8, 6, CAST(N'2026-07-21T09:00:00.0000000' AS DateTime2), N'PLANIFIE', N'aaaaaa', 60, NULL, NULL, CAST(N'2026-03-30T12:10:10.5700000' AS DateTime2), NULL, NULL, NULL, NULL, 0, 0, 0, 0, NULL, NULL, NULL)
SET IDENTITY_INSERT [dbo].[RendezVous] OFF
GO
SET IDENTITY_INSERT [dbo].[Role] ON 

INSERT [dbo].[Role] ([id], [nom], [description]) VALUES (1, N'CLIENT', N'Client propriétaire de véhicule')
INSERT [dbo].[Role] ([id], [nom], [description]) VALUES (2, N'AGENT', N'Agent SAV en agence')
INSERT [dbo].[Role] ([id], [nom], [description]) VALUES (3, N'ADMIN', N'Administrateur système')
INSERT [dbo].[Role] ([id], [nom], [description]) VALUES (4, N'DIRECTION', N'Profil direction — lecture seule')
SET IDENTITY_INSERT [dbo].[Role] OFF
GO
SET IDENTITY_INSERT [dbo].[SousTypeIntervention] ON 

INSERT [dbo].[SousTypeIntervention] ([id], [type_intervention_id], [nom], [duree_estimee]) VALUES (1, 1, N'Vidange huile moteur 5W30', 30)
INSERT [dbo].[SousTypeIntervention] ([id], [type_intervention_id], [nom], [duree_estimee]) VALUES (2, 1, N'Vidange huile moteur 10W40', 30)
INSERT [dbo].[SousTypeIntervention] ([id], [type_intervention_id], [nom], [duree_estimee]) VALUES (3, 1, N'Remplacement filtre à huile', 15)
INSERT [dbo].[SousTypeIntervention] ([id], [type_intervention_id], [nom], [duree_estimee]) VALUES (4, 2, N'Remplacement plaquettes avant', 60)
INSERT [dbo].[SousTypeIntervention] ([id], [type_intervention_id], [nom], [duree_estimee]) VALUES (5, 2, N'Remplacement disques avant', 90)
INSERT [dbo].[SousTypeIntervention] ([id], [type_intervention_id], [nom], [duree_estimee]) VALUES (6, 2, N'Remplacement plaquettes arrière', 60)
INSERT [dbo].[SousTypeIntervention] ([id], [type_intervention_id], [nom], [duree_estimee]) VALUES (7, 3, N'Permutation pneumatiques', 30)
INSERT [dbo].[SousTypeIntervention] ([id], [type_intervention_id], [nom], [duree_estimee]) VALUES (8, 3, N'Équilibrage roues', 30)
INSERT [dbo].[SousTypeIntervention] ([id], [type_intervention_id], [nom], [duree_estimee]) VALUES (9, 3, N'Remplacement pneu unique', 20)
INSERT [dbo].[SousTypeIntervention] ([id], [type_intervention_id], [nom], [duree_estimee]) VALUES (10, 4, N'Révision 15 000 km', 120)
INSERT [dbo].[SousTypeIntervention] ([id], [type_intervention_id], [nom], [duree_estimee]) VALUES (11, 4, N'Révision 30 000 km', 180)
INSERT [dbo].[SousTypeIntervention] ([id], [type_intervention_id], [nom], [duree_estimee]) VALUES (12, 5, N'Diagnostic électronique', 45)
INSERT [dbo].[SousTypeIntervention] ([id], [type_intervention_id], [nom], [duree_estimee]) VALUES (13, 5, N'Lecture codes défauts', 30)
INSERT [dbo].[SousTypeIntervention] ([id], [type_intervention_id], [nom], [duree_estimee]) VALUES (14, 6, N'Recharge climatisation', 60)
INSERT [dbo].[SousTypeIntervention] ([id], [type_intervention_id], [nom], [duree_estimee]) VALUES (15, 6, N'Nettoyage circuit climatisation', 45)
SET IDENTITY_INSERT [dbo].[SousTypeIntervention] OFF
GO
INSERT [dbo].[StatutIntervention] ([code], [libelle]) VALUES (N'ANNULEE', N'Annulée')
INSERT [dbo].[StatutIntervention] ([code], [libelle]) VALUES (N'EN_ATTENTE', N'En attente')
INSERT [dbo].[StatutIntervention] ([code], [libelle]) VALUES (N'EN_COURS', N'En cours')
INSERT [dbo].[StatutIntervention] ([code], [libelle]) VALUES (N'TERMINEE', N'Terminée')
GO
INSERT [dbo].[StatutRDV] ([code], [libelle]) VALUES (N'ANNULE', N'Annulé')
INSERT [dbo].[StatutRDV] ([code], [libelle]) VALUES (N'BROUILLON', N'Brouillon')
INSERT [dbo].[StatutRDV] ([code], [libelle]) VALUES (N'CONFIRME', N'Confirmé')
INSERT [dbo].[StatutRDV] ([code], [libelle]) VALUES (N'EN_COURS', N'En cours')
INSERT [dbo].[StatutRDV] ([code], [libelle]) VALUES (N'NO_SHOW', N'Non présenté')
INSERT [dbo].[StatutRDV] ([code], [libelle]) VALUES (N'PLANIFIE', N'Planifié')
INSERT [dbo].[StatutRDV] ([code], [libelle]) VALUES (N'REPROGRAMME', N'Reprogrammé')
INSERT [dbo].[StatutRDV] ([code], [libelle]) VALUES (N'TERMINE', N'Terminé')
GO
INSERT [dbo].[StatutReclamation] ([code], [libelle]) VALUES (N'CLOTUREE', N'Clôturée')
INSERT [dbo].[StatutReclamation] ([code], [libelle]) VALUES (N'EN_COURS', N'En cours de traitement')
INSERT [dbo].[StatutReclamation] ([code], [libelle]) VALUES (N'SOUMISE', N'Soumise')
INSERT [dbo].[StatutReclamation] ([code], [libelle]) VALUES (N'TRAITEE', N'Traitée')
GO
SET IDENTITY_INSERT [dbo].[TypeIntervention] ON 

INSERT [dbo].[TypeIntervention] ([id], [nom], [delai_moyen]) VALUES (1, N'Vidange', 30)
INSERT [dbo].[TypeIntervention] ([id], [nom], [delai_moyen]) VALUES (2, N'Freinage', 90)
INSERT [dbo].[TypeIntervention] ([id], [nom], [delai_moyen]) VALUES (3, N'Pneumatiques', 45)
INSERT [dbo].[TypeIntervention] ([id], [nom], [delai_moyen]) VALUES (4, N'Révision complète', 180)
INSERT [dbo].[TypeIntervention] ([id], [nom], [delai_moyen]) VALUES (5, N'Diagnostic', 60)
INSERT [dbo].[TypeIntervention] ([id], [nom], [delai_moyen]) VALUES (6, N'Climatisation', 90)
INSERT [dbo].[TypeIntervention] ([id], [nom], [delai_moyen]) VALUES (7, N'Carrosserie', 240)
SET IDENTITY_INSERT [dbo].[TypeIntervention] OFF
GO
INSERT [dbo].[TypeNotification] ([code], [libelle]) VALUES (N'EMAIL', N'Email transactionnel')
INSERT [dbo].[TypeNotification] ([code], [libelle]) VALUES (N'PUSH', N'Notification Push')
INSERT [dbo].[TypeNotification] ([code], [libelle]) VALUES (N'SMS', N'Message SMS')
GO
SET IDENTITY_INSERT [dbo].[Utilisateur] ON 

INSERT [dbo].[Utilisateur] ([id], [type_utilisateur], [nom], [prenom], [telephone], [email], [mot_de_passe], [actif], [date_creation], [role_id], [code_client], [adresse], [matricule], [agence_id], [niveau], [fonction]) VALUES (1, N'CLIENT', N'Ben Ali', N'Ahmed', N'+21698765432', N'ahmed@example.com', N'$2a$10$HaHPF6eQKvj1d/zkCKC3AuMVqkN0VYyJD96a0BHgFKiKoYQqIYgNC', 1, CAST(N'2026-03-13T02:03:56.6166667' AS DateTime2), 1, NULL, NULL, NULL, NULL, NULL, NULL)
INSERT [dbo].[Utilisateur] ([id], [type_utilisateur], [nom], [prenom], [telephone], [email], [mot_de_passe], [actif], [date_creation], [role_id], [code_client], [adresse], [matricule], [agence_id], [niveau], [fonction]) VALUES (2, N'CLIENT', N'gh', N'mohamed', N'+21629049816', N'client15@gmail.com', N'$2a$10$TL2JBQGm0Fyr7sg7wmy03.oRgyUGrQkCW..RYJrby4e/BMup8Q0Wi', 1, CAST(N'2026-03-13T03:31:36.5133333' AS DateTime2), 1, NULL, NULL, NULL, NULL, NULL, NULL)
INSERT [dbo].[Utilisateur] ([id], [type_utilisateur], [nom], [prenom], [telephone], [email], [mot_de_passe], [actif], [date_creation], [role_id], [code_client], [adresse], [matricule], [agence_id], [niveau], [fonction]) VALUES (3, N'CLIENT', N'arfaoui', N'azziz', N'+21628892051', N'clientaziz1@gmail.com', N'$2a$10$U5PUVle/va1bMyBqwUOWJeZHTRd8fTljd6tdq6wSG.pcgL0L7FHmq', 1, CAST(N'2026-03-13T23:57:43.0900000' AS DateTime2), 1, NULL, NULL, NULL, NULL, NULL, NULL)
INSERT [dbo].[Utilisateur] ([id], [type_utilisateur], [nom], [prenom], [telephone], [email], [mot_de_passe], [actif], [date_creation], [role_id], [code_client], [adresse], [matricule], [agence_id], [niveau], [fonction]) VALUES (4, N'CLIENT', N'Mohamed ', N'innov8ters', N'+21624770580', N'mohamedali@gmail.com', N'$2a$10$Jd3H8/UBzECenKK/.hooLew07X2cwIQ4f1Lqlg3x4HamJ3MEc6wo6', 1, CAST(N'2026-03-14T00:08:22.0166667' AS DateTime2), 1, NULL, NULL, NULL, NULL, NULL, NULL)
INSERT [dbo].[Utilisateur] ([id], [type_utilisateur], [nom], [prenom], [telephone], [email], [mot_de_passe], [actif], [date_creation], [role_id], [code_client], [adresse], [matricule], [agence_id], [niveau], [fonction]) VALUES (5, N'ADMIN', N'dali', N'mohamedali', N'+21629049816', N'mohamedaligh.15@gmail.com', N'$2a$10$5gOJzFmmbvLtECeO5Xtn8.TtarmhCpoRsGTfdpcN7boXcPkbXHw7y', 1, CAST(N'2026-03-14T00:49:47.4800000' AS DateTime2), 3, NULL, NULL, NULL, NULL, NULL, NULL)
SET IDENTITY_INSERT [dbo].[Utilisateur] OFF
GO
SET IDENTITY_INSERT [dbo].[Vehicule] ON 

INSERT [dbo].[Vehicule] ([id], [client_id], [version_id], [immatriculation], [numero_chassis], [couleur], [annee], [date_ajout]) VALUES (1, 1, 1, N'TU 123 456', N'VF1RFD00X56789012', N'Blanc', 2021, CAST(N'2026-03-13T02:04:42.4100000' AS DateTime2))
INSERT [dbo].[Vehicule] ([id], [client_id], [version_id], [immatriculation], [numero_chassis], [couleur], [annee], [date_ajout]) VALUES (6, 3, 6, N'147 تونس 591', N'6565651', NULL, 2015, CAST(N'2026-03-28T14:32:08.6400000' AS DateTime2))
INSERT [dbo].[Vehicule] ([id], [client_id], [version_id], [immatriculation], [numero_chassis], [couleur], [annee], [date_ajout]) VALUES (7, 3, 5, N'789 تونس 632', N'588595', NULL, 2014, CAST(N'2026-03-28T14:48:32.6566667' AS DateTime2))
INSERT [dbo].[Vehicule] ([id], [client_id], [version_id], [immatriculation], [numero_chassis], [couleur], [annee], [date_ajout]) VALUES (8, 3, 4, N'11785 ن.ت', N'102398578', N'noir', 2012, CAST(N'2026-03-30T12:09:04.1533333' AS DateTime2))
SET IDENTITY_INSERT [dbo].[Vehicule] OFF
GO
SET IDENTITY_INSERT [dbo].[Version] ON 

INSERT [dbo].[Version] ([id], [modele_id], [nom], [motorisation], [transmission], [actif]) VALUES (1, 1, N'Golf 1.6 TDI Trendline', N'1.6 TDI 105ch', N'MANUELLE', 1)
INSERT [dbo].[Version] ([id], [modele_id], [nom], [motorisation], [transmission], [actif]) VALUES (2, 1, N'Golf 2.0 TDI Highline', N'2.0 TDI 150ch', N'DSG', 1)
INSERT [dbo].[Version] ([id], [modele_id], [nom], [motorisation], [transmission], [actif]) VALUES (3, 2, N'Polo 1.2 TSI Comfortline', N'1.2 TSI 90ch', N'MANUELLE', 1)
INSERT [dbo].[Version] ([id], [modele_id], [nom], [motorisation], [transmission], [actif]) VALUES (4, 4, N'208 1.2 PureTech Active', N'1.2 PureTech 82ch', N'MANUELLE', 1)
INSERT [dbo].[Version] ([id], [modele_id], [nom], [motorisation], [transmission], [actif]) VALUES (5, 6, N'Clio 1.5 dCi Zen', N'1.5 dCi 90ch', N'MANUELLE', 1)
INSERT [dbo].[Version] ([id], [modele_id], [nom], [motorisation], [transmission], [actif]) VALUES (6, 8, N'Tucson 2.0 CRDi Premium', N'2.0 CRDi 185ch', N'AUTOMATIQUE', 1)
SET IDENTITY_INSERT [dbo].[Version] OFF
GO
/****** Object:  Index [IX_HistRDV_Date]    Script Date: 30/03/2026 1:54:32 PM ******/
CREATE NONCLUSTERED INDEX [IX_HistRDV_Date] ON [dbo].[HistoriqueRDV]
(
	[date_changement] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_HistRDV_RDV]    Script Date: 30/03/2026 1:54:32 PM ******/
CREATE NONCLUSTERED INDEX [IX_HistRDV_RDV] ON [dbo].[HistoriqueRDV]
(
	[rdv_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_IntRDV_RDV]    Script Date: 30/03/2026 1:54:32 PM ******/
CREATE NONCLUSTERED INDEX [IX_IntRDV_RDV] ON [dbo].[InterventionRDV]
(
	[rdv_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ_Marque_nom]    Script Date: 30/03/2026 1:54:32 PM ******/
ALTER TABLE [dbo].[Marque] ADD  CONSTRAINT [UQ_Marque_nom] UNIQUE NONCLUSTERED 
(
	[nom] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ_Modele]    Script Date: 30/03/2026 1:54:32 PM ******/
ALTER TABLE [dbo].[Modele] ADD  CONSTRAINT [UQ_Modele] UNIQUE NONCLUSTERED 
(
	[marque_id] ASC,
	[nom] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_Notif_Lu]    Script Date: 30/03/2026 1:54:32 PM ******/
CREATE NONCLUSTERED INDEX [IX_Notif_Lu] ON [dbo].[Notification]
(
	[lu] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_Notif_User]    Script Date: 30/03/2026 1:54:32 PM ******/
CREATE NONCLUSTERED INDEX [IX_Notif_User] ON [dbo].[Notification]
(
	[utilisateur_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ_Package_nom]    Script Date: 30/03/2026 1:54:32 PM ******/
ALTER TABLE [dbo].[PackageIntervention] ADD  CONSTRAINT [UQ_Package_nom] UNIQUE NONCLUSTERED 
(
	[nom] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ_Permission]    Script Date: 30/03/2026 1:54:32 PM ******/
ALTER TABLE [dbo].[Permission] ADD  CONSTRAINT [UQ_Permission] UNIQUE NONCLUSTERED 
(
	[role_id] ASC,
	[module] ASC,
	[action] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_PJ_Entite]    Script Date: 30/03/2026 1:54:32 PM ******/
CREATE NONCLUSTERED INDEX [IX_PJ_Entite] ON [dbo].[PieceJointe]
(
	[entite_type] ASC,
	[entite_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [UQ_PlageHoraire]    Script Date: 30/03/2026 1:54:32 PM ******/
ALTER TABLE [dbo].[PlageHoraire] ADD  CONSTRAINT [UQ_PlageHoraire] UNIQUE NONCLUSTERED 
(
	[agence_id] ASC,
	[jour_semaine] ASC,
	[heure_ouverture] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ_Rec_numero]    Script Date: 30/03/2026 1:54:32 PM ******/
ALTER TABLE [dbo].[Reclamation] ADD  CONSTRAINT [UQ_Rec_numero] UNIQUE NONCLUSTERED 
(
	[numero] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_Rec_Client]    Script Date: 30/03/2026 1:54:32 PM ******/
CREATE NONCLUSTERED INDEX [IX_Rec_Client] ON [dbo].[Reclamation]
(
	[client_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_Rec_Statut]    Script Date: 30/03/2026 1:54:32 PM ******/
CREATE NONCLUSTERED INDEX [IX_Rec_Statut] ON [dbo].[Reclamation]
(
	[statut] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_RDV_Agence]    Script Date: 30/03/2026 1:54:32 PM ******/
CREATE NONCLUSTERED INDEX [IX_RDV_Agence] ON [dbo].[RendezVous]
(
	[agence_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_RDV_Agent]    Script Date: 30/03/2026 1:54:32 PM ******/
CREATE NONCLUSTERED INDEX [IX_RDV_Agent] ON [dbo].[RendezVous]
(
	[agent_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_RDV_Client]    Script Date: 30/03/2026 1:54:32 PM ******/
CREATE NONCLUSTERED INDEX [IX_RDV_Client] ON [dbo].[RendezVous]
(
	[client_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_RDV_DateAnnulation]    Script Date: 30/03/2026 1:54:32 PM ******/
CREATE NONCLUSTERED INDEX [IX_RDV_DateAnnulation] ON [dbo].[RendezVous]
(
	[date_annulation] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_RDV_DateH]    Script Date: 30/03/2026 1:54:32 PM ******/
CREATE NONCLUSTERED INDEX [IX_RDV_DateH] ON [dbo].[RendezVous]
(
	[date_heure] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_RDV_Rappel24h]    Script Date: 30/03/2026 1:54:32 PM ******/
CREATE NONCLUSTERED INDEX [IX_RDV_Rappel24h] ON [dbo].[RendezVous]
(
	[rappel_24h_sent] ASC
)
WHERE ([rappel_24h_sent]=(0))
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_RDV_Rappel2h]    Script Date: 30/03/2026 1:54:32 PM ******/
CREATE NONCLUSTERED INDEX [IX_RDV_Rappel2h] ON [dbo].[RendezVous]
(
	[rappel_2h_sent] ASC
)
WHERE ([rappel_2h_sent]=(0))
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_RDV_Statut]    Script Date: 30/03/2026 1:54:32 PM ******/
CREATE NONCLUSTERED INDEX [IX_RDV_Statut] ON [dbo].[RendezVous]
(
	[statut] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ_Role_nom]    Script Date: 30/03/2026 1:54:32 PM ******/
ALTER TABLE [dbo].[Role] ADD  CONSTRAINT [UQ_Role_nom] UNIQUE NONCLUSTERED 
(
	[nom] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ_TypeInt_nom]    Script Date: 30/03/2026 1:54:32 PM ******/
ALTER TABLE [dbo].[TypeIntervention] ADD  CONSTRAINT [UQ_TypeInt_nom] UNIQUE NONCLUSTERED 
(
	[nom] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ_Utilisateur_email]    Script Date: 30/03/2026 1:54:32 PM ******/
ALTER TABLE [dbo].[Utilisateur] ADD  CONSTRAINT [UQ_Utilisateur_email] UNIQUE NONCLUSTERED 
(
	[email] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_Utilisateur_Agence]    Script Date: 30/03/2026 1:54:32 PM ******/
CREATE NONCLUSTERED INDEX [IX_Utilisateur_Agence] ON [dbo].[Utilisateur]
(
	[agence_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_Utilisateur_Email]    Script Date: 30/03/2026 1:54:32 PM ******/
CREATE NONCLUSTERED INDEX [IX_Utilisateur_Email] ON [dbo].[Utilisateur]
(
	[email] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_Utilisateur_Type]    Script Date: 30/03/2026 1:54:32 PM ******/
CREATE NONCLUSTERED INDEX [IX_Utilisateur_Type] ON [dbo].[Utilisateur]
(
	[type_utilisateur] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ_Vehicule_Chassis]    Script Date: 30/03/2026 1:54:32 PM ******/
ALTER TABLE [dbo].[Vehicule] ADD  CONSTRAINT [UQ_Vehicule_Chassis] UNIQUE NONCLUSTERED 
(
	[numero_chassis] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ_Vehicule_Immat]    Script Date: 30/03/2026 1:54:32 PM ******/
ALTER TABLE [dbo].[Vehicule] ADD  CONSTRAINT [UQ_Vehicule_Immat] UNIQUE NONCLUSTERED 
(
	[immatriculation] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_Vehicule_Client]    Script Date: 30/03/2026 1:54:32 PM ******/
CREATE NONCLUSTERED INDEX [IX_Vehicule_Client] ON [dbo].[Vehicule]
(
	[client_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_Vehicule_Immat]    Script Date: 30/03/2026 1:54:32 PM ******/
CREATE NONCLUSTERED INDEX [IX_Vehicule_Immat] ON [dbo].[Vehicule]
(
	[immatriculation] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ_Version]    Script Date: 30/03/2026 1:54:32 PM ******/
ALTER TABLE [dbo].[Version] ADD  CONSTRAINT [UQ_Version] UNIQUE NONCLUSTERED 
(
	[modele_id] ASC,
	[nom] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
ALTER TABLE [dbo].[HistoriqueRDV] ADD  DEFAULT (getdate()) FOR [date_changement]
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
ALTER TABLE [dbo].[PackageIntervention] ADD  DEFAULT ((0)) FOR [prix_estimatif]
GO
ALTER TABLE [dbo].[PackageIntervention] ADD  DEFAULT ((1)) FOR [actif]
GO
ALTER TABLE [dbo].[Permission] ADD  DEFAULT ((1)) FOR [actif]
GO
ALTER TABLE [dbo].[PieceJointe] ADD  DEFAULT (getdate()) FOR [date_upload]
GO
ALTER TABLE [dbo].[PlageHoraire] ADD  DEFAULT ((4)) FOR [capacite]
GO
ALTER TABLE [dbo].[Promotion] ADD  DEFAULT ((1)) FOR [actif]
GO
ALTER TABLE [dbo].[Promotion] ADD  DEFAULT (getdate()) FOR [date_creation]
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
ALTER TABLE [dbo].[Utilisateur] ADD  DEFAULT ((1)) FOR [actif]
GO
ALTER TABLE [dbo].[Utilisateur] ADD  DEFAULT (getdate()) FOR [date_creation]
GO
ALTER TABLE [dbo].[Vehicule] ADD  DEFAULT (getdate()) FOR [date_ajout]
GO
ALTER TABLE [dbo].[Version] ADD  DEFAULT ((1)) FOR [actif]
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
ALTER TABLE [dbo].[Permission]  WITH CHECK ADD  CONSTRAINT [FK_Permission_Role] FOREIGN KEY([role_id])
REFERENCES [dbo].[Role] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[Permission] CHECK CONSTRAINT [FK_Permission_Role]
GO
ALTER TABLE [dbo].[PlageHoraire]  WITH CHECK ADD  CONSTRAINT [FK_PlageHoraire_Agence] FOREIGN KEY([agence_id])
REFERENCES [dbo].[Agence] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[PlageHoraire] CHECK CONSTRAINT [FK_PlageHoraire_Agence]
GO
ALTER TABLE [dbo].[Promotion]  WITH CHECK ADD  CONSTRAINT [FK_Promo_Admin] FOREIGN KEY([admin_id])
REFERENCES [dbo].[Utilisateur] ([id])
GO
ALTER TABLE [dbo].[Promotion] CHECK CONSTRAINT [FK_Promo_Admin]
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
ALTER TABLE [dbo].[Utilisateur]  WITH CHECK ADD  CONSTRAINT [FK_Utilisateur_Role] FOREIGN KEY([role_id])
REFERENCES [dbo].[Role] ([id])
GO
ALTER TABLE [dbo].[Utilisateur] CHECK CONSTRAINT [FK_Utilisateur_Role]
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
ALTER TABLE [dbo].[PieceJointe]  WITH CHECK ADD  CONSTRAINT [CK_EntiteType] CHECK  (([entite_type]='RECLAMATION' OR [entite_type]='RDV'))
GO
ALTER TABLE [dbo].[PieceJointe] CHECK CONSTRAINT [CK_EntiteType]
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
ALTER TABLE [dbo].[RendezVous]  WITH CHECK ADD  CONSTRAINT [CK_RDV_DatePassee] CHECK  (([date_heure]>getdate() OR ([statut]='NO_SHOW' OR [statut]='ANNULE' OR [statut]='TERMINE')))
GO
ALTER TABLE [dbo].[RendezVous] CHECK CONSTRAINT [CK_RDV_DatePassee]
GO
ALTER TABLE [dbo].[RendezVous]  WITH CHECK ADD  CONSTRAINT [CK_RDV_Feedback_Note] CHECK  (([feedback_note] IS NULL OR [feedback_note]>=(1) AND [feedback_note]<=(5)))
GO
ALTER TABLE [dbo].[RendezVous] CHECK CONSTRAINT [CK_RDV_Feedback_Note]
GO
ALTER TABLE [dbo].[Utilisateur]  WITH CHECK ADD  CONSTRAINT [CK_TypeUtilisateur] CHECK  (([type_utilisateur]='DIRECTION' OR [type_utilisateur]='ADMIN' OR [type_utilisateur]='AGENT' OR [type_utilisateur]='CLIENT'))
GO
ALTER TABLE [dbo].[Utilisateur] CHECK CONSTRAINT [CK_TypeUtilisateur]
GO
ALTER TABLE [dbo].[Vehicule]  WITH CHECK ADD  CONSTRAINT [CK_Annee] CHECK  (([annee]>=(1950) AND [annee]<=(2100)))
GO
ALTER TABLE [dbo].[Vehicule] CHECK CONSTRAINT [CK_Annee]
GO
ALTER TABLE [dbo].[Version]  WITH CHECK ADD  CONSTRAINT [CK_Transmission] CHECK  (([transmission]='CVT' OR [transmission]='DSG' OR [transmission]='AUTOMATIQUE' OR [transmission]='MANUELLE' OR [transmission] IS NULL))
GO
ALTER TABLE [dbo].[Version] CHECK CONSTRAINT [CK_Transmission]
GO
/****** Object:  StoredProcedure [dbo].[SP_ChangerStatutReclamation]    Script Date: 30/03/2026 1:54:32 PM ******/
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
/****** Object:  StoredProcedure [dbo].[SP_ConfirmerRDV]    Script Date: 30/03/2026 1:54:32 PM ******/
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
/****** Object:  StoredProcedure [dbo].[SP_CreerRendezVous]    Script Date: 30/03/2026 1:54:32 PM ******/
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
/****** Object:  StoredProcedure [dbo].[SP_RapportJournalier]    Script Date: 30/03/2026 1:54:32 PM ******/
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
USE [master]
GO
ALTER DATABASE [STA_SAV_DB] SET  READ_WRITE 
GO
