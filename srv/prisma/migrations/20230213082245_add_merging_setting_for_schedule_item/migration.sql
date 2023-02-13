-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ScheduleItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "startAt" INTEGER NOT NULL,
    "endAt" INTEGER NOT NULL,
    "playlistIds" TEXT NOT NULL,
    "withMerging" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_ScheduleItem" ("endAt", "id", "playlistIds", "startAt") SELECT "endAt", "id", "playlistIds", "startAt" FROM "ScheduleItem";
DROP TABLE "ScheduleItem";
ALTER TABLE "new_ScheduleItem" RENAME TO "ScheduleItem";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
