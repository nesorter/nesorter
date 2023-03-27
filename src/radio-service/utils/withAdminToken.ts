import { RequestHandler } from 'express';
import { NextApiRequest } from 'next';

import { config } from '@/radio-service/utils';

export function isAuthorizedRequest(req: NextApiRequest) {
  return req.headers.token === config.ADMIN_TOKEN;
}

export function withAdminToken(rq: RequestHandler): RequestHandler {
  return (req, res, next) => {
    if (req.header('token') === config.ADMIN_TOKEN) {
      rq(req, res, next);
    } else {
      // eslint-disable-next-line no-cyrillic-string/no-cyrillic-string
      res.status(403).json({ error: 'Ты куда лезешь?' });
    }
  };
}
