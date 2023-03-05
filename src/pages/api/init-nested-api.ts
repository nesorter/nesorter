import type { NextApiRequest, NextApiResponse } from 'next'
import { getApi } from '@/radio-service';

let started = false;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!started) {
    getApi()?.listen(3001);
    started = true;
  }

  res.status(200).json({ message: 'ok' });
}
