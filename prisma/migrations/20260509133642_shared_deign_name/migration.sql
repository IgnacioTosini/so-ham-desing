/*
  Warnings:

  - Added the required column `name` to the `SharedDesign` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SharedDesign" ADD COLUMN     "name" TEXT NOT NULL;
