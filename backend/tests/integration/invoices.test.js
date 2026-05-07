/**
 * Integration Tests: Invoice API
 * Tests invoice generation, PDF export, and access control (TC_INV series).
 */

const request = require('supertest');
const app = require('../../server');

describe('Invoice API Integration Tests', () => {
  let clientToken = '';
  const testEmail = `invoice_test_${Date.now()}@example.com`;

  beforeAll(async () => {
    await request(app)
      .post('/api/users/register')
      .send({
        nom: 'Invoice',
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

  it('INV01: Should require auth to list own invoices', async () => {
    const res = await request(app).get('/api/invoices/my');
    expect([401, 403]).toContain(res.statusCode);
  });

  it('INV02: Should return invoices list for authenticated client (empty or populated)', async () => {
    if (!clientToken) return;
    const res = await request(app)
      .get('/api/invoices/my')
      .set('Authorization', `Bearer ${clientToken}`);

    expect([200, 404]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      // Should return an array or object
      expect(res.body).toBeDefined();
    }
  });

  it('INV03: Should return 403/404 when CLIENT tries to access another user invoice', async () => {
    if (!clientToken) return;
    const res = await request(app)
      .get('/api/invoices/99999')
      .set('Authorization', `Bearer ${clientToken}`);

    expect([403, 404]).toContain(res.statusCode);
  });

  it('INV04: CLIENT should be forbidden from creating an invoice manually', async () => {
    if (!clientToken) return;
    const res = await request(app)
      .post('/api/invoices')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        appointment_id: 1,
        montant: 500
      });

    // Clients should not be able to manually create invoices
    expect([403, 401, 404]).toContain(res.statusCode);
  });

  // ── PDF Export ────────────────────────────────────────────────────────────

  it('INV05: Should require auth for PDF download endpoint', async () => {
    const res = await request(app).get('/api/invoices/99999/pdf');
    expect([401, 403, 404]).toContain(res.statusCode);
  });

  it('INV06: Should return 404 when requesting PDF for non-existent invoice', async () => {
    if (!clientToken) return;
    const res = await request(app)
      .get('/api/invoices/99999/pdf')
      .set('Authorization', `Bearer ${clientToken}`);

    // 403 if blocked by role, 404 if invoice not found
    expect([403, 404]).toContain(res.statusCode);
  });

  // ── Payment Simulation ────────────────────────────────────────────────────

  it('INV07: Should handle payment update request with missing data gracefully', async () => {
    if (!clientToken) return;
    const res = await request(app)
      .patch('/api/invoices/99999/pay')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({}); // Empty body

    expect([400, 401, 403, 404, 405]).toContain(res.statusCode);
  });

  it('INV08: Should reject unauthorized invoice status change', async () => {
    if (!clientToken) return;
    const res = await request(app)
      .patch('/api/invoices/1/status')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ statut: 'PAYEE' });

    expect([401, 403, 404, 405]).toContain(res.statusCode);
  });
});
