/*
  Warnings:

  - You are about to drop the `FSItemMeta` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "FSItemMeta";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FSItem" (
    "filehash" TEXT NOT NULL PRIMARY KEY,
    "path" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "id3Artist" TEXT NOT NULL DEFAULT 'unknown',
    "id3Title" TEXT NOT NULL DEFAULT 'unknown',
    "duration" REAL NOT NULL DEFAULT 0,
    "trimStart" REAL NOT NULL DEFAULT 0,
    "trimEnd" REAL NOT NULL DEFAULT 0
);
INSERT INTO "new_FSItem" ("filehash", "name", "path", "type") SELECT "filehash", "name", "path", "type" FROM "FSItem";
DROP TABLE "FSItem";
ALTER TABLE "new_FSItem" RENAME TO "FSItem";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
