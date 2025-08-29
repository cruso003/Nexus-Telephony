import app from './app';
import config from '@/config';
import logger from '@/utils/logger';

const PORT = config.port;

// Create logs directory if it doesn't exist
import fs from 'fs';
if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs');
}

const server = app.listen(PORT, () => {
  logger.info(`🚀 NexusAI Telephony API Server started`, {
    port: PORT,
    environment: config.node_env,
    region: config.regions.primary,
    version: config.api_version,
  });
  
  logger.info('🌍 Available endpoints:', {
    health: `http://localhost:${PORT}/health`,
    api: `http://localhost:${PORT}/api`,
    auth: `http://localhost:${PORT}/api/v1/auth`,
    docs: 'https://docs.nexusai.africa',
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default server;