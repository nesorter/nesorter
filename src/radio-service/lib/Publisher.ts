import axios from 'axios';

import { AggregatedFileItem } from '../types/Scanner';
import config from './config';
import { Logger } from './Logger';
import { LogLevel, LogTags } from './Logger.types';

export class Publisher {
  constructor(private logger: Logger) {}

  public async publish(fileItem: AggregatedFileItem): Promise<void> {
    try {
      await axios.get(`http://${config.SHOUT_HOST}:${config.SHOUT_PORT}/admin/metadata`, {
        params: {
          song: `${fileItem.metadata?.artist} - ${fileItem.metadata?.title}`,
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
        message: `Error at publishing metadata for '${fileItem.metadata?.artist} - ${fileItem.metadata?.title}' at '/${config.SHOUT_MOUNT}'`,
        tags: [LogTags.MPV],
        level: LogLevel.ERROR,
      });
    }
  }
}
