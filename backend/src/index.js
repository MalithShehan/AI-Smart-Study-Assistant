const app = require('./app');
const config = require('./config');

const server = app.listen(config.port, () => {
  console.log(`[${config.env}] Server running on http://localhost:${config.port}`);
  console.log(`API available at http://localhost:${config.port}${config.api.prefix}`);
});

// Graceful shutdown on SIGTERM (e.g., Docker / cloud platforms)
process.on('SIGTERM', () => {
  console.log('SIGTERM received — shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

// Catch unhandled promise rejections and shut down cleanly
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err.message);
  server.close(() => process.exit(1));
});
