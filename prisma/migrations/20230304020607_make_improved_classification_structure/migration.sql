-- CreateTable
CREATE TABLE "ClassCategory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ClassItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "value" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,
    CONSTRAINT "ClassItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ClassCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ClassedItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "classItemId" INTEGER NOT NULL,
    "fileHash" TEXT NOT NULL,
    CONSTRAINT "ClassedItem_classItemId_fkey" FOREIGN KEY ("classItemId") REFERENCES "ClassItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ClassedItem_fileHash_fkey" FOREIGN KEY ("fileHash") REFERENCES "FileItem" ("filehash") ON DELETE RESTRICT ON UPDATE CASCADE
);
