import type { NextApiRequest, NextApiResponse } from 'next';
import * as v8Prof from 'v8-profiler-next';
import { CpuProfile } from 'v8-profiler-next';

import { isAuthorizedRequest, sleep } from '@/radio-service/utils';

const makePromisifyedProfileExport = (profile: CpuProfile) =>
  new Promise((resolve) => {
    profile.export(function (error, result) {
      resolve(result || '');
      profile.delete();
    });
  });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let status = 403;
  let response: unknown = { message: 'Invalid request' };

  try {
    if (isAuthorizedRequest(req)) {
      const profileName = `perf-profile-${Date.now()}`;
      const { minutes = '1' } = req.query;

      v8Prof.setGenerateType(1);
      v8Prof.startProfiling(profileName, true);

      await sleep(Number(minutes) * 60 * 1000);
      const profile = v8Prof.stopProfiling(profileName);
      const result = await makePromisifyedProfileExport(profile);

      res.status(200);
      res.setHeader('Content-Type', 'plain/text');
      res.send(result);
      return;
    }
  } catch (e) {
    status = 500;
    response = e;
  }

  res.status(status).json(response);
}
