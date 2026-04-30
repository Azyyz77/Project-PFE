/**
 * API client pour les messages d'accueil
 */

import api from './axios';
import {
  WelcomeMessage,
  CreateWelcomeMessageDto,
  UpdateWelcomeMessageDto
} from '@/types/promotions';

/**
 * Obtenir les messages actifs pour l'utilisateur connecté
 */
export async function getActiveMessages(params?: {
  agence_id?: number;
  afficher_accueil?: boolean;
  afficher_dashboard?: boolean;
}): Promise<WelcomeMessage[]> {
  const response = await api.get('/welcome-messages/active', { params });
  return response.data.messages;
}

/**
 * Marquer un message comme lu
 */
export async function markMessageAsRead(id: number): Promise<void> {
  await api.post(`/welcome-messages/${id}/read`);
}

/**
 * Obtenir tous les messages (admin)
 */
export async function getAllMessages(params?: {
  actif?: boolean;
  type?: string;
  agence_id?: number;
}): Promise<WelcomeMessage[]> {
  const response = await api.get('/welcome-messages', { params });
  return response.data.messages;
}

/**
 * Obtenir un message par ID (admin)
 */
export async function getMessageById(id: number): Promise<WelcomeMessage> {
  const response = await api.get(`/welcome-messages/${id}`);
  return response.data.message;
}

/**
 * Créer un nouveau message (admin)
 */
export async function createMessage(
  data: CreateWelcomeMessageDto
): Promise<WelcomeMessage> {
  const response = await api.post('/welcome-messages', data);
  return response.data.data;
}

/**
 * Mettre à jour un message (admin)
 */
export async function updateMessage(
  id: number,
  data: UpdateWelcomeMessageDto
): Promise<WelcomeMessage> {
  const response = await api.put(`/welcome-messages/${id}`, data);
  return response.data.data;
}

/**
 * Supprimer (désactiver) un message (admin)
 */
export async function deleteMessage(id: number): Promise<void> {
  await api.delete(`/welcome-messages/${id}`);
}
