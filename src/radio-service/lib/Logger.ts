import * as Sentry from '@sentry/node';
import { createLogger, format, Logger as WinstonLogger, transports } from 'winston';
import LokiTransport from 'winston-loki';

import { LogLevel, LogTags } from '@/radio-service/types';
import { config } from '@/radio-service/utils';

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
    if (config.SENTRY_DSN) {
      if (level === LogLevel.ERROR) {
        Sentry.captureException(new Error(message), (scope) => {
          scope.setExtras(extraData);
          scope.setTags({ ctags: tags?.join(' > ') });
          return scope;
        });
      }
    }

    const data = {
      msg: message.split('\n').join(' '),
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
