/* eslint-disable @typescript-eslint/no-explicit-any */

import chalk from "chalk";

const timestamp = () => chalk.dim(`${new Date().toISOString()}`);

interface fatalArgs {
  exit?: number;
  [key: string]: any;
}

export const logger = {
  info: (message: string, ...args: any[]) => {
    console.log(`${timestamp()} ${chalk.blue("INFO")} ${message}`, ...args);
  },
  debug: (message: string, ...args: any[]) => {
    if (process.env.DEBUG !== "true") return;
    console.log(`${timestamp()} ${chalk.magenta("DEBUG")} ${message}`, ...args);
  },
  warn: (message: string, ...args: any[]) => {
    console.log(`${timestamp()} ${chalk.yellow("WARN")} ${message}`, ...args);
  },
  error: (message: string, ...args: any[]) => {
    console.log(`${timestamp()} ${chalk.red("ERROR")} ${message}`, ...args);
  },
  bot: (message: string, ...args: any[]) => {
    console.log(`${timestamp()} ${chalk.cyan.bold("BOT")} ${message}`, ...args);
  },
  fatal: (message: string, ...args: fatalArgs[]) => {
    const exitArg = args.find(
      (arg) => typeof arg === "object" && "exit" in arg,
    );

    const exitCode = exitArg?.exit;

    const otherArgs = args.filter((arg) => arg !== exitArg);
    console.log(
      `${timestamp()} ${chalk.red.bold("FATAL")} ${message}`,
      ...otherArgs,
    );

    if (exitCode !== undefined) {
      process.exit(exitCode);
    }
  },
  startup: (message: string, ...args: any[]) => {
    console.log(
      `${timestamp()} ${chalk.green.bold("STARTUP")} ${message}`,
      ...args,
    );
  },
  shutdown: (message: string, ...args: any[]) => {
    console.log(
      `${timestamp()} ${chalk.yellow.bold("SHUTDOWN")} ${message}`,
      ...args,
    );
  },
  deploy: (message: string, ...args: any[]) => {
    console.log(
      `${timestamp()} ${chalk.green.bold("DEPLOY")} ${message}`,
      ...args,
    );
  },
  success: (message: string, ...args: any[]) => {
    console.log(`${timestamp()} ${chalk.green("✓")} ${message}`, ...args);
  },
};
