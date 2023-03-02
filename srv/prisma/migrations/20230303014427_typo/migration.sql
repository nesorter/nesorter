/*
  Warnings:

  - The primary key for the `PlaylistsOnScheduleItem` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `playlistTypeManualMetaId` on the `PlaylistsOnScheduleItem` table. All the data in the column will be lost.
  - Added the required column `playlistId` to the `PlaylistsOnScheduleItem` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PlaylistsOnScheduleItem" (
    "scheduleItemId" INTEGER NOT NULL,
    "playlistId" INTEGER NOT NULL,

    PRIMARY KEY ("scheduleItemId", "playlistId"),
    CONSTRAINT "PlaylistsOnScheduleItem_scheduleItemId_fkey" FOREIGN KEY ("scheduleItemId") REFERENCES "ScheduleItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PlaylistsOnScheduleItem_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "Playlist" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PlaylistsOnScheduleItem" ("scheduleItemId") SELECT "scheduleItemId" FROM "PlaylistsOnScheduleItem";
DROP TABLE "PlaylistsOnScheduleItem";
ALTER TABLE "new_PlaylistsOnScheduleItem" RENAME TO "PlaylistsOnScheduleItem";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
