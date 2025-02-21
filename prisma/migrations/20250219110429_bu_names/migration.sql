/*
  Warnings:

  - You are about to drop the column `groupFunction` on the `BusinessUnit` table. All the data in the column will be lost.
  - You are about to drop the column `HomePageUrl` on the `Country` table. All the data in the column will be lost.
  - Added the required column `isGroupFunction` to the `BusinessUnit` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BusinessUnit" DROP COLUMN "groupFunction",
ADD COLUMN     "homePageUrl" TEXT,
ADD COLUMN     "isGroupFunction" BOOLEAN NOT NULL,
ADD COLUMN     "newsPageUrl" TEXT;

-- AlterTable
ALTER TABLE "Country" DROP COLUMN "HomePageUrl",
ADD COLUMN     "homePageUrl" TEXT;
