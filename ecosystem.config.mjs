const config = {
  apps: [
    {
      name: "modmail-bot",
      script: "npm",
      args: "run start --workspace=apps/bot",
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "modmail-web",
      script: "npm",
      args: "run start --workspace=apps/web",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};

export default config;
