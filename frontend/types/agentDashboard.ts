// types/agentDashboard.ts — Types TypeScript pour le dashboard agent SAV

export type AppointmentStatus = 'PLANIFIE' | 'CONFIRME' | 'EN_COURS' | 'TERMINE' | 'ANNULE';
export type VehicleStatus     = 'EN_ATTENTE' | 'VALIDE' | 'REFUSE';
export type ComplaintStatus   = 'OUVERTE' | 'EN_COURS' | 'RESOLUE' | 'FERMEE';
export type ComplaintPriority = 'BASSE' | 'NORMAL' | 'HAUTE' | 'CRITIQUE';

// ── Dashboard summary ──────────────────────────────────────
export interface DashboardSummary {
  rendez_vous_en_attente:  number;
  interventions_en_cours:  number;
  rendez_vous_aujourd_hui: number;
  interventions_terminees: number;
  reclamations_ouvertes:   number;
  vehicules_a_valider:     number;
  timestamp: string;
}

// ── Intervention ───────────────────────────────────────────
export interface Intervention {
  id:            number;
  statut:        string;
  sous_type_nom: string;
  type_nom:      string;
  prix:          number;
  notes?:        string;
  delai_moyen?:  number;
}

// ── Rendez-vous ────────────────────────────────────────────
export interface Appointment {
  id:                  number;
  client_id:           number;
  vehicule_id:         number;
  agence_id:           number;
  agent_id?:           number;
  date_rendez_vous:    string;
  statut:              AppointmentStatus;
  description?:        string;
  duree_estimee?:      number;
  duree_reelle?:       number;
  heure_debut_reelle?: string;
  heure_fin_reelle?:   string;
  motif_annulation?:   string;
  date_creation:       string;
  // Joins
  client_nom:        string;
  client_prenom:     string;
  client_telephone?: string;
  client_email?:     string;
  immatriculation:   string;
  vin?:              string;
  agence_nom:        string;
  agence_ville:      string;
  marque_nom:        string;
  modele_nom:        string;
  interventions:     Intervention[];
}

// ── Véhicule ───────────────────────────────────────────────
export interface Vehicle {
  id:                number;
  immatriculation:   string;
  vin:               string;
  annee?:            number;
  statut_validation: VehicleStatus;
  motif_refus?:      string;
  date_creation:     string;
  client_nom:        string;
  client_prenom:     string;
  telephone?:        string;
  email?:            string;
  marque:            string;
  modele:            string;
}

// ── Réclamation ────────────────────────────────────────────
export interface ComplaintResponse {
  id:            number;
  message:       string;
  date_creation: string;
  agent_nom:     string;
  agent_prenom:  string;
}

export interface Complaint {
  id:               number;
  sujet:            string;
  description:      string;
  statut:           ComplaintStatus;
  priorite:         ComplaintPriority;
  date_creation:    string;
  date_resolution?: string;
  client_nom:       string;
  client_prenom:    string;
  email?:           string;
  telephone?:       string;
  rdv_id?:          number;
  date_rendez_vous?: string;
  reponses:         ComplaintResponse[];
}

// ── Notification ───────────────────────────────────────────
export interface AgentNotification {
  id:           number;
  titre:        string;
  message:      string;
  type:         string;
  entite_type?: string;
  entite_id?:   number;
  lu:           boolean;
  date_creation: string;
}

// ── Statistiques ───────────────────────────────────────────
export interface DailyStats {
  jour:     string;
  nombre:   number;
  termines: number;
  annules:  number;
}

export interface TypeStats {
  type:         string;
  nombre:       number;
  temps_moyen?: number;
}

export interface ComplaintStats {
  total:    number;
  ouvertes: number;
  en_cours: number;
  resolues: number;
  fermees:  number;
}

export interface Statistics {
  daily:      DailyStats[];
  byType:     TypeStats[];
  complaints: ComplaintStats;
  avgTime:    number;
}
