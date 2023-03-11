/*
  Warnings:

  - You are about to drop the column `playlistId` on the `PlaylistItem` table. All the data in the column will be lost.
  - You are about to drop the column `filehash` on the `Playlist` table. All the data in the column will be lost.
  - The primary key for the `PlaylistsOnScheduleItems` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `playlistId` on the `PlaylistsOnScheduleItems` table. All the data in the column will be lost.
  - Added the required column `playlistTypeManualMetaId` to the `PlaylistsOnScheduleItems` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "PlaylistTypeFsMeta" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fileItemHash" TEXT,
    "playlistId" INTEGER,
    CONSTRAINT "PlaylistTypeFsMeta_fileItemHash_fkey" FOREIGN KEY ("fileItemHash") REFERENCES "FileItem" ("filehash") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PlaylistTypeFsMeta_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "Playlist" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlaylistTypeManualMeta" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "playlistId" INTEGER,
    CONSTRAINT "PlaylistTypeManualMeta_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "Playlist" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PlaylistItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "order" INTEGER NOT NULL,
    "fileItemFilehash" TEXT,
    "playlistTypeFsMetaId" INTEGER,
    "playlistTypeManualMetaId" INTEGER,
    CONSTRAINT "PlaylistItem_fileItemFilehash_fkey" FOREIGN KEY ("fileItemFilehash") REFERENCES "FileItem" ("filehash") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PlaylistItem_playlistTypeFsMetaId_fkey" FOREIGN KEY ("playlistTypeFsMetaId") REFERENCES "PlaylistTypeFsMeta" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PlaylistItem_playlistTypeManualMetaId_fkey" FOREIGN KEY ("playlistTypeManualMetaId") REFERENCES "PlaylistTypeManualMeta" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_PlaylistItem" ("fileItemFilehash", "id", "order") SELECT "fileItemFilehash", "id", "order" FROM "PlaylistItem";
DROP TABLE "PlaylistItem";
ALTER TABLE "new_PlaylistItem" RENAME TO "PlaylistItem";
CREATE UNIQUE INDEX "PlaylistItem_playlistTypeFsMetaId_key" ON "PlaylistItem"("playlistTypeFsMetaId");
CREATE TABLE "new_Playlist" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL
);
INSERT INTO "new_Playlist" ("id", "name", "type") SELECT "id", "name", "type" FROM "Playlist";
DROP TABLE "Playlist";
ALTER TABLE "new_Playlist" RENAME TO "Playlist";
CREATE TABLE "new_PlaylistsOnScheduleItems" (
    "scheduleItemId" INTEGER NOT NULL,
    "playlistTypeManualMetaId" INTEGER NOT NULL,

    PRIMARY KEY ("scheduleItemId", "playlistTypeManualMetaId"),
    CONSTRAINT "PlaylistsOnScheduleItems_scheduleItemId_fkey" FOREIGN KEY ("scheduleItemId") REFERENCES "ScheduleItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PlaylistsOnScheduleItems_playlistTypeManualMetaId_fkey" FOREIGN KEY ("playlistTypeManualMetaId") REFERENCES "PlaylistTypeManualMeta" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PlaylistsOnScheduleItems" ("scheduleItemId") SELECT "scheduleItemId" FROM "PlaylistsOnScheduleItems";
DROP TABLE "PlaylistsOnScheduleItems";
ALTER TABLE "new_PlaylistsOnScheduleItems" RENAME TO "PlaylistsOnScheduleItems";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "PlaylistTypeFsMeta_fileItemHash_key" ON "PlaylistTypeFsMeta"("fileItemHash");

-- CreateIndex
CREATE UNIQUE INDEX "PlaylistTypeFsMeta_playlistId_key" ON "PlaylistTypeFsMeta"("playlistId");

-- CreateIndex
CREATE UNIQUE INDEX "PlaylistTypeManualMeta_playlistId_key" ON "PlaylistTypeManualMeta"("playlistId");
