/**
 * Configuration du thème pour les pages AGENT
 * Utilise le même système que les pages CLIENT pour la cohérence
 */

import { clientTheme, clientClasses } from './clientTheme';

// Les agents utilisent exactement le même thème que les clients
// pour maintenir une cohérence visuelle dans toute l'application
export const agentTheme = {
  ...clientTheme,
  // Possibilité d'ajouter des variations spécifiques aux agents si nécessaire
};

export const agentClasses = {
  ...clientClasses,
  // Possibilité d'ajouter des classes spécifiques aux agents si nécessaire
};

// Réexporter la fonction cn pour la cohérence
export { cn } from './clientTheme';
