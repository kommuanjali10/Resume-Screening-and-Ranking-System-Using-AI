const mongoose = require('mongoose');

/**
 * Database connection manager
 * Connects to local MongoDB or MongoDB Atlas based on MONGODB_URI
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/resume_screening_db';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}, database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    console.error('[MongoDB] Troubleshooting tips:');
    console.error('  1. Ensure MongoDB service is running locally (`net start MongoDB` or run `mongod`).');
    console.error('  2. Or configure a free MongoDB Atlas cluster connection string in server/.env.');
    // Don't crash immediately in dev mode, allow health endpoint to report disconnected status
    return null;
  }
};

module.exports = connectDB;
