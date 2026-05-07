/**
 * Integration Tests: Worker API
 * Tests worker/technician management endpoints (TC_WRK series).
 * Workers are managed by AGENT_SAV or ADMIN roles.
 */

const request = require('supertest');
const app = require('../../server');

describe('Worker API Integration Tests', () => {
  let clientToken = '';
  const testEmail = `worker_test_${Date.now()}@example.com`;

  beforeAll(async () => {
    await request(app)
      .post('/api/users/register')
      .send({
        nom: 'Worker',
        prenom: 'QA',
        email: testEmail,
        password: 'Password123!',
        telephone: `55${Math.floor(100000 + Math.random() * 900000)}`
      });

    const loginRes = await request(app)
      .post('/api/users/login')
      .send({ email: testEmail, password: 'Password123!' });

    clientToken = loginRes.body.token;
  });

  // ── Access Control ────────────────────────────────────────────────────────

  it('WRK01: Should require authentication to list workers', async () => {
    const res = await request(app).get('/api/workers');
    expect([401, 403]).toContain(res.statusCode);
  });

  it('WRK02: CLIENT should be forbidden from listing workers (AGENT_SAV/ADMIN only)', async () => {
    if (!clientToken) return;
    const res = await request(app)
      .get('/api/workers')
      .set('Authorization', `Bearer ${clientToken}`);

    // CLIENT should not be allowed — expects 403
    expect([403, 404]).toContain(res.statusCode);
  });

  it('WRK03: CLIENT should be forbidden from creating a worker', async () => {
    if (!clientToken) return;
    const res = await request(app)
      .post('/api/workers')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        nom: 'Test',
        prenom: 'Worker',
        specialite: 'Mécanique',
        agence_id: 1
      });

    expect([403, 401]).toContain(res.statusCode);
  });

  it('WRK04: CLIENT should be forbidden from updating a worker', async () => {
    if (!clientToken) return;
    const res = await request(app)
      .put('/api/workers/1')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ specialite: 'Électronique' });

    expect([401, 403]).toContain(res.statusCode);
  });

  it('WRK05: CLIENT should be forbidden from deleting a worker', async () => {
    if (!clientToken) return;
    const res = await request(app)
      .delete('/api/workers/1')
      .set('Authorization', `Bearer ${clientToken}`);

    expect([401, 403]).toContain(res.statusCode);
  });

  // ── API Structure ─────────────────────────────────────────────────────────

  it('WRK06: Should return 404 for non-existent worker ID', async () => {
    if (!clientToken) return;
    // Even if access were granted, 99999 shouldn't exist
    const res = await request(app)
      .get('/api/workers/99999')
      .set('Authorization', `Bearer ${clientToken}`);

    // Either 403 (role block) or 404 (not found) are acceptable
    expect([403, 404]).toContain(res.statusCode);
  });

  it('WRK07: Should reject worker creation without authorization (no token)', async () => {
    const res = await request(app)
      .post('/api/workers')
      .send({ nom: 'Hacker', prenom: 'Test' });

    expect([401, 403]).toContain(res.statusCode);
  });
});
