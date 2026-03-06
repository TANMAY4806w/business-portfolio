const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI;

    if (uri && (uri.includes('localhost') || uri.includes('127.0.0.1'))) {
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
