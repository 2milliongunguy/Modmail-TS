/* eslint-disable @typescript-eslint/no-explicit-any */
import chalk from "chalk";
const timestamp = () => chalk.dim(`${new Date().toISOString()}`);
export const logger = {
    info: (message, ...args) => {
        console.log(`${timestamp()} ${chalk.blue("INFO")} ${message}`, ...args);
    },
    debug: (message, ...args) => {
        if (process.env.DEBUG !== "true")
            return;
        console.log(`${timestamp()} ${chalk.magenta("DEBUG")} ${message}`, ...args);
    },
    warn: (message, ...args) => {
        console.log(`${timestamp()} ${chalk.yellow("WARN")} ${message}`, ...args);
    },
    error: (message, ...args) => {
        console.log(`${timestamp()} ${chalk.red("ERROR")} ${message}`, ...args);
    },
    bot: (message, ...args) => {
        console.log(`${timestamp()} ${chalk.cyan.bold("BOT")} ${message}`, ...args);
    },
    fatal: (message, ...args) => {
        console.log(`${timestamp()} ${chalk.red.bold("FATAL")} ${message}`, ...args);
        process.exit(1);
    },
    startup: (message, ...args) => {
        console.log(`${timestamp()} ${chalk.green.bold("STARTUP")} ${message}`, ...args);
    },
    shutdown: (message, ...args) => {
        console.log(`${timestamp()} ${chalk.yellow.bold("SHUTDOWN")} ${message}`, ...args);
    },
    deploy: (message, ...args) => {
        console.log(`${timestamp()} ${chalk.green.bold("DEPLOY")} ${message}`, ...args);
    },
    success: (message, ...args) => {
        console.log(`${timestamp()} ${chalk.green("✓")} ${message}`, ...args);
    },
};
//# sourceMappingURL=logger.js.map