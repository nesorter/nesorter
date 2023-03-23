-- CreateTable
CREATE TABLE "Stage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT
);

-- CreateTable
CREATE TABLE "StageRule" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "stageId" INTEGER,
    "type" TEXT NOT NULL DEFAULT 'MAINLINE',
    "timeFrom" INTEGER,
    "timeTo" INTEGER,
    "targetType" TEXT NOT NULL DEFAULT 'TAGS',
    "targetSequenceId" INTEGER,
    "targetTagsId" INTEGER NOT NULL,
    "targetPlaylistsId" INTEGER,
    CONSTRAINT "StageRule_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "StageRule_targetSequenceId_fkey" FOREIGN KEY ("targetSequenceId") REFERENCES "TargetSequence" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "StageRule_targetTagsId_fkey" FOREIGN KEY ("targetTagsId") REFERENCES "TargetTags" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "StageRule_targetPlaylistsId_fkey" FOREIGN KEY ("targetPlaylistsId") REFERENCES "TargetPlaylists" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TargetSequence" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "subWaveLength" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "stageUpId" INTEGER NOT NULL,
    "stageDownId" INTEGER NOT NULL,
    CONSTRAINT "TargetSequence_stageUpId_fkey" FOREIGN KEY ("stageUpId") REFERENCES "Stage" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TargetSequence_stageDownId_fkey" FOREIGN KEY ("stageDownId") REFERENCES "Stage" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TargetTags" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT
);

-- CreateTable
CREATE TABLE "TargetPlaylists" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ClassItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "value" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "targetTagsId" INTEGER,
    CONSTRAINT "ClassItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ClassCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ClassItem_targetTagsId_fkey" FOREIGN KEY ("targetTagsId") REFERENCES "TargetTags" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ClassItem" ("categoryId", "id", "value") SELECT "categoryId", "id", "value" FROM "ClassItem";
DROP TABLE "ClassItem";
ALTER TABLE "new_ClassItem" RENAME TO "ClassItem";
CREATE TABLE "new_Playlist" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "targetPlaylistsId" INTEGER,
    CONSTRAINT "Playlist_targetPlaylistsId_fkey" FOREIGN KEY ("targetPlaylistsId") REFERENCES "TargetPlaylists" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Playlist" ("id", "name", "type") SELECT "id", "name", "type" FROM "Playlist";
DROP TABLE "Playlist";
ALTER TABLE "new_Playlist" RENAME TO "Playlist";
CREATE TABLE "new_ScheduleItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "withMerging" INTEGER NOT NULL DEFAULT 0,
    "name" TEXT NOT NULL DEFAULT 'Default schedule name',
    "startAt" INTEGER NOT NULL,
    "endAt" INTEGER NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'Playlists',
    "targetSequenceId" INTEGER,
    CONSTRAINT "ScheduleItem_targetSequenceId_fkey" FOREIGN KEY ("targetSequenceId") REFERENCES "TargetSequence" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ScheduleItem" ("endAt", "id", "name", "startAt", "withMerging") SELECT "endAt", "id", "name", "startAt", "withMerging" FROM "ScheduleItem";
DROP TABLE "ScheduleItem";
ALTER TABLE "new_ScheduleItem" RENAME TO "ScheduleItem";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "TargetSequence_stageUpId_key" ON "TargetSequence"("stageUpId");

-- CreateIndex
CREATE UNIQUE INDEX "TargetSequence_stageDownId_key" ON "TargetSequence"("stageDownId");
