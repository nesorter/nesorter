/*
  Warnings:

  - You are about to drop the `PlaylistTypeFsMeta` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PlaylistTypeManualMeta` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `fileItemFilehash` on the `PlaylistItem` table. All the data in the column will be lost.
  - You are about to drop the column `playlistTypeManualMetaId` on the `PlaylistItem` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "PlaylistTypeFsMeta_playlistId_key";

-- DropIndex
DROP INDEX "PlaylistTypeFsMeta_fileItemHash_key";

-- DropIndex
DROP INDEX "PlaylistTypeManualMeta_playlistId_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "PlaylistTypeFsMeta";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "PlaylistTypeManualMeta";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "PlaylistFsMeta" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fileItemHash" TEXT,
    "playlistId" INTEGER,
    CONSTRAINT "PlaylistFsMeta_fileItemHash_fkey" FOREIGN KEY ("fileItemHash") REFERENCES "FileItem" ("filehash") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PlaylistFsMeta_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "Playlist" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlaylistManualMeta" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "playlistId" INTEGER,
    CONSTRAINT "PlaylistManualMeta_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "Playlist" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PlaylistItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "order" INTEGER NOT NULL,
    "fileItemHash" TEXT,
    "playlistManualMetaId" INTEGER,
    CONSTRAINT "PlaylistItem_fileItemHash_fkey" FOREIGN KEY ("fileItemHash") REFERENCES "FileItem" ("filehash") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PlaylistItem_playlistManualMetaId_fkey" FOREIGN KEY ("playlistManualMetaId") REFERENCES "PlaylistManualMeta" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_PlaylistItem" ("id", "order") SELECT "id", "order" FROM "PlaylistItem";
DROP TABLE "PlaylistItem";
ALTER TABLE "new_PlaylistItem" RENAME TO "PlaylistItem";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "PlaylistFsMeta_fileItemHash_key" ON "PlaylistFsMeta"("fileItemHash");

-- CreateIndex
CREATE UNIQUE INDEX "PlaylistFsMeta_playlistId_key" ON "PlaylistFsMeta"("playlistId");

-- CreateIndex
CREATE UNIQUE INDEX "PlaylistManualMeta_playlistId_key" ON "PlaylistManualMeta"("playlistId");
