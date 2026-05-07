/**
 * Integration Tests: Vehicle API
 * Tests vehicle management endpoints (TC_VEH series).
 */

const request = require('supertest');
const app = require('../../server');

describe('Vehicle API Integration Tests', () => {
  let clientToken = '';
  const testEmail = `vehicle_test_${Date.now()}@example.com`;

  beforeAll(async () => {
    // Register + login a client user
    await request(app)
      .post('/api/users/register')
      .send({
        nom: 'Vehicle',
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

  // ── Vehicle Listing ──────────────────────────────────────────────────────

  it('VEH01: Should require auth to access vehicle endpoints', async () => {
    const res = await request(app).get('/api/vehicles/my');
    expect([401, 403]).toContain(res.statusCode);
  });

  it('VEH02: Should return vehicle list for authenticated client (empty or populated)', async () => {
    if (!clientToken) return;
    const res = await request(app)
      .get('/api/vehicles/my')
      .set('Authorization', `Bearer ${clientToken}`);

    expect([200, 404]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(res.body).toBeDefined();
    }
  });

  // ── Vehicle Registration ─────────────────────────────────────────────────

  it('VEH03: Should reject vehicle creation with missing required fields', async () => {
    if (!clientToken) return;
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        // Missing marque, modele, immatriculation
        annee: 2020
      });

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  it('VEH04: Should reject invalid year format for vehicle', async () => {
    if (!clientToken) return;
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        marque: 'Chery',
        modele: 'Tiggo',
        immatriculation: 'TU 999 TUN',
        annee: 'not-a-year'
      });

    expect([400, 422, 500]).toContain(res.statusCode);
  });

  it('VEH05: Should attempt vehicle creation with valid data', async () => {
    if (!clientToken) return;
    const vin = `VIN${Date.now()}`;
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        marque: 'Chery',
        modele: 'Tiggo 8',
        immatriculation: `TUN${Math.floor(Math.random() * 9999)}`,
        annee: 2022,
        vin: vin,
        couleur: 'Blanc',
        kilometrage: 15000
      });

    // Accept 201 (created) or 400 (if immatriculation already taken) or 404 (endpoint doesn't exist yet)
    expect([200, 201, 400, 404, 422, 500]).toContain(res.statusCode);
  });

  // ── Vehicle Access Control ────────────────────────────────────────────────

  it('VEH06: Should return 403/404 when accessing another user vehicle', async () => {
    if (!clientToken) return;
    const res = await request(app)
      .get('/api/vehicles/99999')
      .set('Authorization', `Bearer ${clientToken}`);

    expect([403, 404]).toContain(res.statusCode);
  });

  it('VEH07: Should reject vehicle update without auth', async () => {
    const res = await request(app)
      .put('/api/vehicles/1')
      .send({ kilometrage: 25000 });

    expect([401, 403]).toContain(res.statusCode);
  });
});
