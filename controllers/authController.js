const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, role: user.role, restaurantId: user.restaurant },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user);

    res.json({ success: true, token, user: { id: user._id, email: user.email, role: user.role, restaurant: user.restaurant } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Login failed', error: err.message });
  }
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, restaurant } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, Email and password required' });
    }

    // Acceptable roles
    const allowedRoles = ['superadmin', 'admin', 'staff', 'customer', 'delivery'];
    const userRole = allowedRoles.includes(role) ? role : 'customer';

    // Roles that should NOT provide restaurant
    const rolesWithoutRestaurant = ['customer', 'delivery'];

    if (!rolesWithoutRestaurant.includes(userRole) && !restaurant) {
      return res.status(400).json({
        success: false,
        message: `Restaurant is required for ${userRole}`
      });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }

    // const hashedPassword = await bcrypt.hash(password, 10);

    const userData = {
      name,
      email,
      password,
      role: userRole
    };
    if (!rolesWithoutRestaurant.includes(userRole)) {
      userData.restaurant = restaurant;
    }
    const user = new User(userData);
    await user.save();

    res.status(201).json({ success: true, message: 'User registered successfully' });
  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).json({ success: false, message: 'Registration failed', error: err.message });
  }
};
