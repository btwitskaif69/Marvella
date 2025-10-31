// user.controller.js
// Uses: prisma client wrapper, bcrypt, jsonwebtoken, crypto, email service
// Env needed: JWT_SECRET, FRONTEND_URL

const prisma = require('../db/prismaClient');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
// const { sendPasswordResetEmail } = require('../services/email.service');

// ---- utils ----
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d', // adjust as needed
  });
};

const sanitizeUser = (user) => {
  if (!user) return null;
  const { passwordHash, ...safe } = user;
  return safe;
};

// ---- controllers ----

/**
 * Creates a single new user and logs them in.
 * POST /api/users
 * body: { name, email, password }
 */
exports.createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name: name || null,
        email,
        passwordHash,
        // role defaults to CUSTOMER per your schema
      },
    });

    const token = generateToken(user.id);
    res.status(201).json({
      message: 'User created successfully',
      user: sanitizeUser(user),
      token,
    });
  } catch (error) {
    // Prisma unique constraint
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return res.status(409).json({ message: 'Conflict: Email already exists.' });
    }
    console.error('[createUser]', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * Logs in an existing user.
 * POST /api/auth/login
 * body: { email, password }
 */
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      // timing-safe-ish dummy compare to avoid user enumeration
      await bcrypt.compare(password, '$2b$10$invalidinvalidinvalidinvalidinvxxxxxxx');
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(user.id);
    res.status(200).json({
      message: 'Login successful',
      user: sanitizeUser(user),
      token,
    });
  } catch (error) {
    console.error('[loginUser]', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * Creates multiple users from an array of user data.
 * POST /api/users/bulk
 * body: { users: [{ name, email, password }, ...] }
 */
exports.createManyUsers = async (req, res) => {
  try {
    const { users } = req.body || {};
    if (!users || !Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ message: 'A non-empty array of users is required.' });
    }

    const usersWithHashedPasswords = await Promise.all(
      users.map(async (u) => {
        if (!u.email || !u.password) {
          throw new Error('Each user must include email and password');
        }
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(u.password, salt);
        const { password, ...rest } = u;
        return { ...rest, passwordHash };
      })
    );

    const result = await prisma.user.createMany({
      data: usersWithHashedPasswords.map((u) => ({
        name: u.name || null,
        email: u.email,
        passwordHash: u.passwordHash,
        // role left to default
      })),
      skipDuplicates: true,
    });

    res.status(201).json({ message: 'Users created successfully', count: result.count });
  } catch (error) {
    console.error('[createManyUsers]', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * Gets the profile of the currently logged-in user.
 * GET /api/users/me
 * (req.user is expected to be attached by auth middleware)
 */
exports.getUserProfile = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.status(200).json(sanitizeUser(user));
  } catch (error) {
    console.error('[getUserProfile]', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * Handles a forgot password request.
 * POST /api/auth/forgot-password
 * body: { email }
 *
 * Requires a Prisma model named `PasswordResetToken` exposed as `passwordResetToken`:
 * model PasswordResetToken {
 *   id        String   @id @default(cuid())
 *   token     String   @unique
 *   expiresAt DateTime
 *   user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
 *   userId    String
 *   createdAt DateTime @default(now())
 *   @@index([userId])
 * }
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ message: 'email is required.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Always respond 200 to prevent email enumeration
    if (user) {
      // Invalidate any existing tokens for this user (optional but recommended)
      await prisma.passwordResetToken.deleteMany({
        where: { userId: user.id },
      });

      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await prisma.passwordResetToken.create({
        data: {
          token: hashedToken,
          expiresAt,
          userId: user.id,
        },
      });

      const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
      await sendPasswordResetEmail(user.email, resetUrl);
    }

    res.status(200).json({
      message: 'If that email exists, a reset link has been sent.',
    });
  } catch (error) {
    console.error('[forgotPassword]', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * Resets a user's password using a token.
 * POST /api/auth/reset-password/:token
 * body: { password }
 */
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body || {};

    if (!token || !password) {
      return res.status(400).json({ message: 'token and password are required.' });
    }

    // Hash incoming token to compare with DB
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find token
    const passwordResetToken = await prisma.passwordResetToken.findUnique({
      where: { token: hashedToken },
    });

    if (!passwordResetToken || passwordResetToken.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Token is invalid or has expired.' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Update user password
    await prisma.user.update({
      where: { id: passwordResetToken.userId },
      data: { passwordHash },
    });

    // Consume token
    await prisma.passwordResetToken.delete({ where: { id: passwordResetToken.id } });

    res.status(200).json({ message: 'Password has been reset successfully.' });
  } catch (error) {
    console.error('[resetPassword]', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
