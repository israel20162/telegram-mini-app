-- AlterTable
ALTER TABLE "User" ADD COLUMN     "referredBy" BIGINT;

-- CreateTable
CREATE TABLE "Referral" (
    "id" SERIAL NOT NULL,
    "userId" BIGINT NOT NULL,
    "referrerTelegramId" BIGINT NOT NULL,
    "rewardClaimed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Referral_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("telegramId") ON DELETE RESTRICT ON UPDATE CASCADE;
