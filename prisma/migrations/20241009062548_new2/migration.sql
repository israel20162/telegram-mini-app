/*
  Warnings:

  - You are about to drop the column `upgradeLevelRechaege` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "upgradeLevelRechaege",
ADD COLUMN     "upgradeLevelRecharge" INTEGER NOT NULL DEFAULT 1;
