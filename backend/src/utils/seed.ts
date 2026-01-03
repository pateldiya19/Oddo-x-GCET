import dotenv from 'dotenv';
import { connectDatabase, disconnectDatabase } from '../config/database';
import logger from './logger';

dotenv.config();

const seedDatabase = async () => {
  try {
    await connectDatabase();
    
    logger.info('Initializing database...');
    logger.info('Database collections will be created automatically when users sign up');
    logger.info('No seed data - ready for real user registration!');

    await disconnectDatabase();
    logger.info('Database initialization complete');
    process.exit(0);
  } catch (error) {
    logger.error('Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();
