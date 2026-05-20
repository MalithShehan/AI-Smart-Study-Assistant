/**
 * Auth middleware placeholder.
 * Replace the body with real JWT verification (e.g., jsonwebtoken) when ready.
 *
 * Usage: add `auth` to any route that requires authentication.
 *   router.get('/protected', auth, controller.handler);
 */
const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const err = new Error('Unauthorized: missing or invalid Authorization header');
    err.statusCode = 401;
    return next(err);
  }

  const token = authHeader.split(' ')[1];
  // TODO: verify token (e.g., jwt.verify(token, config.jwt.secret))
  // and attach the decoded payload to req.user
  req.user = { token }; // placeholder
  next();
};

module.exports = auth;
