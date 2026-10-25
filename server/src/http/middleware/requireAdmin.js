import { ACCOUNT_TYPES } from '../../domain/identity/Account.js';

/**
 * Rule R2: Only an Admin can perform admin actions.
 * Must be used AFTER requireAuth so req.user is populated.
 *
 * Checks the accountType claim in the JWT payload.
 * Boundary note: domain-level check lives in each use case too
 * (don't trust only middleware — consistent with requireVerified pattern).
 */
export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  if (req.user.accountType !== ACCOUNT_TYPES.ADMIN) {
    return res.status(403).json({
      error: 'Admin access required. This action is restricted to Admins only (R2).',
      code: 'ADMIN_REQUIRED',
      rule: 'R2',
    });
  }

  next();
}
