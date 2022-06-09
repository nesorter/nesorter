import { StorageType } from "../Storage";
import { LogLevel, LogTags } from "./types";
import { appendFile } from 'fs/promises';
import config from "../config";

type logParams = {
  message: string,
  tags?: LogTags[],
  level?: LogLevel
};

export class Logger {
  startTime = Date.now();
  constructor(private db: StorageType) {}

  async log({ message, tags = [LogTags.APP], level = LogLevel.INFO }: logParams): Promise<void> {
    const loggerFunc = level === LogLevel.ERROR ? console.error : console.log;
    loggerFunc(`[${(Date.now() - this.startTime) / 1000}s] [${level}] [${tags.join(',')}] ${message}`);

    // Пока просто отключаю запись логов в БД
    // return await this.db.log.create({ data: { message, level, tags: tags.join(',') } });
    await appendFile(config.LOG_PATH, `${JSON.stringify({ level, time: Date.now(), message, tags })}\n`);
  }

  async getLogs() {
    // Пока просто отключаю чтение логов из БД
    return []; // this.db.log.findMany();
  }
}
