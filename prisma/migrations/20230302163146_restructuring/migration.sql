/*
  Warnings:

  - You are about to drop the `FSItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Playlists` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `name` on the `Classification` table. All the data in the column will be lost.
  - You are about to drop the column `values` on the `Classification` table. All the data in the column will be lost.
  - You are about to drop the column `filehash` on the `ManualPlaylistItem` table. All the data in the column will be lost.
  - You are about to drop the column `playlistIds` on the `ScheduleItem` table. All the data in the column will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "FSItem";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Playlists";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "FileItem" (
    "filehash" TEXT NOT NULL PRIMARY KEY,
    "path" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "fileItemMetadataId" INTEGER,
    "fileItemTimingsId" INTEGER,
    CONSTRAINT "FileItem_fileItemMetadataId_fkey" FOREIGN KEY ("fileItemMetadataId") REFERENCES "FileItemMetadata" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "FileItem_fileItemTimingsId_fkey" FOREIGN KEY ("fileItemTimingsId") REFERENCES "FileItemTimings" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FileItemMetadata" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "artist" TEXT NOT NULL DEFAULT 'unknown',
    "title" TEXT NOT NULL DEFAULT 'unknown'
);

-- CreateTable
CREATE TABLE "FileItemTimings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "duration" REAL NOT NULL DEFAULT 0,
    "trimStart" REAL NOT NULL DEFAULT 0,
    "trimEnd" REAL NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "PlaylistsOnScheduleItems" (
    "scheduleItemId" INTEGER NOT NULL,
    "playlistId" INTEGER NOT NULL,

    PRIMARY KEY ("scheduleItemId", "playlistId"),
    CONSTRAINT "PlaylistsOnScheduleItems_scheduleItemId_fkey" FOREIGN KEY ("scheduleItemId") REFERENCES "ScheduleItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PlaylistsOnScheduleItems_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "Playlist" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Playlist" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "filehash" TEXT NOT NULL DEFAULT 'none'
);

-- CreateTable
CREATE TABLE "ClassificationsGroup" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ClassificatedGroup" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "classificatedItemFilehash" TEXT NOT NULL,
    CONSTRAINT "ClassificatedGroup_classificatedItemFilehash_fkey" FOREIGN KEY ("classificatedItemFilehash") REFERENCES "ClassificatedItem" ("filehash") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Classification" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "value" TEXT NOT NULL DEFAULT 'unknown',
    "classificationsGroupId" INTEGER,
    "classificatedGroupId" INTEGER,
    CONSTRAINT "Classification_classificationsGroupId_fkey" FOREIGN KEY ("classificationsGroupId") REFERENCES "ClassificationsGroup" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Classification_classificatedGroupId_fkey" FOREIGN KEY ("classificatedGroupId") REFERENCES "ClassificatedGroup" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Classification" ("id") SELECT "id" FROM "Classification";
DROP TABLE "Classification";
ALTER TABLE "new_Classification" RENAME TO "Classification";
CREATE TABLE "new_ManualPlaylistItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "order" INTEGER NOT NULL,
    "playlistId" INTEGER NOT NULL,
    "fileItemFilehash" TEXT,
    CONSTRAINT "ManualPlaylistItem_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "Playlist" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ManualPlaylistItem_fileItemFilehash_fkey" FOREIGN KEY ("fileItemFilehash") REFERENCES "FileItem" ("filehash") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ManualPlaylistItem" ("id", "order", "playlistId") SELECT "id", "order", "playlistId" FROM "ManualPlaylistItem";
DROP TABLE "ManualPlaylistItem";
ALTER TABLE "new_ManualPlaylistItem" RENAME TO "ManualPlaylistItem";
CREATE TABLE "new_ScheduleItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "withMerging" INTEGER NOT NULL DEFAULT 0,
    "startAt" INTEGER NOT NULL,
    "endAt" INTEGER NOT NULL
);
INSERT INTO "new_ScheduleItem" ("endAt", "id", "startAt", "withMerging") SELECT "endAt", "id", "startAt", "withMerging" FROM "ScheduleItem";
DROP TABLE "ScheduleItem";
ALTER TABLE "new_ScheduleItem" RENAME TO "ScheduleItem";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
