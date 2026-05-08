-- CreateTable
CREATE TABLE "SharedDesign" (
    "id" TEXT NOT NULL,
    "shareCode" TEXT NOT NULL,
    "type" "AccessoryType" NOT NULL,
    "beads" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SharedDesign_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SharedDesign_shareCode_key" ON "SharedDesign"("shareCode");
