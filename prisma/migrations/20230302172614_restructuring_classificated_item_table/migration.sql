/*
  Warnings:

  - You are about to drop the column `classificatedItemFilehash` on the `ClassificatedGroup` table. All the data in the column will be lost.
  - The primary key for the `ClassificatedItem` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `filehash` on the `ClassificatedItem` table. All the data in the column will be lost.
  - You are about to drop the column `json` on the `ClassificatedItem` table. All the data in the column will be lost.
  - Added the required column `classificatedItemId` to the `ClassificatedGroup` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileItemHash` to the `ClassificatedItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `ClassificatedItem` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ClassificatedGroup" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "classificatedItemId" INTEGER NOT NULL,
    CONSTRAINT "ClassificatedGroup_classificatedItemId_fkey" FOREIGN KEY ("classificatedItemId") REFERENCES "ClassificatedItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ClassificatedGroup" ("id") SELECT "id" FROM "ClassificatedGroup";
DROP TABLE "ClassificatedGroup";
ALTER TABLE "new_ClassificatedGroup" RENAME TO "ClassificatedGroup";
CREATE TABLE "new_ClassificatedItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fileItemHash" TEXT NOT NULL,
    CONSTRAINT "ClassificatedItem_fileItemHash_fkey" FOREIGN KEY ("fileItemHash") REFERENCES "FileItem" ("filehash") ON DELETE RESTRICT ON UPDATE CASCADE
);
DROP TABLE "ClassificatedItem";
ALTER TABLE "new_ClassificatedItem" RENAME TO "ClassificatedItem";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
