-- CreateEnum
CREATE TYPE "CardCategory" AS ENUM ('COURAGE', 'WISDOM', 'HONOR', 'SHADOWS');

-- CreateTable
CREATE TABLE "Card" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "basePrice" INTEGER NOT NULL,
    "baseProfit" INTEGER NOT NULL,
    "profitMultiplier" DOUBLE PRECISION NOT NULL,
    "priceMultiplier" DOUBLE PRECISION NOT NULL,
    "category" "CardCategory" NOT NULL,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCard" (
    "id" TEXT NOT NULL,
    "userId" BIGINT NOT NULL,
    "cardId" TEXT NOT NULL,
    "upgradeLevel" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "UserCard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserCard_userId_cardId_key" ON "UserCard"("userId", "cardId");

-- AddForeignKey
ALTER TABLE "UserCard" ADD CONSTRAINT "UserCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("telegramId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCard" ADD CONSTRAINT "UserCard_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
