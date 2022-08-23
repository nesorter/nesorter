import { StorageType } from "../Storage";
import { LogLevel, LogTags } from "./types";
import config from "../config";

import { createLogger, transports, format, Logger as WinstonLogger } from "winston";
import LokiTransport from "winston-loki";

type logParams = {
  message: string;
  tags?: LogTags[];
  level?: LogLevel;
  extraData?: Record<string, unknown>;
};

export class Logger {
  startTime = Date.now();
  winston: WinstonLogger;

  constructor(private db: StorageType) {
    this.winston = createLogger({
      transports: [
        new transports.Console({
          format: format.combine(format.simple(), format.colorize())
        }), 
      ]
    });

    if (config.LOKI_HOST) {
      this.winston.add(new LokiTransport({
        host: config.LOKI_HOST,
        labels: { app: 'nesorter' },
        json: true,
        format: format.json(),
        replaceTimestamp: true,
        onConnectionError: (err) => console.error(err)
      }));
    }
  }

  async log({ message, tags = [LogTags.APP], level = LogLevel.INFO, extraData = {} }: logParams): Promise<void> {
    const data = {
      msg: message,
      level,
      ...extraData,
    };

    const str = Object.entries(data).map(([key, value]) => `${key}='${value}'`).join(',');

    this.winston.log({
      message: str,
      level: 'info',
      labels: { 'module': tags.join('_') }
    });
  }

  async getLogs() {
    return []; // this.db.log.findMany();
  }
}
