const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

function signToken(user) {
  // include both shapes to stay compatible with different middlewares/frontends
  const payload = {
    id: String(user._id),
    role: user.role,
    email: user.email,
    user: { id: String(user._id), role: user.role, email: user.email },
  };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
}

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashed,
      // default to student unless explicitly sent
      role: role || 'student',
    });

    return res.status(201).json({
      message: 'User registered successfully',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // simple admin login shortcut used by the existing UI
    if (email === 'admin@gmail.com' && password === 'admin123') {
      const token = jwt.sign(
        {
          id: 'admin',
          role: 'admin',
          email: 'admin@gmail.com',
          user: { id: 'admin', role: 'admin', email: 'admin@gmail.com' },
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({ token, role: 'admin', user: { id: 'admin', name: 'Admin', email: 'admin@gmail.com', role: 'admin' } });
    }

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = signToken(user);
    return res.json({
      token,
      role: user.role,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
