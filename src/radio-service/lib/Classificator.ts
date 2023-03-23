import {
  AggregatedClassedItem,
  AggregatedFileItem,
  DtoCreateCategory,
  DtoUpsertCategory,
  DtoUpsertFileItem,
  StorageType,
} from '@/radio-service/types';

export class Classificator {
  constructor(private db: StorageType) {}

  async getCategories() {
    return this.db.classCategory.findMany({ include: { items: true } });
  }

  async createCategory({ name, values }: DtoCreateCategory) {
    await this.db.classCategory.create({
      data: {
        name,
        items: {
          create: values.map((_) => ({ value: _ })),
        },
      },
    });
  }

  async upsertCategory({ id, name, values }: DtoUpsertCategory) {
    await this.db.$transaction([
      this.db.classItem.deleteMany({
        where: {
          categoryId: id,
          id: {
            notIn: values.filter((_) => _.id !== undefined).map((value) => value.id) as number[],
          },
        },
      }),
      this.db.classCategory.update({
        where: {
          id,
        },
        data: {
          name,
          items: {
            upsert: values
              .filter((_) => _.id !== undefined)
              .map((value) => ({
                where: { id: value.id },
                update: { value: value.value },
                create: { value: value.value },
              })),
            create: values
              .filter((_) => _.id === undefined)
              .map((value) => ({
                value: value.value,
              })),
          },
        },
      }),
    ]);
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
