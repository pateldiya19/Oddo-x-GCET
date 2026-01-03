import mongoose from 'mongoose';
import { config } from './index';
import logger from '../utils/logger';

export const connectDatabase = async (): Promise<void> => {
  try {
    const uri = config.nodeEnv === 'test' ? config.mongodbUriTest : config.mongodbUri;
    
    await mongoose.connect(uri);
    
    logger.info(`MongoDB connected: ${mongoose.connection.host}`);
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected');
  } catch (error) {
    logger.error('MongoDB disconnection error:', error);
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  logger.info('Mongoose connected to database');
});

mongoose.connection.on('error', (err: Error) => {
  logger.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  logger.info('Mongoose disconnected');
});

// Handle application termination
process.on('SIGINT', async () => {
  await disconnectDatabase();
  process.exit(0);
});
