/*
  Warnings:

  - You are about to drop the `PlaylistsOnScheduleItems` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "PlaylistsOnScheduleItems";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "PlaylistsOnScheduleItem" (
    "scheduleItemId" INTEGER NOT NULL,
    "playlistTypeManualMetaId" INTEGER NOT NULL,

    PRIMARY KEY ("scheduleItemId", "playlistTypeManualMetaId"),
    CONSTRAINT "PlaylistsOnScheduleItem_scheduleItemId_fkey" FOREIGN KEY ("scheduleItemId") REFERENCES "ScheduleItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PlaylistsOnScheduleItem_playlistTypeManualMetaId_fkey" FOREIGN KEY ("playlistTypeManualMetaId") REFERENCES "PlaylistTypeManualMeta" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
