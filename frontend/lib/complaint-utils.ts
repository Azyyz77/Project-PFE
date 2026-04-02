import { AlertTriangle, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export type ComplaintFormState = {
  sujet: string;
  description: string;
};

export const EMPTY_COMPLAINT_FORM: ComplaintFormState = {
  sujet: '',
  description: '',
};

export function getComplaintStatusIcon(statut: string) {
  switch (statut) {
    case 'SOUMISE':
      return AlertTriangle;
    case 'EN_COURS':
      return Clock;
    case 'TRAITEE':
      return CheckCircle;
    case 'CLOTUREE':
      return CheckCircle;
    default:
      return AlertCircle;
  }
}

export function getComplaintStatusColor(statut: string) {
  switch (statut) {
    case 'SOUMISE':
      return 'bg-yellow-50 border-yellow-200 text-yellow-700';
    case 'EN_COURS':
      return 'bg-blue-50 border-blue-200 text-blue-700';
    case 'TRAITEE':
      return 'bg-green-50 border-green-200 text-green-700';
    case 'CLOTUREE':
      return 'bg-gray-50 border-gray-200 text-gray-700';
    default:
      return 'bg-gray-50 border-gray-200 text-gray-700';
  }
}

export function getComplaintStatusLabel(statut: string): string {
  const labels: { [key: string]: string } = {
    SOUMISE: 'Soumise',
    EN_COURS: 'En cours',
    TRAITEE: 'Traitée',
    CLOTUREE: 'Clôturée'
  };
  return labels[statut] || statut;
}
