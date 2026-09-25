const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ message: '로그인이 필요합니다.' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'development-only-secret');
    return next();
  } catch {
    return res.status(401).json({ message: '로그인이 만료되었습니다.' });
  }
}

module.exports = authenticate;
