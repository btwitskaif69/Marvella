// user.routes.js
const express = require('express');
const jwt = require('jsonwebtoken');

const prisma = require('../db/prismaClient');
const userController = require('../controllers/user.controller');

const router = express.Router();

/**
 * Minimal auth middleware:
 * - Expects Authorization: Bearer <token>
 * - Verifies JWT using process.env.JWT_SECRET
 * - Attaches req.user = { id } (you can expand to include role, etc.)
 */
const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Optionally check user still exists (and/or not disabled)
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Attach minimal info; controller can fetch more if needed
    req.user = { id: user.id };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

/**
 * Routes
 * Adjust the base path when mounting, e.g. app.use('/api', router)
 */

// Auth
router.post('/auth/register', userController.createUser);
router.post('/auth/login', userController.loginUser);
router.post('/auth/forgot-password', userController.forgotPassword);
router.post('/auth/reset-password/:token', userController.resetPassword);

// Current user
router.get('/users/me', protect, userController.getUserProfile);

// Bulk create (keep protected; tighten to admin-only if you add roles)
router.post('/users/bulk', protect, userController.createManyUsers);

module.exports = router;
