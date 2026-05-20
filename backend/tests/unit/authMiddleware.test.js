/**
 * Unit Tests: authMiddleware
 * Tests JWT verification, error handling, and hasRole guard — fully mocked, no DB.
 */

const jwt = require('jsonwebtoken');

// Mock the database module so no real connection is attempted
jest.mock('../../config/database', () => ({
  getConnection: jest.fn(),
  sql: { BigInt: 'BigInt' },
}));

jest.mock('../../config/redis', () => ({
  get: jest.fn().mockResolvedValue(null),
  setex: jest.fn().mockResolvedValue('OK'),
}));

const { authMiddleware, hasRole } = require('../../middleware/authMiddleware');

// ─── Helpers ────────────────────────────────────────────────────────────────

const makeRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const makeReq = (authHeader) => ({
  headers: { authorization: authHeader },
  method: 'GET',
  path: '/test',
});

const SECRET = 'test_secret';

beforeAll(() => {
  process.env.JWT_SECRET = SECRET;
});

// ─── authMiddleware ──────────────────────────────────────────────────────────

describe('authMiddleware', () => {
  it('UT01: returns 401 when Authorization header is missing', async () => {
    const req = makeReq(undefined);
    const res = makeRes();
    const next = jest.fn();

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Token non fourni' }));
    expect(next).not.toHaveBeenCalled();
  });

  it('UT02: returns 401 when token is missing after "Bearer "', async () => {
    const req = makeReq('Bearer ');
    const res = makeRes();
    const next = jest.fn();

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('UT03: returns 401 for an expired JWT token', async () => {
    // Create a token that is already expired
    const expiredToken = jwt.sign({ id: 1, email: 'a@b.com', role: 'CLIENT' }, SECRET, { expiresIn: -1 });
    const req = makeReq(`Bearer ${expiredToken}`);
    const res = makeRes();
    const next = jest.fn();

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Token expiré' }));
    expect(next).not.toHaveBeenCalled();
  });

  it('UT04: returns 401 for a tampered/invalid JWT token', async () => {
    const req = makeReq('Bearer this.is.not.a.valid.token');
    const res = makeRes();
    const next = jest.fn();

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Token invalide' }));
    expect(next).not.toHaveBeenCalled();
  });

  it('UT05: populates req.user and calls next() for a valid token', async () => {
    const payload = { id: 42, email: 'user@test.com', role: 'CLIENT', agence_id: 3 };
    const token = jwt.sign(payload, SECRET, { expiresIn: '1h' });
    const req = makeReq(`Bearer ${token}`);
    const res = makeRes();
    const next = jest.fn();

    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toMatchObject({
      id: 42,
      email: 'user@test.com',
      role: 'CLIENT',
      agence_id: 3,
    });
  });

  it('UT06: populates req.user with agence_id=undefined when not in token', async () => {
    const payload = { id: 10, email: 'admin@test.com', role: 'ADMIN' };
    const token = jwt.sign(payload, SECRET, { expiresIn: '1h' });
    const req = makeReq(`Bearer ${token}`);
    const res = makeRes();
    const next = jest.fn();

    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user.agence_id).toBeUndefined();
  });

  it('UT11: accepts token from query param when header is missing', async () => {
    const payload = { id: 7, email: 'query@test.com', role: 'CLIENT' };
    const token = jwt.sign(payload, SECRET, { expiresIn: '1h' });
    const req = {
      headers: {},
      query: { token },
      method: 'GET',
      path: '/test',
    };
    const res = makeRes();
    const next = jest.fn();

    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toMatchObject({
      id: 7,
      email: 'query@test.com',
      role: 'CLIENT',
    });
  });
});

// ─── hasRole ────────────────────────────────────────────────────────────────

describe('hasRole middleware', () => {
  it('UT07: returns 401 if req.user is not set', () => {
    const middleware = hasRole('ADMIN');
    const req = { user: null };
    const res = makeRes();
    const next = jest.fn();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('UT08: returns 403 if user role is not in allowed list', () => {
    const middleware = hasRole('ADMIN', 'DIRECTION');
    const req = { user: { id: 1, role: 'CLIENT' } };
    const res = makeRes();
    const next = jest.fn();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('UT09: calls next() when user role is in the allowed list', () => {
    const middleware = hasRole('CLIENT', 'ADMIN');
    const req = { user: { id: 1, role: 'CLIENT' } };
    const res = makeRes();
    const next = jest.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('UT10: allows access for any role in a multi-role list', () => {
    const middleware = hasRole('AGENT_SAV', 'ADMIN', 'DIRECTION');
    const req = { user: { id: 2, role: 'DIRECTION' } };
    const res = makeRes();
    const next = jest.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });
});
