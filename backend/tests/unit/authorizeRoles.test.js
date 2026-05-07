/**
 * Unit Tests: authorizeRoles middleware
 * Tests role-based authorization logic in complete isolation.
 */

const authorizeRoles = require('../../middleware/authorizeRoles');

// ─── Helpers ────────────────────────────────────────────────────────────────

const makeRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('authorizeRoles middleware', () => {
  it('UT11: returns 401 when req.user is undefined (not authenticated)', () => {
    const middleware = authorizeRoles('ADMIN');
    const req = {};  // No user property
    const res = makeRes();
    const next = jest.fn();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Non authentifié' }));
    expect(next).not.toHaveBeenCalled();
  });

  it('UT12: returns 403 when user has no role defined', () => {
    const middleware = authorizeRoles('ADMIN');
    const req = { user: { id: 5, email: 'x@x.com' } }; // No role
    const res = makeRes();
    const next = jest.fn();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('UT13: returns 403 when user role does not match any allowed role', () => {
    const middleware = authorizeRoles('ADMIN', 'DIRECTION');
    const req = { user: { id: 1, role: 'CLIENT' } };
    const res = makeRes();
    const next = jest.fn();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Accès non autorisé' })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('UT14: calls next() when user role matches an allowed role (exact case)', () => {
    const middleware = authorizeRoles('CLIENT');
    const req = { user: { id: 1, role: 'CLIENT' } };
    const res = makeRes();
    const next = jest.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('UT15: is case-insensitive — allows "client" when role in token is "CLIENT"', () => {
    const middleware = authorizeRoles('client');
    const req = { user: { id: 1, role: 'CLIENT' } };
    const res = makeRes();
    const next = jest.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('UT16: is case-insensitive — allows "ADMIN" when token has lowercase "admin"', () => {
    const middleware = authorizeRoles('ADMIN');
    const req = { user: { id: 99, role: 'admin' } };
    const res = makeRes();
    const next = jest.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('UT17: allows AGENT_SAV in a multi-role guard', () => {
    const middleware = authorizeRoles('AGENT_SAV', 'ADMIN', 'DIRECTION');
    const req = { user: { id: 10, role: 'AGENT_SAV' } };
    const res = makeRes();
    const next = jest.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('UT18: includes allowed roles in error message body', () => {
    const middleware = authorizeRoles('ADMIN', 'DIRECTION');
    const req = { user: { id: 1, role: 'CLIENT' } };
    const res = makeRes();
    const next = jest.fn();

    middleware(req, res, next);

    const jsonCall = res.json.mock.calls[0][0];
    expect(jsonCall.message).toContain('ADMIN');
    expect(jsonCall.message).toContain('DIRECTION');
    expect(jsonCall.message).toContain('CLIENT');
  });
});
