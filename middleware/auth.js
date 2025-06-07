const jwt = require('jsonwebtoken');
const User = require('../models/user'); // Make sure path is correct

exports.protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch full user details from DB, including restaurant
    const user = await User.findById(decoded.userId).populate('restaurant');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    req.user = user; // user has .restaurant available
    next();
  } catch (err) {
    console.error('JWT verification error:', err);
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

exports.requireRole = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Forbidden: insufficient role' });
  }
  next();
};

exports.requireAdmin = exports.requireRole(['admin', 'superadmin']);
