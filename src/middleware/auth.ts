import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '@/config';
import { AuthenticationError, AuthorizationError } from '@/types';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    accountSid: string;
    email: string;
  };
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      throw new AuthenticationError('No authorization header provided');
    }

    // Support both Bearer token and Basic auth (for Twilio compatibility)
    let token: string;
    
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (authHeader.startsWith('Basic ')) {
      // Decode Basic auth for Twilio compatibility
      const base64Credentials = authHeader.substring(6);
      const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
      const [_accountSid, authToken] = credentials.split(':');
      
      // For now, we'll use the authToken as the JWT token
      // In a real implementation, you'd validate against stored account credentials
      token = authToken;
    } else {
      throw new AuthenticationError('Invalid authorization format');
    }

    // Verify JWT token
    const decoded = jwt.verify(token, config.jwt.secret) as any;
    
    req.user = {
      id: decoded.id,
      accountSid: decoded.accountSid,
      email: decoded.email,
    };

    // Check if the account SID in the URL matches the authenticated user
    if (req.params.accountSid && req.params.accountSid !== req.user.accountSid) {
      throw new AuthorizationError('Access denied to this account');
    }

    next();
  } catch (error) {
    if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
      next(error);
    } else {
      next(new AuthenticationError('Invalid authentication token'));
    }
  }
};

// Optional auth middleware for public endpoints
export const optionalAuthMiddleware = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader) {
      await authMiddleware(req, _res, next);
    } else {
      next();
    }
  } catch (error) {
    // Ignore auth errors for optional auth
    next();
  }
};