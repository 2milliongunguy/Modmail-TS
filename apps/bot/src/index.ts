// im going to kms looking at bot.py
// wtf is that

import path from "node:path";
import { logger } from "../../../packages/shared/lib/logger";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });

async function startup() {
  logger.info("┌┬┐┌─┐┌┬┐┌┬┐┌─┐┬┬");
  logger.info("││││ │ │││││├─┤││");
  logger.info("┴ ┴└─┘─┴┘┴ ┴┴ ┴┴┴─┘");
  logger.info("Authors: kyb3r, fourjr, Taaku18, 2milliongunguy");
}

startup();
