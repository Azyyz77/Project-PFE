/**
 * Composants réutilisables pour les pages AGENT
 * Réutilise les composants CLIENT pour maintenir la cohérence
 */

// Réexporter tous les composants client pour les agents
export {
  ClientPageWrapper as AgentPageWrapper,
  ClientPageHeader as AgentPageHeader,
  ClientButton as AgentButton,
  ClientCard as AgentCard,
  ClientCardHeader as AgentCardHeader,
  ClientCardContent as AgentCardContent,
  ClientEmptyState as AgentEmptyState,
  ClientLoadingState as AgentLoadingState,
  ClientErrorState as AgentErrorState,
  ClientStatCard as AgentStatCard,
} from '../client';

// Les agents utilisent exactement les mêmes composants que les clients
// Cela garantit une cohérence visuelle et facilite la maintenance
