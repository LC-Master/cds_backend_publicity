import path from "path";
import pino from "pino";
import fs from "fs";

const logDir = path.join(process.cwd(), "logs");

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

export const logger = pino(
  {
    level: "info",
  },
  pino.transport({
    targets: [
      {
        target: "pino-pretty", 
        options: { colorize: true },
        level: "info",
      },
      {
        target: "pino/file",
        options: { destination: path.join(logDir, "app.log") },
        level: "info",
      },
    ],
  })
);
