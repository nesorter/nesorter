import { ClassCategory, ClassItem } from '@prisma/client';

export type AggregatedClassCategory = ClassCategory & { items: ClassItem[] };
