/*
  Warnings:

  - You are about to drop the column `name` on the `TargetSequence` table. All the data in the column will be lost.
  - Added the required column `name` to the `Stage` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Stage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);
INSERT INTO "new_Stage" ("id") SELECT "id" FROM "Stage";
DROP TABLE "Stage";
ALTER TABLE "new_Stage" RENAME TO "Stage";
CREATE TABLE "new_TargetSequence" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "subWaveLength" INTEGER NOT NULL,
    "stageUpId" INTEGER NOT NULL,
    "stageDownId" INTEGER NOT NULL,
    CONSTRAINT "TargetSequence_stageUpId_fkey" FOREIGN KEY ("stageUpId") REFERENCES "Stage" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TargetSequence_stageDownId_fkey" FOREIGN KEY ("stageDownId") REFERENCES "Stage" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TargetSequence" ("id", "stageDownId", "stageUpId", "subWaveLength") SELECT "id", "stageDownId", "stageUpId", "subWaveLength" FROM "TargetSequence";
DROP TABLE "TargetSequence";
ALTER TABLE "new_TargetSequence" RENAME TO "TargetSequence";
CREATE UNIQUE INDEX "TargetSequence_stageUpId_key" ON "TargetSequence"("stageUpId");
CREATE UNIQUE INDEX "TargetSequence_stageDownId_key" ON "TargetSequence"("stageDownId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
