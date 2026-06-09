import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: Number(__ENV.K6_VUS) || 50,
  duration: __ENV.K6_DURATION || '30s',
};

const LOGIN_URL =
  __ENV.LOGIN_URL || 'http://localhost:3000/api/users/login';

const PROTECTED =
  __ENV.PROTECTED_PATH || 'http://localhost:3000/api/repair-orders';

export function setup() {
  const credentials = {
    email: __ENV.K6_EMAIL || 'admin@example.com',
    password: __ENV.K6_PASSWORD || 'password',
  };

  const loginRes = http.post(LOGIN_URL, JSON.stringify(credentials), {
    headers: { 'Content-Type': 'application/json' },
  });

  if (loginRes.status !== 200) {
    console.error('Login failed:', loginRes.status, loginRes.body);
    return {};
  }

  const token = loginRes.json('token');

  return { token };
}

export default function (data) {
  const token = data.token;

  const params = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };

  const res = http.get(PROTECTED, params);

  check(res, {
    'status is 200': (r) => r.status === 200,
  });
}