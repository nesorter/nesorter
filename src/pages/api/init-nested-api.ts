import type { NextApiRequest, NextApiResponse } from 'next';

import { getInstance } from '@/radio-service';

let started = false;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!started) {
    getInstance();
    started = true;
  }

  res.status(200).json({ message: 'ok' });
}
