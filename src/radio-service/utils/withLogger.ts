import { RequestHandler } from 'express';

import { Logger } from '@/radio-service/Storage';
import { LogLevel, LogTags } from '@/radio-service/types';

export function withLogger(logger: Logger, rq: RequestHandler): RequestHandler {
  return (req, res, next) => {
    logger.log({
      message: `${req.method} ${req.path}`,
      level: LogLevel.DEBUG,
      tags: [LogTags.API],
    });
    rq(req, res, next);
  };
}
