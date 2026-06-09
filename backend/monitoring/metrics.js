const client = require('prom-client');

const register = client.register;

// Métriques système (CPU, mémoire Node.js)
client.collectDefaultMetrics({ register });

// Latence des requêtes
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Durée des requêtes HTTP en secondes',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.05, 0.1, 0.3, 0.5, 1, 1.5, 2, 5],
});

// Nombre total de requêtes
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Nombre total de requêtes HTTP',
  labelNames: ['method', 'route', 'status_code'],
});

// Connexions actives
const activeConnections = new client.Gauge({
  name: 'http_active_connections',
  help: 'Nombre de connexions HTTP actives',
});

module.exports = { register, httpRequestDuration, httpRequestsTotal, activeConnections };