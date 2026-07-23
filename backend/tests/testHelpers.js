const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function createTestUser({ role = 'user', overrides = {} } = {}) {
  const user = await User.create({
    firstName: 'Test',
    lastName: 'User',
    email: overrides.email || `test${Date.now()}${Math.random()}@example.com`,
    password: 'Password123!',
    role,
    isEmailVerified: true,
    ...overrides,
  });
  return user;
}

function authHeaderFor(user) {
  const token = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '1h' });
  return { Authorization: `Bearer ${token}` };
}

module.exports = { createTestUser, authHeaderFor };
