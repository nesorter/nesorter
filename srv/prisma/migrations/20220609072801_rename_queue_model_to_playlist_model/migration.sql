/*
  Warnings:

  - You are about to drop the `ManualQueueItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Queues` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ManualQueueItem";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Queues";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Playlists" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ManualPlaylistItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "playlistId" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "filehash" TEXT NOT NULL
);
