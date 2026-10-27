import mongoose from 'mongoose';

/**
 * Connect to MongoDB with retry logic.
 * Exits the process if connection fails after retries.
 * @param {string} uri - MongoDB connection string
 * @param {object} options - Connection options
 * @param {number} options.maxRetries - Maximum connection attempts (default: 3)
 */
export async function connectDb(uri, { maxRetries = 3 } = {}) {
  if (!uri) {
    throw new Error('MONGODB_URI is required for database connection');
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await mongoose.connect(uri);
      console.log(`MongoDB connected successfully (attempt ${attempt})`);
      return mongoose.connection;
    } catch (err) {
      console.error(`MongoDB connection attempt ${attempt}/${maxRetries} failed:`, err.message);
      if (attempt === maxRetries) {
        console.error('All MongoDB connection attempts exhausted. Exiting.');
        process.exit(1);
      }
      // Wait 2 seconds before retrying
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}
