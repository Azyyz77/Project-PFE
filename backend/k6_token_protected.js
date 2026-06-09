import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: Number(__ENV.K6_VUS) || 10,
  duration: __ENV.K6_DURATION || '15s',
};

// Provide the token via env var K6_TOKEN
const TOKEN = __ENV.K6_TOKEN;
const PROTECTED = __ENV.PROTECTED_PATH || 'http://localhost:3000/api/repair-orders/my';

if (!TOKEN) {
  throw new Error('K6_TOKEN environment variable is required for this script');
}

export default function () {
  const params = { headers: { Authorization: `Bearer ${TOKEN}` } };
  const res = http.get(PROTECTED, params);
  check(res, { 'status is 200': (r) => r.status === 200 });
}
