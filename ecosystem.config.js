//pm2 deploy ecosystem.config.js production setup
module.exports = {
  apps : [{
    name: "TED",
    max_memory_restart: "2G",
    script: "index.js",
    "log_file": "/sites/logs/avnode_ted-combined.log",
    "out_file": "/sites/logs/avnode_ted-out.log",
    "error_file": "/sites/logs/avnode_ted-err.log",
    ignore_watch: [
      "public", "logs"
    ],
    /* "args": "-lang ru", */
    time: true,
    instances: 1,
    exec_mode: "fork",
    autorestart: true,
    watch: true,
    watch_options: {
      followSymlinks: false
    },
    env: {
      NODE_ENV: "production"
    }
  }],

  deploy : {
    production : {
      user : "us-her-www",
      host : [{host : "142.93.138.219:8500",port : "22"}],
      ref  : "origin/master",
      repo : "git@github.com:HER-She-Loves-Data/WWWClient.git",
      path : "",
      "post-deploy" : "npm install && pm2 reload ecosystem.config.js --env production"
    }
  }
};