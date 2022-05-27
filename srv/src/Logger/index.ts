import { Log, Prisma } from "@prisma/client";
import { StorageType } from "../storage";
import { LogLevel, LogTags } from "./types";

type logParams = {
  message: string,
  tags?: LogTags[],
  level?: LogLevel
};

export class Logger {
  constructor(private db: StorageType) {}

  async log({ message, tags = [LogTags.APP], level = LogLevel.INFO }: logParams): Promise<Prisma.Prisma__LogClient<Log>> {
    console.log('logger: ', {
      message,
      tags,
      level
    });

    return await this.db.log.create({ data: { message, level, tags: tags.join(',') } });
  }
}
