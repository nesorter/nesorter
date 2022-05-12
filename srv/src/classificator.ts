import DBStorage from "./storage";

export type ClassificationCategory = {
  name: string;
  values: string[];
}

export default class Classificator {
  categories: ClassificationCategory[] = [];

  db: DBStorage;

  constructor(db: DBStorage) {
    this.db = db;
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
};
