const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

const makeToken = (user) => jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

exports.register = asyncHandler(async (req, res) => {
  const { schoolId, fullName, email, password, confirmPassword } = req.body;

  if (!schoolId || !fullName || !email || !password) return res.status(400).json({ message: 'Please fill in all fields.' });
  if (!/^[A-Za-z0-9-]{3,20}$/.test(schoolId.trim())) return res.status(400).json({ message: 'School ID may only contain letters, numbers and dashes.' });
  if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ message: 'Please enter a valid email.' });
  if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' });
  if (confirmPassword !== undefined && confirmPassword !== password) return res.status(400).json({ message: 'Passwords do not match.' });

  if (await User.findOne({ schoolId: schoolId.trim().toUpperCase() })) return res.status(409).json({ message: 'School ID already exists.' });
  if (await User.findOne({ email: email.trim().toLowerCase() })) return res.status(409).json({ message: 'Email is already registered.' });

  const hashed = await bcrypt.hash(password, 10);
  // role is ALWAYS "student" here, whatever the client sends.
  const user = await User.create({ schoolId, fullName, email, password: hashed, role: 'student' });

  res.status(201).json({ message: 'Account created successfully!', token: makeToken(user), user });
});

exports.login = asyncHandler(async (req, res) => {
  const { schoolId, password } = req.body;
  if (!schoolId || !password) return res.status(400).json({ message: 'Please enter your School ID and password.' });

  const user = await User.findOne({ schoolId: schoolId.trim().toUpperCase() });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid School ID or password.' });
  }
  res.json({ token: makeToken(user), user });
});

exports.me = (req, res) => res.json({ user: req.user });
