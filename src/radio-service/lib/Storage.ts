import { PrismaClient } from '@prisma/client';

export const Storage = new PrismaClient();
export type StorageType = typeof Storage;
