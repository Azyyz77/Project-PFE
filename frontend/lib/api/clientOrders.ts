const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Types
export interface ClientOrder {
  id: number;
  date_heure: string;
  statut: string;
  description: string;
  duree_estimee: number;
  heure_reelle_debut: string | null;
  heure_reelle_fin: string | null;
  date_creation: string;
  immatriculation: string;
  marque_nom: string;
  modele_nom: string;
  version_nom: string;
  agence_nom: string;
  agence_ville: string;
  agence_telephone: string;
  agent_nom: string | null;
  agent_prenom: string | null;
  nombre_interventions: number;
  cout_total: number | null;
}

export interface OrderIntervention {
  id: number;
  statut: string;
  duree_reelle: number | null;
  commentaire: string | null;
  date_debut: string | null;
  date_fin: string | null;
  cout_reel: number | null;
  sous_type_nom: string;
  duree_estimee: number;
  type_nom: string;
}

export interface OrderAttachment {
  id: number;
  nom_fichier: string;
  nom_original: string;
  type_fichier: string;
  taille_ko: number;
  url_stockage: string;
  description: string | null;
  date_ajout: string;
}

export interface OrderDetails {
  order: ClientOrder & {
    numero_chassis: string;
    couleur: string;
    annee: number;
    agence_adresse: string;
    agent_telephone: string | null;
    date_modification: string | null;
  };
  interventions: OrderIntervention[];
  attachments: OrderAttachment[];
}

export interface OrdersStats {
  total_commandes: number;
  planifiees: number;
  confirmees: number;
  en_cours: number;
  terminees: number;
  annulees: number;
  cout_total: number | null;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

function buildAuthHeaders(token: string) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

async function parseJson<T>(response: Response): Promise<T> {
  const result = await response.json();
  if (!response.ok) {
    throw new ApiError(response.status, result.error || result.message || 'Erreur API');
  }
  return result as T;
}

/**
 * Récupérer toutes les commandes du client
 */
export async function getMyOrders(token: string): Promise<ClientOrder[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/client/orders`, {
      method: 'GET',
      headers: buildAuthHeaders(token),
    });

    const result = await parseJson<{ orders: ClientOrder[] }>(response);
    return result.orders;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Erreur de connexion au serveur');
  }
}

/**
 * Récupérer les statistiques des commandes
 */
export async function getOrdersStats(token: string): Promise<OrdersStats> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/client/orders/stats`, {
      method: 'GET',
      headers: buildAuthHeaders(token),
    });

    const result = await parseJson<{ stats: OrdersStats }>(response);
    return result.stats;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Erreur de connexion au serveur');
  }
}

/**
 * Récupérer les détails d'une commande
 */
export async function getOrderDetails(orderId: number, token: string): Promise<OrderDetails> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/client/orders/${orderId}`, {
      method: 'GET',
      headers: buildAuthHeaders(token),
    });

    return await parseJson<OrderDetails>(response);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Erreur de connexion au serveur');
  }
}
