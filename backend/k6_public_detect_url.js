import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 50,
  duration: '30s',
};

// Sample public image (replace if you prefer another)
const IMAGE_URL = __ENV.IMAGE_URL || 'https://upload.wikimedia.org/wikipedia/commons/3/3f/Fronalpstock_big.jpg';

export default function () {
  const payload = JSON.stringify({ imageUrl: IMAGE_URL });
  const params = { headers: { 'Content-Type': 'application/json' } };
  const res = http.post('http://localhost:3000/api/detect/url', payload, params);

  check(res, {
    'detect url status is 200': (r) => r.status === 200,
  });
}
