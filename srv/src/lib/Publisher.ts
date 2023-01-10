import { FSItem } from '@prisma/client';
import axios from 'axios';
import config from 'lib/config';
import { Logger } from 'lib/Logger';
import { LogLevel, LogTags } from 'lib/Logger.types';

export class Publisher {
  constructor(private logger: Logger) {}

  public async publish(fsitem: FSItem): Promise<void> {
    try {
      await axios.get(`http://${config.SHOUT_HOST}:${config.SHOUT_PORT}/admin/metadata`, {
        params: {
          song: `${fsitem.id3Artist} - ${fsitem.id3Title}`,
          mount: `/${config.SHOUT_MOUNT}`,
          mode: 'updinfo',
        },
        auth: {
          username: config.SHOUT_ADMIN_USER,
          password: config.SHOUT_ADMIN_PASSWORD,
        },
      });
    } catch {
      this.logger.log({
        message: `Error at publishing metadata for '${fsitem.id3Artist} - ${fsitem.id3Title}' at '/${config.SHOUT_MOUNT}'`,
        tags: [LogTags.MPV],
        level: LogLevel.ERROR,
      });
    }
  }
}
