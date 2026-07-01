// PM2 Ecosystem — AWS EC2 deployment
// Usage:
//   pm2 start ecosystem.config.cjs --env production
//   pm2 save && pm2 startup

module.exports = {
  apps: [
    {
      name: 'cobrokings-api',
      script: 'dist/index.js',
      cwd: '/home/ubuntu/cobrokings/backend',   // adjust to your EC2 path
      instances: 'max',                          // one per CPU core
      exec_mode: 'cluster',
      watch: false,
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      // Logging
      out_file: '/var/log/cobrokings/out.log',
      error_file: '/var/log/cobrokings/error.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      // Auto-restart on crash
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000,
      // Memory guard
      max_memory_restart: '512M',
    },
  ],
}
