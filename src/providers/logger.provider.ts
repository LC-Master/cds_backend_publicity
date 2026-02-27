import path from "path";
import pino from "pino";
import fs from "fs";
import pretty from "pino-pretty";

const logDir = path.join(process.cwd(), "logs");
const isProd = process.env.NODE_ENV === "production";

if (!isProd && !fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const baseOptions = {
  level: "info",
  timestamp: () => `,"time":"${new Date().toISOString()}"`,
};

// En producción solo stdout sin pretty para que winsw lo capture.
// En desarrollo mantiene pretty y archivo local.
export const logger = isProd
  ? pino(baseOptions, pino.destination({ sync: false }))
  : pino(
      baseOptions,
      pino.multistream([
        {
          level: "info",
          stream: pretty({ colorize: true }),
        },
        {
          level: "info",
          stream: pretty({
            colorize: false,
            destination: path.join(logDir, "app.log"),
            sync: true,
          }),
        },
      ])
    );