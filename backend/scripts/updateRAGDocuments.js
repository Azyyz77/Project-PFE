// scripts/updateRAGDocuments.js
// Script pour mettre à jour les documents RAG avec les nouvelles fonctionnalités

const { ingestDocument, syncSQLServerData } = require('../services/ragService');

// Documents supplémentaires sur les fonctionnalités du système
const SYSTEM_DOCS = {
  // Système de notifications
  notifications: `
Système de Notifications STA Chery:
Le système dispose d'un centre de notifications en temps réel pour tous les utilisateurs.

Types de notifications:
- Confirmation de rendez-vous
- Rappels avant un rendez-vous (24h, 1h)
- Changement de statut de commande de réparation
- Messages promotionnels
- Validation de véhicule par un agent
- Nouvelles factures disponibles
- Réclamations traitées

Accès aux notifications:
- Icône de cloche dans la barre de navigation
- Badge avec le nombre de notifications non lues
- Marquage automatique comme lues lors de la consultation
- Conservation de l'historique des 30 derniers jours

Fonctionnalités:
- Notifications push en temps réel via WebSocket
- Filtrage par type de notification
- Suppression individuelle ou en masse
- Lien direct vers l'élément concerné (RDV, commande, facture...)
  `,

  // Vérification téléphonique
  phoneVerification: `
Vérification du Téléphone:
Les clients doivent vérifier leur numéro de téléphone pour accéder aux fonctionnalités complètes.

Processus:
1. Code à 6 chiffres envoyé par SMS/WhatsApp
2. Validité du code: 10 minutes
3. Maximum 5 tentatives par heure
4. Bannière de rappel si non vérifié

Fonctionnalités bloquées sans vérification:
- Prise de rendez-vous
- Ajout de véhicules
- Création de réclamations
- Consultation des factures

Code de vérification:
- Format: 6 chiffres numériques
- Envoyé via WhatsApp ou SMS
- Peut être renvoyé après 60 secondes
  `,

  // Système de réclamations
  complaints: `
Système de Réclamations STA Chery:
Les clients peuvent soumettre des réclamations qui sont traitées par les agents.

Processus de réclamation:
1. Client soumet une réclamation avec description
2. Numéro unique automatique (format: REC-YYYYMMDD-XXXXX)
3. Statut initial: "En attente"
4. Agent traite et répond à la réclamation
5. Historique complet conservé

Statuts possibles:
- En attente: Réclamation reçue, non encore traitée
- En cours: Agent travaille sur la réclamation
- Résolue: Réclamation traitée avec succès
- Fermée: Réclamation close définitivement

Informations collectées:
- Objet de la réclamation
- Description détaillée
- Date de soumission
- Véhicule concerné (optionnel)
- Rendez-vous concerné (optionnel)
- Réponse de l'agent
- Date de résolution

Notifications:
- Confirmation de réception
- Changement de statut
- Réponse de l'agent
  `,

  // Système de validation de véhicules
  vehicleValidation: `
Système de Validation des Véhicules:
Les véhicules ajoutés par les clients doivent être validés par un agent.

Workflow de validation:
1. Client ajoute un véhicule avec photos et documents
2. Statut initial: "En attente de validation"
3. Agent vérifie les informations et documents
4. Agent accepte ou rejette avec motif
5. Client reçoit une notification du résultat

Documents requis:
- Photo de la carte grise (recto/verso)
- Photo du carnet d'entretien
- Photo du certificat d'assurance
- Photos du véhicule (optionnel)

Validation agent:
- Vérification de la plaque d'immatriculation
- Vérification du numéro de châssis
- Vérification de la cohérence modèle/version
- Vérification de la validité des documents
- Possibilité d'ajouter des commentaires

Statuts:
- En attente: Véhicule ajouté, non vérifié
- Validé: Tous les documents sont conformes
- Rejeté: Documents non conformes ou informations erronées
  `,

  // Commandes de réparation
  repairOrders: `
Système de Commandes de Réparation (Ordres de Travail):
Gestion complète des ordres de travail et devis pour les réparations.

Création de commande:
- Depuis un rendez-vous existant (statut: Confirmé ou En cours)
- Informations auto-remplies: client, véhicule, agence
- Numéro automatique: CR-YYYYMMDD-XXXXX

Composition d'une commande:
- Lignes de type: Intervention, Pièce, ou Main d'œuvre
- Sélection depuis le catalogue d'interventions
- Ajout manuel de pièces avec prix
- Calcul automatique du montant total TTC
- Taux TVA configurable par agence (défaut: 19%)

Cycle de vie:
1. Brouillon: Commande en cours de création
2. Devis: Envoyé au client pour validation
3. Validée: Client a accepté le devis
4. En cours: Travaux en cours
5. Terminée: Réparation terminée, prête à facturer
6. Facturée: Facture générée
7. Annulée: Commande annulée

Facturation:
- Génération automatique de facture depuis une commande terminée
- Numéro de facture: FAC-YYYYMMDD-XXXXX
- Export PDF avec en-tête personnalisé agence
- TVA calculée automatiquement
- Conservation de l'historique

Suivi temps réel:
- Notifications à chaque changement de statut
- Consultation par le client depuis son espace
- Historique complet des modifications
  `,

  // Dashboard Direction
  directionDashboard: `
Espace Direction - Vue Stratégique STA Chery:
Tableau de bord réservé aux utilisateurs avec le rôle DIRECTION pour le suivi global.

Statistiques Globales:
- Total des rendez-vous sur toutes les agences
- Nombre de clients uniques
- Nombre total de véhicules enregistrés
- Durée moyenne des rendez-vous
- Répartition par statut (en attente, confirmé, terminé, annulé)
- Évolution mensuelle des RDV

Statistiques de Revenus:
- Revenu total généré (toutes agences)
- Revenu moyen par intervention
- Revenus minimum et maximum
- Revenus par agence avec classement
- Revenus par type d'intervention
- Comparaison mensuelle des revenus

Satisfaction Client:
- Note moyenne sur 5 étoiles
- Taux de satisfaction global (% de notes ≥4)
- Distribution des feedbacks (positifs, neutres, négatifs)
- Total des réclamations et taux de résolution
- Satisfaction par agence
- Commentaires clients récents

Performance:
- Top 10 agents par satisfaction client
- Performance individuelle des agents (RDV traités, durée moyenne)
- Classement par agence
- Statistiques de ponctualité

Rapports:
- Export PDF et Excel des statistiques
- Filtrage par période (date début/fin)
- Graphiques et visualisations
- Comparaisons inter-agences

Vue des Agences:
- Liste complète des agences avec KPIs
- Rendez-vous actifs par agence
- Revenus par agence
- Agents actifs par agence
- Satisfaction moyenne par agence

Vue du Personnel:
- Liste de tous les agents et employés
- Statistiques de performance individuelles
- Historique des interventions par agent
- Taux de satisfaction par agent

Facturation Globale:
- Vue consolidée des factures toutes agences
- Suivi des paiements
- Revenus par période
- Factures en attente/payées/impayées
  `,

  // Cache Redis pour Ollama
  cacheSystem: `
Système de Cache Redis pour Embeddings Ollama:
Amélioration des performances du système RAG avec mise en cache.

Fonctionnement:
- Les embeddings générés par Ollama sont mis en cache dans Redis
- Clé de cache: hash SHA-256 du texte de la question
- TTL (durée de vie): 30 jours par défaut
- Gain de performance: 200x plus rapide (2-5ms vs 500-1000ms)

Types de cache:
- Cache HIT: Embedding trouvé dans Redis (très rapide)
- Cache MISS: Embedding généré par Ollama puis mis en cache

Statistiques disponibles:
- Total de clés en cache
- Nombre de hits et misses
- Taux de hit (pourcentage)
- Temps de réponse moyen
- Taille totale du cache

Interface Admin:
- Consultation des statistiques en temps réel
- Visualisation du taux de cache hit
- Nettoyage du cache (flush)
- Historique des performances

Scripts de préchauffage:
- Script warmupCache.js avec 48 questions fréquentes
- Catégories: RDV, agences, packages, promotions, services, véhicules
- Amélioration immédiate des performances

Configuration:
- Redis sur Docker (port 6379)
- Modèle Ollama: nomic-embed-text
- Hash: SHA-256 pour les clés
- Sérialisation JSON des embeddings
  `,

  // Système de packages
  packages: `
Packages d'Intervention STA Chery:
Forfaits d'entretien prédéfinis pour simplifier la prise de rendez-vous.

Types de packages disponibles:
1. Révision Complète (Dès 250 TND)
   - Vidange huile moteur et filtre
   - Contrôle freinage et suspension
   - Vérification pneumatiques et géométrie
   - Diagnostic électronique complet
   - Durée: 180 minutes

2. Vidange Simple (Dès 80 TND)
   - Vidange huile moteur
   - Remplacement filtre à huile
   - Contrôle niveau liquides
   - Durée: 45 minutes

3. Entretien Freinage (Dès 150 TND)
   - Contrôle plaquettes et disques
   - Purge liquide de frein
   - Test efficacité freinage
   - Durée: 90 minutes

4. Contrôle Pneumatiques (Dès 50 TND)
   - Vérification pression et usure
   - Équilibrage roues
   - Géométrie des trains roulants
   - Durée: 60 minutes

5. Diagnostic Électronique (Dès 120 TND)
   - Lecture codes défauts
   - Diagnostic complet systèmes
   - Mise à jour calculateurs (si nécessaire)
   - Durée: 90 minutes

Avantages:
- Prix forfaitaire garanti
- Durée estimée connue à l'avance
- Interventions standardisées
- Possibilité de combiner plusieurs packages
- Promotions régulières sur certains packages
  `,

  // Promotions
  promotions: `
Système de Promotions STA Chery:
Offres spéciales et réductions sur services et packages.

Types de promotions:
- Réduction en pourcentage (-10%, -20%, -30%)
- Réduction en montant fixe (-50 TND, -100 TND)
- Offres groupées (2 services pour le prix d'1)
- Promotions saisonnières

Application:
- Promotions actives appliquées automatiquement
- Visibles lors de la prise de RDV
- Mentionnées dans les devis
- Code promo optionnel

Promotions fréquentes:
- Révision de printemps/été (mars-juin)
- Rentrée scolaire (septembre)
- Fin d'année (novembre-décembre)
- Anniversaire de l'agence
- Lancement nouveau modèle Chery

Période de validité:
- Date de début et date de fin définies
- Affichage automatique des promotions actives
- Alertes avant expiration

Éligibilité:
- Certaines promotions réservées aux nouveaux clients
- Promotions fidélité pour clients réguliers
- Offres spéciales membres
  `,

  // Assistant IA et Chatbot
  aiAssistant: `
Assistant IA Intelligent STA Chery:
Chatbot basé sur RAG (Retrieval Augmented Generation) avec Ollama.

Technologies:
- Ollama (modèle: gemma2:2b) pour la génération de réponses
- PostgreSQL + pgvector pour la recherche vectorielle
- Redis pour le cache des embeddings
- nomic-embed-text pour les embeddings

Fonctionnalités:
- Réponses en français et arabe tunisien (darija)
- Recherche sémantique dans la base de connaissances
- Accès aux données en temps réel (agences, packages, RDV)
- Personnalisation selon le profil client

Détection d'intention:
- Agences: localisations, horaires, contact
- Packages: forfaits, prix, durées
- Services: interventions disponibles
- Promotions: offres en cours
- RDV: prise et suivi de rendez-vous
- Commandes: statut des réparations
- Véhicules: modèles supportés
- Problèmes: solutions aux pannes courantes

Sources de données:
- Base de connaissances vectorielle (pgvector)
- Données temps réel depuis SQL Server
- Historique client personnalisé
- Feedbacks pour amélioration continue

Contexte personnalisé:
- Historique des 3 derniers RDV
- Véhicules enregistrés du client
- Agence favorite
- Préférences linguistiques

Amélioration continue:
- Apprentissage depuis les feedbacks négatifs
- Mise à jour automatique de la base de connaissances
- Synchronisation quotidienne avec SQL Server
  `,
};

async function updateAllRAGDocuments() {
  console.log('🚀 Mise à jour complète des documents RAG...\n');
  
  try {
    // 1. Synchroniser les données SQL Server (agences, packages, services, etc.)
    console.log('📊 Étape 1: Synchronisation des données SQL Server...');
    await syncSQLServerData();
    
    // 2. Ajouter les documents système supplémentaires
    console.log('\n📚 Étape 2: Ajout des documents système...');
    let count = 0;
    for (const [key, content] of Object.entries(SYSTEM_DOCS)) {
      await ingestDocument(content, `system_doc_${key}`, { 
        type: 'system_documentation',
        category: key,
        updated: new Date().toISOString()
      });
      count++;
      console.log(`   ✅ Document ingéré: ${key}`);
    }
    
    console.log(`\n✨ ${count} documents système ajoutés avec succès`);
    
    // 3. Ajouter des FAQs communes
    console.log('\n❓ Étape 3: Ajout des FAQs...');
    const faqs = [
      {
        q: "Comment prendre rendez-vous chez STA Chery ?",
        a: "Vous pouvez prendre rendez-vous en ligne depuis votre espace client. Sélectionnez votre agence, choisissez le package ou service souhaité, puis sélectionnez un créneau horaire disponible. Vous recevrez une confirmation par email et SMS."
      },
      {
        q: "Quels documents dois-je fournir pour valider mon véhicule ?",
        a: "Pour valider votre véhicule, vous devez fournir : la photo de la carte grise (recto et verso), le carnet d'entretien, et le certificat d'assurance. Des photos du véhicule peuvent être ajoutées mais sont optionnelles."
      },
      {
        q: "Comment suivre ma commande de réparation ?",
        a: "Vous pouvez suivre votre commande de réparation depuis votre espace client dans la section 'Mes Réparations'. Vous recevrez également des notifications à chaque changement de statut (devis, validation, en cours, terminée, facturée)."
      },
      {
        q: "Puis-je annuler mon rendez-vous ?",
        a: "Oui, vous pouvez annuler votre rendez-vous depuis votre espace client jusqu'à 24h avant l'heure prévue. Au-delà, veuillez contacter directement l'agence concernée."
      },
      {
        q: "Comment déposer une réclamation ?",
        a: "Rendez-vous dans votre espace client, section 'Réclamations'. Décrivez votre problème en détail. Vous recevrez un numéro de réclamation unique et serez notifié lorsqu'un agent aura traité votre demande."
      },
      {
        q: "Quels modèles Chery sont supportés par STA ?",
        a: "STA Chery supporte tous les modèles de la gamme Chery vendus en Tunisie, incluant Tiggo 4 Pro, Tiggo 7 Pro, Tiggo 8 Pro, Arrizo 5, et autres modèles récents. Tous les agents sont formés sur ces véhicules."
      },
      {
        q: "Combien de temps dure une révision complète ?",
        a: "Une révision complète dure environ 3 heures (180 minutes). Ce délai peut varier légèrement selon l'état du véhicule et les contrôles nécessaires. Vous pouvez attendre sur place ou déposer votre véhicule."
      },
      {
        q: "Les pièces de rechange sont-elles d'origine Chery ?",
        a: "Oui, toutes les pièces utilisées par STA sont des pièces d'origine Chery, garantissant la qualité et la compatibilité avec votre véhicule. Elles sont couvertes par la garantie constructeur."
      },
    ];
    
    for (const [index, faq] of faqs.entries()) {
      const text = `Question fréquente: ${faq.q}\n\nRéponse: ${faq.a}`;
      await ingestDocument(text, `faq_${index}`, { type: 'faq' });
      console.log(`   ✅ FAQ ${index + 1} ajoutée`);
    }
    
    console.log('\n🎉 Mise à jour RAG terminée avec succès !');
    console.log('\n📋 Résumé:');
    console.log(`   • Documents SQL Server: synchronisés`);
    console.log(`   • Documents système: ${count}`);
    console.log(`   • FAQs: ${faqs.length}`);
    console.log(`   • Total: ~${count + faqs.length + 50} documents dans la base vectorielle`);
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erreur lors de la mise à jour RAG:', error);
    process.exit(1);
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  updateAllRAGDocuments();
}

module.exports = { updateAllRAGDocuments, SYSTEM_DOCS };
