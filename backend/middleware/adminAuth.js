const jwt = require('jsonwebtoken');
const User = require('../models/User');

const adminAuth = async (req, res, next) => {
  try {
    // req.user is already set by verifyToken middleware
    const user = await User.findById(req.user.sub);
    
    if (!user || !user.isAdmin) {
      return res.status(403).json({ 
        message: 'Not authorized to access admin resources',
      });
    }

    // Add admin user to request
    req.adminUser = user;
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(401).json({ 
      message: 'Admin authentication failed',
    });
  }
};

module.exports = adminAuth; 