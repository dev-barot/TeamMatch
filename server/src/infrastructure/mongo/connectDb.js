import mongoose from 'mongoose';

/**
 * Connect to MongoDB with retry logic.
 * Throws error if connection fails after retries so caller can handle gracefully.
 * @param {string} uri - MongoDB connection string (Atlas or local)
 * @param {object} options - Connection options
 * @param {number} options.maxRetries - Maximum connection attempts (default: 2)
 * @param {number} options.timeoutMs - Timeout per attempt (default: 5000ms)
 */
export async function connectDb(uri, { maxRetries = 2, timeoutMs = 5000 } = {}) {
  if (!uri) {
    throw new Error('MONGODB_URI is required for database connection');
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: timeoutMs,
      });
      console.log(`[Database] MongoDB connected successfully (attempt ${attempt})`);
      return mongoose.connection;
    } catch (err) {
      console.error(`[Database] MongoDB connection attempt ${attempt}/${maxRetries} failed:`, err.message);
      if (attempt === maxRetries) {
        throw new Error(`All MongoDB connection attempts exhausted: ${err.message}`);
      }
      // Wait 1.5 seconds before retrying
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }
}
