/*
  Warnings:

  - You are about to drop the column `isActive` on the `Product` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[productId,imageId]` on the table `ProductImage` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stoneId,imageId]` on the table `StoneImage` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "ProductImage" DROP CONSTRAINT "ProductImage_imageId_fkey";

-- DropForeignKey
ALTER TABLE "ProductImage" DROP CONSTRAINT "ProductImage_productId_fkey";

-- DropForeignKey
ALTER TABLE "StoneImage" DROP CONSTRAINT "StoneImage_imageId_fkey";

-- DropForeignKey
ALTER TABLE "StoneImage" DROP CONSTRAINT "StoneImage_stoneId_fkey";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "isActive";

-- CreateIndex
CREATE INDEX "ProductImage_productId_idx" ON "ProductImage"("productId");

-- CreateIndex
CREATE INDEX "ProductImage_imageId_idx" ON "ProductImage"("imageId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductImage_productId_imageId_key" ON "ProductImage"("productId", "imageId");

-- CreateIndex
CREATE INDEX "StoneImage_stoneId_idx" ON "StoneImage"("stoneId");

-- CreateIndex
CREATE INDEX "StoneImage_imageId_idx" ON "StoneImage"("imageId");

-- CreateIndex
CREATE UNIQUE INDEX "StoneImage_stoneId_imageId_key" ON "StoneImage"("stoneId", "imageId");

-- AddForeignKey
ALTER TABLE "StoneImage" ADD CONSTRAINT "StoneImage_stoneId_fkey" FOREIGN KEY ("stoneId") REFERENCES "Stone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoneImage" ADD CONSTRAINT "StoneImage_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;
