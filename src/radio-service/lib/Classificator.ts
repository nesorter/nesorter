import { AggregatedClassedItem, AggregatedFileItem } from './Scanner.types';
import { StorageType } from './Storage';

export type DtoUpsertCategory = {
  id?: number;
  name: string;
  values: { id?: number; value: string }[];
};

export type DtoUpsertFileItem = { filehash: string; classItemsIds: number[] };

export class Classificator {
  constructor(private db: StorageType) {}

  async getCategories() {
    return this.db.classCategory.findMany({ include: { items: true } });
  }

  async upsertCategory({ id, name, values }: DtoUpsertCategory) {
    await this.db.classCategory.update({
      where: {
        id,
      },
      data: {
        name,
        items: {
          upsert: values.map((value) => ({
            where: { id: value.id },
            update: { value: value.value },
            create: { value: value.value },
          })),
        },
      },
    });
  }

  async upsertFileItem({ filehash, classItemsIds }: DtoUpsertFileItem) {
    await this.db.$transaction([
      this.db.classedItem.deleteMany({
        where: {
          fileHash: filehash,
        },
      }),

      this.db.fileItem.update({
        where: { filehash },
        data: {
          classedItems: {
            create: classItemsIds.map((classItemId) => ({ classItemId })),
          },
        },
      }),
    ]);
  }

  async getFileItem(filehash: string) {
    return this.db.fileItem.findFirstOrThrow({
      where: { filehash },
      include: {
        classedItems: { include: { classItem: { include: { category: true } } } },
        timings: true,
        metadata: true,
      },
    });
  }

  async getFileItems() {
    // TODO: make as join
    // SELECT * FROM file_item INNER JOIN classed_item ON file_item.filehash = classed_item.filehash
    const asMap: Record<string, AggregatedFileItem> = {};
    const classedItems = await this.db.classedItem.findMany({
      include: { file: { include: { timings: true, metadata: true } } },
    });

    classedItems.forEach((classedItem) => {
      const fileItem = asMap[classedItem.fileHash];

      if (fileItem) {
        fileItem.classedItems?.push(classedItem as unknown as AggregatedClassedItem);
      } else {
        asMap[classedItem.fileHash] = classedItem.file as AggregatedFileItem;
        asMap[classedItem.fileHash].classedItems = [];
      }
    });

    return Object.values(asMap);
  }
}
