/*
  Warnings:

  - You are about to drop the `ClassificatedGroup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ClassificatedItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Classification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ClassificationsGroup` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ClassificatedGroup";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ClassificatedItem";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Classification";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ClassificationsGroup";
PRAGMA foreign_keys=on;
