export interface Agency {
  id: number;
  nom: string;
  ville: string;
  telephone?: string;
  adresse?: string;
}

export interface Slot {
  hour: number;
  label: string;
  capacity: number;
  reserved: number;
  available: number;
  is_full: boolean;
  configured_capacity?: number;
}

export interface InterventionSubtype {
  id: number;
  nom: string;
  duree_estimee?: number;
}

export interface InterventionType {
  id: number;
  nom: string;
  delai_moyen?: number;
  sous_types: InterventionSubtype[];
}

export interface AppointmentIntervention {
  id: number;
  statut: string;
  sous_type_nom: string;
  type_nom: string;
  duree_estimee?: number;
}

export interface Appointment {
  id: number;
  client_id: number;
  vehicule_id: number;
  agence_id: number;
  date_heure: string;
  statut: string;
  description?: string;
  duree_estimee?: number;
  date_creation?: string;
  agence_nom?: string;
  agence_ville?: string;
  agence_adresse?: string;
  agence_telephone?: string;
  immatriculation?: string;
  numero_chassis?: string;
  marque_nom?: string;
  modele_nom?: string;
  interventions?: AppointmentIntervention[];
}

export interface CreateAppointmentPayload {
  vehicule_id: number;
  agence_id: number;
  date_heure: string;
  description?: string;
  duree_estimee?: number;
  sous_type_ids?: number[];
}

export interface CancelAppointmentPayload {
  raison?: string;
}

export interface AgenciesResponse {
  count: number;
  agencies: Agency[];
}

export interface SlotsResponse {
  count: number;
  slots: Slot[];
}

export interface InterventionsResponse {
  count: number;
  interventions: InterventionType[];
}

export interface MyAppointmentsResponse {
  count: number;
  appointments: Appointment[];
}

export interface AppointmentDetailsResponse {
  appointment: Appointment;
  interventions: AppointmentIntervention[];
}

export interface CreateAppointmentResponse {
  message: string;
  appointment: Appointment;
  interventions: AppointmentIntervention[];
}
