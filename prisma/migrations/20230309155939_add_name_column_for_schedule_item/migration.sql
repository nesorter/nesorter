-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ScheduleItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "withMerging" INTEGER NOT NULL DEFAULT 0,
    "name" TEXT NOT NULL DEFAULT 'Default schedule name',
    "startAt" INTEGER NOT NULL,
    "endAt" INTEGER NOT NULL
);
INSERT INTO "new_ScheduleItem" ("endAt", "id", "startAt", "withMerging") SELECT "endAt", "id", "startAt", "withMerging" FROM "ScheduleItem";
DROP TABLE "ScheduleItem";
ALTER TABLE "new_ScheduleItem" RENAME TO "ScheduleItem";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
