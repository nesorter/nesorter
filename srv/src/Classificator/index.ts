import { StorageType } from './../Storage';
import type { ClassificationCategory } from './types';

export class Classificator {
  constructor(private db: StorageType) {}

  async getCategories(): Promise<ClassificationCategory[]> {
    return (await this.db.classification.findMany()).map(c => ({
      ...c,
      values: c.values.split(','),
    }));
  }

  async updateCategory(category: ClassificationCategory): Promise<void> {
    await this.db.classification.update({
      data: { ...category, values: category.values.join(',') },
      where: { id: category.id }
    });
  }

  async addCategory(category: Omit<ClassificationCategory, 'id'>): Promise<void> {
    await this.db.classification.create({
      data: { ...category, values: category.values.join(',') }
    });
  }

  async updateItem(filehash: string, categories: ClassificationCategory[]): Promise<void> {
    await this.db.classificatedItem.upsert({
      create: {
        filehash,
        json: JSON.stringify(categories) || '[]',
      },
      update: {
        json: JSON.stringify(categories) || '[]',
      },
      where: {
        filehash
      }
    });
  }

  async getItem(filehash: string): Promise<ClassificationCategory[]> {
    const rawItem = await this.db.classificatedItem.findFirst({ where: { filehash } });
    return JSON.parse(rawItem?.json || '[]');
  }

  async getItems(): Promise<{ filehash: string; categories: ClassificationCategory[]; }[]> {
    return (await this.db.classificatedItem.findMany()).map(rawItem => ({
      filehash: rawItem.filehash,
      categories: JSON.parse(rawItem?.json || '[]'),
    }));
  }
};
