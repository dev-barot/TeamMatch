export function createRequireAuth(tokenSigner) {
  return function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid authorization header.' });
    }

    const token = authHeader.substring(7);
    try {
      const decoded = tokenSigner.verifyAccessToken(token);
      req.user = {
        id: decoded.sub,
        email: decoded.email,
        accountType: decoded.accountType,
        isEmailVerified: decoded.isEmailVerified,
      };
      next();
    } catch {
      return res.status(401).json({ error: 'Unauthorized: Invalid or expired access token.' });
    }
  };
}
