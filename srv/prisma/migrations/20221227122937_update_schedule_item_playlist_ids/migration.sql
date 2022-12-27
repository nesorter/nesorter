/*
  Warnings:

  - You are about to drop the column `playlistId` on the `ScheduleItem` table. All the data in the column will be lost.
  - Added the required column `playlistIds` to the `ScheduleItem` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ScheduleItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "startAt" INTEGER NOT NULL,
    "endAt" INTEGER NOT NULL,
    "playlistIds" TEXT NOT NULL
);
INSERT INTO "new_ScheduleItem" ("endAt", "id", "startAt") SELECT "endAt", "id", "startAt" FROM "ScheduleItem";
DROP TABLE "ScheduleItem";
ALTER TABLE "new_ScheduleItem" RENAME TO "ScheduleItem";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
