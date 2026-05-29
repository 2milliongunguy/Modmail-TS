module.exports = {
  apps: [
    {
      name: "modmail-bot",
      script: "npm",
      args: "run start --workspace=apps/bot",
      cwd: "./",
      env: {
        NODE_ENV: "production",
        FORCE_COLOR: "3",
      },
    },
    {
      name: "modmail-web",
      script: "npm",
      args: "run start --workspace=apps/web",
      cwd: "./",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        FORCE_COLOR: "3",
      },
    },
  ],
};
