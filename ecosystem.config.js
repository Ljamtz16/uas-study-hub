module.exports = {
  apps: [
    {
      name: "uas-study-hub",
      cwd: "/home/ljamtz/apps/uas-study-hub",
      script: "./node_modules/next/dist/bin/next",
      args: "start --hostname 127.0.0.1 --port 3000",
      interpreter: "node",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      kill_timeout: 5000,
      time: true,
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "127.0.0.1",
      },
    },
  ],
};
