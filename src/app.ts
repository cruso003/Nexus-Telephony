import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

import config from '@/config';
import logger from '@/utils/logger';
import { errorHandler } from '@/middleware/errorHandler';
import { notFoundHandler } from '@/middleware/notFoundHandler';
import { authMiddleware } from '@/middleware/auth';

// Import routes
import callsRouter from '@/routes/calls';
import accountsRouter from '@/routes/accounts';
import authRouter from '@/routes/auth';

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://api.nexusai.africa', 'https://dashboard.nexusai.africa']
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}));

// Compression middleware
app.use(compression());

// Request logging
app.use(morgan('combined', {
  stream: {
    write: (message: string) => logger.info(message.trim()),
  },
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimiting.windowMs,
  max: config.rateLimiting.maxRequests,
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    region: config.regions.primary,
  });
});

// API documentation endpoint
app.get('/api', (_req, res) => {
  res.json({
    name: 'NexusAI Telephony API',
    description: 'The Twilio for Africa - AI-powered telephony platform',
    version: config.api_version,
    documentation: 'https://docs.nexusai.africa',
    support: 'https://support.nexusai.africa',
    status: 'operational',
    regions: config.regions,
  });
});

// Mount routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/accounts', authMiddleware, accountsRouter);
app.use('/api/v1/accounts/:accountSid/calls', authMiddleware, callsRouter);

// Twilio compatibility endpoints (redirect to our API)
app.use('/2010-04-01/Accounts/:accountSid/Calls', authMiddleware, callsRouter);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;