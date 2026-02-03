module.exports = {
  apps: [
    {
      name: 'jamjam-frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: '/var/www/JamJamTrekFrontend',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
