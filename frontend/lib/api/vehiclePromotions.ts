/**
 * API client pour les promotions véhicules
 */

import api from './axios';
import {
  VehiclePromotion,
  CreateVehiclePromotionDto,
  UpdateVehiclePromotionDto
} from '@/types/promotions';

/**
 * Obtenir toutes les promotions actives (public)
 */
export async function getActivePromotions(params?: {
  agence_id?: number;
  marque_id?: number;
}): Promise<VehiclePromotion[]> {
  const response = await api.get('/vehicle-promotions/public/active', { params });
  return response.data.promotions;
}

/**
 * Obtenir une promotion par ID (public)
 */
export async function getPromotionById(id: number): Promise<VehiclePromotion> {
  const response = await api.get(`/vehicle-promotions/public/${id}`);
  return response.data.promotion;
}

/**
 * Obtenir toutes les promotions (admin)
 */
export async function getAllPromotions(params?: {
  actif?: boolean;
  agence_id?: number;
}): Promise<VehiclePromotion[]> {
  const response = await api.get('/vehicle-promotions', { params });
  return response.data.promotions;
}

/**
 * Créer une nouvelle promotion (admin)
 */
export async function createPromotion(
  data: CreateVehiclePromotionDto
): Promise<VehiclePromotion> {
  const response = await api.post('/vehicle-promotions', data);
  return response.data.promotion;
}

/**
 * Mettre à jour une promotion (admin)
 */
export async function updatePromotion(
  id: number,
  data: UpdateVehiclePromotionDto
): Promise<VehiclePromotion> {
  const response = await api.put(`/vehicle-promotions/${id}`, data);
  return response.data.promotion;
}

/**
 * Supprimer (désactiver) une promotion (admin)
 */
export async function deletePromotion(id: number): Promise<void> {
  await api.delete(`/vehicle-promotions/${id}`);
}
