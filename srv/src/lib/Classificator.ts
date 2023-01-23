import type { ClassificationCategory } from './Classificator.types';
import { Logger } from './Logger';
import { LogLevel, LogTags } from './Logger.types';
import { StorageType } from './Storage';

export class Classificator {
  constructor(private db: StorageType, private logger: Logger) {}

  async getCategories(): Promise<ClassificationCategory[]> {
    return (await this.db.classification.findMany()).map((c) => ({
      ...c,
      values: c.values.split(','),
    }));
  }

  async updateCategory(category: ClassificationCategory): Promise<void> {
    this.logger.log({
      message: `Update category (${JSON.stringify(category)})`,
      level: LogLevel.DEBUG,
      tags: [LogTags.CATS],
    });
    await this.db.classification.update({
      data: { ...category, values: category.values.join(',') },
      where: { id: category.id },
    });
  }

  async addCategory(category: Omit<ClassificationCategory, 'id'>): Promise<void> {
    this.logger.log({
      message: `Add category (${JSON.stringify(category)})`,
      level: LogLevel.DEBUG,
      tags: [LogTags.CATS],
    });
    await this.db.classification.create({
      data: { ...category, values: category.values.join(',') },
    });
  }

  async updateItem(filehash: string, categories: ClassificationCategory[]): Promise<void> {
    this.logger.log({
      message: `Update track categories (${filehash}, ${JSON.stringify(categories)})`,
      level: LogLevel.DEBUG,
      tags: [LogTags.CATS],
    });
    await this.db.classificatedItem.upsert({
      create: {
        filehash,
        json: JSON.stringify(categories) || '[]',
      },
      update: {
        json: JSON.stringify(categories) || '[]',
      },
      where: {
        filehash,
      },
    });
  }

  async getItem(filehash: string): Promise<ClassificationCategory[]> {
    const rawItem = await this.db.classificatedItem.findFirst({ where: { filehash } });
    return JSON.parse(rawItem?.json || '[]') as ClassificationCategory[];
  }

  async getItems(
    filters?: Record<string, string | string[]>,
  ): Promise<{ filehash: string; categories: ClassificationCategory[] }[]> {
    const asEntries = Object.entries(filters || {});

    return (
      (await this.db.classificatedItem.findMany())
        // фильтр хуеват, работает как ИЛИ
        // (хотелось бы как И, но мейби сделаю как-нибудь иначе)
        .filter((rawItem) => {
          if (!asEntries.length) {
            return true;
          }

          const categories = JSON.parse(rawItem?.json || '[]') as ClassificationCategory[];
          return asEntries.reduce((acc, cur) => {
            const finded = categories.find((c) => c.name === cur[0]);
            const arrayed = cur[1] instanceof Array ? cur[1] : [cur[1] as unknown as string];

            if (!finded) {
              return false;
            }

            return (
              acc &&
              arrayed.reduce(
                (acc0, cur0) => acc0 && finded.values.some((c) => c === cur0),
                true as boolean,
              )
            );
          }, true as boolean);
        })
        .map((rawItem) => ({
          filehash: rawItem.filehash,
          categories: JSON.parse(rawItem?.json || '[]') as ClassificationCategory[],
        }))
    );
  }
}
