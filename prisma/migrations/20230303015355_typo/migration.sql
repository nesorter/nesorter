/*
  Warnings:

  - You are about to drop the column `playlistTypeFsMetaId` on the `PlaylistItem` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PlaylistItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "order" INTEGER NOT NULL,
    "fileItemFilehash" TEXT,
    "playlistTypeManualMetaId" INTEGER,
    CONSTRAINT "PlaylistItem_fileItemFilehash_fkey" FOREIGN KEY ("fileItemFilehash") REFERENCES "FileItem" ("filehash") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PlaylistItem_playlistTypeManualMetaId_fkey" FOREIGN KEY ("playlistTypeManualMetaId") REFERENCES "PlaylistTypeManualMeta" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_PlaylistItem" ("fileItemFilehash", "id", "order", "playlistTypeManualMetaId") SELECT "fileItemFilehash", "id", "order", "playlistTypeManualMetaId" FROM "PlaylistItem";
DROP TABLE "PlaylistItem";
ALTER TABLE "new_PlaylistItem" RENAME TO "PlaylistItem";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
