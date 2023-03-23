import axios from 'axios';

import { Logger } from '@/radio-service/Storage';
import { AggregatedFileItem, LogLevel, LogTags } from '@/radio-service/types';
import { config } from '@/radio-service/utils';

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
