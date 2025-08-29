import { Request, Response, NextFunction } from 'express';
import { NexusError, ValidationError, AuthenticationError, AuthorizationError, NotFoundError } from '@/types';
import logger from '@/utils/logger';

export const errorHandler = (
  error: Error | NexusError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Log the error
  logger.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Handle known error types
  if (error instanceof ValidationError) {
    return res.status(400).json({
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    });
  }

  if (error instanceof AuthenticationError) {
    return res.status(401).json({
      error: {
        code: error.code,
        message: error.message,
      },
    });
  }

  if (error instanceof AuthorizationError) {
    return res.status(403).json({
      error: {
        code: error.code,
        message: error.message,
      },
    });
  }

  if (error instanceof NotFoundError) {
    return res.status(404).json({
      error: {
        code: error.code,
        message: error.message,
      },
    });
  }

  // Handle Joi validation errors
  if (error.name === 'ValidationError' && 'details' in error) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: (error as any).details,
      },
    });
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid authentication token',
      },
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: {
        code: 'TOKEN_EXPIRED',
        message: 'Authentication token has expired',
      },
    });
  }

  // Handle database errors
  if (error.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: {
        code: 'DATABASE_VALIDATION_ERROR',
        message: 'Database validation failed',
        details: (error as any).errors,
      },
    });
  }

  // Default to 500 server error
  const statusCode = 'statusCode' in error ? (error as NexusError).statusCode : 500;
  
  res.status(statusCode).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: process.env.NODE_ENV === 'production' 
        ? 'An unexpected error occurred' 
        : error.message,
      ...(process.env.NODE_ENV !== 'production' && { stack: error.stack }),
    },
  });
};