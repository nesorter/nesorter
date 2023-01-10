import config from 'lib/config';
import { LogLevel, LogTags } from 'lib/Logger.types';
import { createLogger, format, Logger as WinstonLogger, transports } from 'winston';
import LokiTransport from 'winston-loki';

type logParams = {
  message: string;
  tags?: LogTags[];
  level?: LogLevel;
  extraData?: Record<string, unknown>;
};

export class Logger {
  winston: WinstonLogger;

  constructor() {
    this.winston = createLogger({
      transports: [
        new transports.Console({
          format: format.combine(format.simple(), format.colorize()),
        }),
      ],
    });

    if (config.LOKI_HOST) {
      this.winston.add(
        new LokiTransport({
          host: config.LOKI_HOST,
          labels: { app: 'nesorter' },
          json: true,
          format: format.json(),
          replaceTimestamp: true,
          onConnectionError: (err) => console.error(err),
        }),
      );
    }
  }

  log({ message, tags = [LogTags.APP], level = LogLevel.INFO, extraData = {} }: logParams): void {
    const data = {
      msg: message,
      level,
      ...extraData,
    };

    const str = Object.entries(data)
      .map(([key, value]) => `${key}='${value}'`)
      .join(',');

    this.winston.log({
      message: str,
      level: 'info',
      labels: { module: tags.join('_') },
    });
  }
}
