-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Playlists" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "filehash" TEXT NOT NULL DEFAULT 'none'
);
INSERT INTO "new_Playlists" ("id", "name", "type") SELECT "id", "name", "type" FROM "Playlists";
DROP TABLE "Playlists";
ALTER TABLE "new_Playlists" RENAME TO "Playlists";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
