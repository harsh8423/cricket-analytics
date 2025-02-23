const jwt = require('jsonwebtoken');

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'your-jwt-secret';

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    
    // Log headers for debugging
    console.log('Auth Header:', authHeader);

    if (!authHeader) {
      return res.status(401).json({ message: 'No authorization header' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    try {
      // Verify and decode the token
      const decoded = jwt.verify(token, JWT_SECRET_KEY);
      
      // Check if token is about to expire (within 5 minutes)
      const tokenExp = decoded.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;

      if (tokenExp - now < fiveMinutes) {
        // Token is about to expire, send refresh needed signal
        res.set('X-Token-Expired', 'true');
      }

      // Attach user info to request
      req.user = decoded;
      next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        // Token has expired
        return res.status(401).json({ 
          message: 'Token has expired',
          code: 'TOKEN_EXPIRED'
        });
      }
      throw err;
    }
  } catch (err) {
    console.error('Token verification error:', err);
    return res.status(403).json({ 
      message: 'Invalid token',
      error: err.message 
    });
  }
};

module.exports = { verifyToken }; 