/*
  Warnings:

  - You are about to drop the `ManualPlaylistItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `fileItemMetadataId` on the `FileItem` table. All the data in the column will be lost.
  - You are about to drop the column `fileItemTimingsId` on the `FileItem` table. All the data in the column will be lost.
  - Added the required column `fileItemHash` to the `FileItemMetadata` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileItemHash` to the `FileItemTimings` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ManualPlaylistItem";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "PlaylistItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "order" INTEGER NOT NULL,
    "playlistId" INTEGER NOT NULL,
    "fileItemFilehash" TEXT,
    CONSTRAINT "PlaylistItem_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "Playlist" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PlaylistItem_fileItemFilehash_fkey" FOREIGN KEY ("fileItemFilehash") REFERENCES "FileItem" ("filehash") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FileItem" (
    "filehash" TEXT NOT NULL PRIMARY KEY,
    "path" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL
);
INSERT INTO "new_FileItem" ("filehash", "name", "path", "type") SELECT "filehash", "name", "path", "type" FROM "FileItem";
DROP TABLE "FileItem";
ALTER TABLE "new_FileItem" RENAME TO "FileItem";
CREATE TABLE "new_FileItemMetadata" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "artist" TEXT NOT NULL DEFAULT 'unknown',
    "title" TEXT NOT NULL DEFAULT 'unknown',
    "fileItemHash" TEXT NOT NULL,
    CONSTRAINT "FileItemMetadata_fileItemHash_fkey" FOREIGN KEY ("fileItemHash") REFERENCES "FileItem" ("filehash") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_FileItemMetadata" ("artist", "id", "title") SELECT "artist", "id", "title" FROM "FileItemMetadata";
DROP TABLE "FileItemMetadata";
ALTER TABLE "new_FileItemMetadata" RENAME TO "FileItemMetadata";
CREATE UNIQUE INDEX "FileItemMetadata_fileItemHash_key" ON "FileItemMetadata"("fileItemHash");
CREATE TABLE "new_FileItemTimings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "duration" REAL NOT NULL DEFAULT 0,
    "trimStart" REAL NOT NULL DEFAULT 0,
    "trimEnd" REAL NOT NULL DEFAULT 0,
    "fileItemHash" TEXT NOT NULL,
    CONSTRAINT "FileItemTimings_fileItemHash_fkey" FOREIGN KEY ("fileItemHash") REFERENCES "FileItem" ("filehash") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_FileItemTimings" ("duration", "id", "trimEnd", "trimStart") SELECT "duration", "id", "trimEnd", "trimStart" FROM "FileItemTimings";
DROP TABLE "FileItemTimings";
ALTER TABLE "new_FileItemTimings" RENAME TO "FileItemTimings";
CREATE UNIQUE INDEX "FileItemTimings_fileItemHash_key" ON "FileItemTimings"("fileItemHash");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
