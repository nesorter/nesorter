import { StorageType } from './../storage';
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

  // get classificated(): [string, ClassificationCategory[]][] {
  //   return Object
  //     .entries(this.db.storage as Record<string, ClassificationCategory[]>)
  //     .filter(([key]) => key.includes('classificator_'))
  //     .map(([key, value]) => {
  //       return [key.replace('classificator_', ''), value];
  //     });
  // }

  // async getItems(filters: ClassificationCategory[]): Promise<ScannedItem[]> {
  //   let items = this.classificated
  //     .map(([key, cats]) => {
  //       return [
  //         this.scanner.finded.find(i => i.name === key) as ScannedItem,
  //         cats
  //       ] as [ScannedItem, ClassificationCategory[]];
  //     })
  //     .filter(i => i[0] !== undefined);

  //   filters.forEach(({ name, values }) => {
  //     items = items.filter(([ item, cats ]) => {
  //       const cat = cats.find(cat => cat.name === name);

  //       if (!cat) {
  //         return false;
  //       }

  //       return cat.values.some(v => values.includes(v));
  //     });
  //   });

  //   return items.map(i => i[0]);
  // }
};
