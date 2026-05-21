// PM2 Ecosystem Configuration
// Usage:
//   Start:   pm2 start ecosystem.config.js --env production
//   Reload:  pm2 reload ai-study-api
//   Logs:    pm2 logs ai-study-api
//   Monitor: pm2 monit

module.exports = {
  apps: [
    {
      name: 'ai-study-api',
      script: 'src/index.js',

      // ── Scaling ─────────────────────────────────────────────────────────────
      // 'max' uses all available CPU cores; set a fixed number if preferred
      instances: process.env.PM2_INSTANCES || 'max',
      exec_mode: 'cluster',

      // ── Auto-restart ─────────────────────────────────────────────────────────
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',

      // ── Restart delay / backoff ───────────────────────────────────────────────
      min_uptime: '5s',
      max_restarts: 10,
      restart_delay: 4000,

      // ── Logging ──────────────────────────────────────────────────────────────
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      out_file: './logs/pm2-out.log',
      error_file: './logs/pm2-error.log',
      merge_logs: true,

      // ── Environment variables ─────────────────────────────────────────────────
      env: {
        NODE_ENV: 'development',
        PORT: 5000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
        LOG_LEVEL: 'info',
      },
      env_staging: {
        NODE_ENV: 'staging',
        PORT: 5001,
        LOG_LEVEL: 'debug',
      },
    },
  ],

  // ── Deploy configuration (optional) ──────────────────────────────────────────
  deploy: {
    production: {
      user: 'deploy',
      host: 'your-server-ip',
      ref: 'origin/main',
      repo: 'git@github.com:MalithShehan/AI-Smart-Study-Assistant.git',
      path: '/var/www/ai-study-assistant',
      'post-deploy': 'cd backend && npm ci --omit=dev && pm2 reload ecosystem.config.js --env production',
    },
  },
};
