const mongoose = require('mongoose');
const config = require('./index');

const MAX_RETRIES = 5;
const RETRY_INTERVAL_MS = 5000;

let retryCount = 0;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.db.uri, config.db.options);
    retryCount = 0;
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    retryCount += 1;
    console.error(`MongoDB connection error (attempt ${retryCount}/${MAX_RETRIES}): ${err.message}`);

    if (retryCount >= MAX_RETRIES) {
      console.error('Max DB connection retries reached. Exiting process.');
      process.exit(1);
    }

    console.log(`Retrying in ${RETRY_INTERVAL_MS / 1000}s...`);
    setTimeout(connectDB, RETRY_INTERVAL_MS);
  }
};

// Reconnect on disconnection (network blip, etc.)
mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected. Attempting to reconnect...');
  if (retryCount < MAX_RETRIES) connectDB();
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose runtime error:', err.message);
});

// Graceful close on app termination
const disconnectDB = async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed.');
};

module.exports = { connectDB, disconnectDB };
