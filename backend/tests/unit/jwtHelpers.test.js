/**
 * Unit Tests: JWT Utility Logic
 * Tests token signing, expiry, and payload integrity — fully isolated.
 */

const jwt = require('jsonwebtoken');

const SECRET = 'unit_test_jwt_secret';

describe('JWT Token Logic', () => {
  it('UT19: should sign and verify a valid token', () => {
    const payload = { id: 1, email: 'test@example.com', role: 'CLIENT' };
    const token = jwt.sign(payload, SECRET, { expiresIn: '1h' });
    const decoded = jwt.verify(token, SECRET);

    expect(decoded.id).toBe(1);
    expect(decoded.email).toBe('test@example.com');
    expect(decoded.role).toBe('CLIENT');
  });

  it('UT20: should include iat (issued at) and exp (expiry) claims', () => {
    const token = jwt.sign({ id: 5 }, SECRET, { expiresIn: '2h' });
    const decoded = jwt.decode(token);

    expect(decoded.iat).toBeDefined();
    expect(decoded.exp).toBeDefined();
    expect(decoded.exp).toBeGreaterThan(decoded.iat);
  });

  it('UT21: should throw TokenExpiredError for an expired token', () => {
    const token = jwt.sign({ id: 1 }, SECRET, { expiresIn: -1 });

    expect(() => jwt.verify(token, SECRET)).toThrow(jwt.TokenExpiredError);
  });

  it('UT22: should throw JsonWebTokenError for a token signed with wrong secret', () => {
    const token = jwt.sign({ id: 1 }, 'wrong_secret', { expiresIn: '1h' });

    expect(() => jwt.verify(token, SECRET)).toThrow(jwt.JsonWebTokenError);
  });

  it('UT23: should throw JsonWebTokenError for a completely malformed token', () => {
    expect(() => jwt.verify('not.a.token', SECRET)).toThrow(jwt.JsonWebTokenError);
  });

  it('UT24: payload should preserve agence_id (multi-tenant field)', () => {
    const payload = { id: 7, role: 'AGENT_SAV', agence_id: 3 };
    const token = jwt.sign(payload, SECRET, { expiresIn: '1h' });
    const decoded = jwt.verify(token, SECRET);

    expect(decoded.agence_id).toBe(3);
  });

  it('UT25: decoded token should not expose the signing secret', () => {
    const token = jwt.sign({ id: 1 }, SECRET, { expiresIn: '1h' });
    const decoded = jwt.decode(token);

    expect(JSON.stringify(decoded)).not.toContain(SECRET);
  });
});
