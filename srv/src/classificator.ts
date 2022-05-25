import DBStorage from "./storage";
import Scanner, { ScannedItem } from "./scanner";

export type ClassificationCategory = {
  name: string;
  values: string[];
}

export default class Classificator {
  categories: ClassificationCategory[] = [];
  db: DBStorage;
  scanner: Scanner;

  constructor(db: DBStorage, scanner: Scanner) {
    this.db = db;
    this.scanner = scanner;
    this.categories = this.db.storage['categories'] as ClassificationCategory[] || [];
  }

  async updateCategories(categories: ClassificationCategory[]): Promise<void> {
    this.categories = categories;
    await this.db.add('categories', categories);
  }

  async addItem(itemName: string, categories: ClassificationCategory[]): Promise<void> {
    await this.db.add(`classificator_${itemName}`, categories);
  }

  async getItem(itemName: string): Promise<ClassificationCategory[]> {
    return this.db.storage[`classificator_${itemName}`] as ClassificationCategory[] || [];
  }

  get classificated(): [string, ClassificationCategory[]][] {
    return Object
      .entries(this.db.storage as Record<string, ClassificationCategory[]>)
      .filter(([key]) => key.includes('classificator_'))
      .map(([key, value]) => {
        return [key.replace('classificator_', ''), value];
      });
  }

  async getItems(filters: ClassificationCategory[]): Promise<ScannedItem[]> {
    let items = this.classificated
      .map(([key, cats]) => {
        return [
          this.scanner.finded.find(i => i.name === key) as ScannedItem,
          cats
        ] as [ScannedItem, ClassificationCategory[]];
      })
      .filter(i => i[0] !== undefined);

    filters.forEach(({ name, values }) => {
      items = items.filter(([ item, cats ]) => {
        const cat = cats.find(cat => cat.name === name);

        if (!cat) {
          return false;
        }

        return cat.values.some(v => values.includes(v));
      });
    });

    return items.map(i => i[0]);
  }
};
