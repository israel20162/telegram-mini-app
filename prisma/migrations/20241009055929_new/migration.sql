-- AlterTable
ALTER TABLE "User" ADD COLUMN     "rechargeSpeed" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "upgradeLevelRechaege" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "points" SET DATA TYPE BIGINT;
