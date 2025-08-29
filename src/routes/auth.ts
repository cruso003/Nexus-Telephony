import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import config from '@/config';
import { generateAccountSid, generateAuthToken, hashPassword, comparePassword } from '@/utils/helpers';
import { ValidationError, AuthenticationError } from '@/types';
import logger from '@/utils/logger';

const router = Router();

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  friendlyName: Joi.string().min(1).max(100).optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// In-memory storage for demo (replace with database in production)
const users: any[] = [];
const accounts: any[] = [];

// Register new account
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      throw new ValidationError('Validation failed', error.details);
    }

    const { email, password, friendlyName } = value;

    // Check if user already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      throw new ValidationError('User already exists with this email');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate account credentials
    const accountSid = generateAccountSid();
    const authToken = generateAuthToken();
    const userId = generateAccountSid(); // Using same format for user ID

    // Create user
    const user = {
      id: userId,
      email,
      password: hashedPassword,
      accountSid,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Create account
    const account = {
      sid: accountSid,
      friendlyName: friendlyName || email,
      status: 'active',
      type: 'Trial',
      authToken,
      dateCreated: new Date(),
      dateUpdated: new Date(),
      userId,
    };

    users.push(user);
    accounts.push(account);

    // Generate JWT token
    const token = jwt.sign(
      {
        id: userId,
        accountSid,
        email,
      },
      config.jwt.secret,
      { expiresIn: '7d' }
    );

    logger.info('New user registered', { email, accountSid });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: userId,
          email,
          accountSid,
        },
        account: {
          sid: accountSid,
          friendlyName: account.friendlyName,
          status: account.status,
          type: account.type,
          authToken,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Login
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      throw new ValidationError('Validation failed', error.details);
    }

    const { email, password } = value;

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Find account
    const account = accounts.find(a => a.userId === user.id);
    if (!account) {
      throw new AuthenticationError('Account not found');
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        accountSid: user.accountSid,
        email: user.email,
      },
      config.jwt.secret,
      { expiresIn: '7d' }
    );

    logger.info('User logged in', { email, accountSid: user.accountSid });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          accountSid: user.accountSid,
        },
        account: {
          sid: account.sid,
          friendlyName: account.friendlyName,
          status: account.status,
          type: account.type,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get current user profile
router.get('/profile', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No authorization token provided');
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, config.jwt.secret) as any;

    const user = users.find(u => u.id === decoded.id);
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    const account = accounts.find(a => a.userId === user.id);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          accountSid: user.accountSid,
          createdAt: user.createdAt,
        },
        account: account ? {
          sid: account.sid,
          friendlyName: account.friendlyName,
          status: account.status,
          type: account.type,
          dateCreated: account.dateCreated,
        } : null,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;