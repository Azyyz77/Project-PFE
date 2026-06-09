import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 100,
  duration: '30s',
};

// Exécuté UNE SEULE FOIS avant le test — récupère un token frais
export function setup() {
  const res = http.post('http://localhost:3000/api/users/login',
    JSON.stringify({
      email: 'clientaziz1@gmail.com',     // ← remplace
      password: 'dali2004'     // ← remplace
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  const token = res.json('token');     // adapte si ta réponse utilise 'accessToken' etc.
  console.log('Token obtenu:', token ? 'OK' : 'ECHEC');
  return { token };
}

// Exécuté par chaque VU — reçoit le token via data
export default function (data) {
  const headers = {
    'Authorization': `Bearer ${data.token}`,
    'Content-Type': 'application/json',
  };

  const res = http.get('http://localhost:3000/api/vehicles', { headers });

  check(res, {
    'status 200': (r) => r.status === 200,
    'latence < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(0.5);
}