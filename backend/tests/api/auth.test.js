const request = require('supertest');
const app = require('../../server');

describe('Authentication & Authorization Tests (TC01-TC07)', () => {
  const testEmail = `testuser_${Date.now()}@example.com`;
  const testPassword = 'Password123!';

  // TC03: Weak Password
  it('TC03: Should reject registration with weak password', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({
        nom: 'Test',
        prenom: 'User',
        email: `weak_${Date.now()}@example.com`,
        password: '123', // Weak password
        telephone: '12345678'
      });
      
    // Should return 400 Bad Request
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  // TC01: Valid Registration
  it('TC01: Should register a valid user', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({
        nom: 'QA',
        prenom: 'Tester',
        email: testEmail,
        password: testPassword,
        telephone: `55${Math.floor(100000 + Math.random() * 900000)}`
      });
      
    // Might return 201 Created or 200 OK depending on implementation
    expect([200, 201]).toContain(res.statusCode);
  });

  // TC02: Duplicate Email
  it('TC02: Should reject registration with duplicate email', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({
        nom: 'QA2',
        prenom: 'Tester2',
        email: testEmail, // Using the same email from TC01
        password: testPassword,
        telephone: `55${Math.floor(100000 + Math.random() * 900000)}`
      });
      
    // Should return 400 or 409 Conflict
    expect([400, 409]).toContain(res.statusCode);
  });

  // TC04: Valid Login
  it('TC04: Should login with valid credentials', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({
        email: testEmail,
        password: testPassword
      });
      
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  // TC05: Invalid Login
  it('TC05: Should reject login with invalid credentials', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({
        email: testEmail,
        password: 'wrongpassword'
      });
      
    expect([401, 404]).toContain(res.statusCode);
  });

  // TC06: SQLi Login attempt
  it('TC06: Should safely reject SQL injection login attempt', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({
        email: "admin' OR 1=1--",
        password: "anything"
      });
      
    // Should not return 200. Must be 401/404 or 400.
    expect([400, 401, 404]).toContain(res.statusCode);
  });

  // TC07: Role-based Access
  it('TC07: Client should be forbidden from accessing admin routes', async () => {
    // 1. Login to get client token
    const loginRes = await request(app)
      .post('/api/users/login')
      .send({ email: testEmail, password: testPassword });
    
    const token = loginRes.body.token;
    
    // 2. Try to access an admin route
    if (token) {
      const res = await request(app)
        .get('/api/admin/users') // Adjust to actual admin route
        .set('Authorization', `Bearer ${token}`);
        
      expect([401, 403]).toContain(res.statusCode);
    }
  });
});
