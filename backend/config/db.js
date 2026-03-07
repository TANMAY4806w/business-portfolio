const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI;

    if (!uri) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    // Only use MongoMemoryServer if explicitly requested or in a non-production local environment
    if (process.env.USE_MEMORY_DB === 'true' ||
      ((uri.includes('localhost') || uri.includes('127.0.0.1')) && process.env.NODE_ENV !== 'production')) {
      const mongod = await MongoMemoryServer.create();
      uri = mongod.getUri();
      console.log('Started MongoDB Memory Server for local development...');
    }

    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
