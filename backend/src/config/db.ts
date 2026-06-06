import mongoose from 'mongoose';
import { config } from './env';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 3000;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const connectDB = async () => {
  if (!config.databaseUrl) {
    console.warn('DATABASE_URL not set. Skipping MongoDB connection.');
    return;
  }

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const conn = await mongoose.connect(config.databaseUrl, {
        serverSelectionTimeoutMS: 15000,
        connectTimeoutMS: 15000,
        retryWrites: true,
        w: 'majority',
      });
      console.log(`MongoDB connected: ${conn.connection.host}`);
      return;
    } catch (error: any) {
      const msg = error.message || '';
      console.error(`MongoDB connection attempt ${attempt}/${MAX_RETRIES} failed:`, msg);
      if (msg.includes('authentication') || msg.includes('auth')) {
        console.error('Check your DATABASE_URL username and password');
        break;
      }
      if (attempt < MAX_RETRIES) {
        console.log(`Retrying in ${RETRY_DELAY_MS / 1000}s...`);
        await sleep(RETRY_DELAY_MS);
      } else {
        console.warn('All MongoDB connection attempts exhausted. Server will continue without database.');
      }
    }
  }
};
