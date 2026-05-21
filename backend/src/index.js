const app = require('./app');
const config = require('./config');
const { connectDB, disconnectDB } = require('./config/database');
const { startReminderCron } = require('./services/timetableService');

const startServer = async () => {
  await connectDB();

  // Start cron-based reminder scheduler (timetable + exam notifications)
  startReminderCron();

  const server = app.listen(config.port, () => {
    console.log(`[${config.env}] Server running on http://localhost:${config.port}`);
    console.log(`API available at http://localhost:${config.port}${config.api.prefix}`);
  });

  const shutdown = async (signal) => {
    console.log(`\n${signal} received — shutting down gracefully...`);
    server.close(async () => {
      await disconnectDB();
      console.log('Server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err.message);
    server.close(async () => {
      await disconnectDB();
      process.exit(1);
    });
  });
};

startServer();
