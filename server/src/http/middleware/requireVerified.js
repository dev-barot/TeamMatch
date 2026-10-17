/**
 * Rule R5: Verify before acting.
 * Blocks unverified Students from performing privileged actions.
 */
export function requireVerified(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  if (!req.user.isEmailVerified) {
    return res.status(403).json({
      error: 'Email verification is required before performing this action (R5).',
      code: 'EMAIL_NOT_VERIFIED',
    });
  }

  next();
}
