import { NextApiRequest } from 'next';

import { config } from '@/radio-service/utils';

export function isAuthorizedRequest(req: NextApiRequest) {
  return (
    req.headers.token === config.ADMIN_TOKEN ||
    req.cookies['nesorter-admin-token'] === config.ADMIN_TOKEN
  );
}
