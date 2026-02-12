import path from "path";
import pino from "pino";
import fs from "fs";
import pretty from "pino-pretty"; 

const logDir = path.join(process.cwd(), "logs");

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

export const logger = pino(
  {
    level: "info",
    timestamp: () => `,"time":"${new Date().toISOString()}"`,
  },
  pino.multistream([
    {
      level: "info",
      stream: pretty({ colorize: true }), // Consola
    },
    {
      level: "info",
      stream: pretty({
        colorize: false,
        destination: path.join(logDir, "app.log"),
        sync: true, // Escribe inmediatamente al archivo
      }),
    },
  ])
);