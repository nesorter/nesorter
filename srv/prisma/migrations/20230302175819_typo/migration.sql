-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PlaylistsOnScheduleItem" (
    "scheduleItemId" INTEGER NOT NULL,
    "playlistTypeManualMetaId" INTEGER NOT NULL,

    PRIMARY KEY ("scheduleItemId", "playlistTypeManualMetaId"),
    CONSTRAINT "PlaylistsOnScheduleItem_scheduleItemId_fkey" FOREIGN KEY ("scheduleItemId") REFERENCES "ScheduleItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PlaylistsOnScheduleItem_playlistTypeManualMetaId_fkey" FOREIGN KEY ("playlistTypeManualMetaId") REFERENCES "Playlist" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PlaylistsOnScheduleItem" ("playlistTypeManualMetaId", "scheduleItemId") SELECT "playlistTypeManualMetaId", "scheduleItemId" FROM "PlaylistsOnScheduleItem";
DROP TABLE "PlaylistsOnScheduleItem";
ALTER TABLE "new_PlaylistsOnScheduleItem" RENAME TO "PlaylistsOnScheduleItem";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
