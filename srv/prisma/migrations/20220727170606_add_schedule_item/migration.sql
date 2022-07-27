-- CreateTable
CREATE TABLE "ScheduleItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "startAt" INTEGER NOT NULL,
    "endAt" INTEGER NOT NULL,
    "playlistId" INTEGER NOT NULL
);
