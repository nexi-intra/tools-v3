/*
  Warnings:

  - You are about to drop the column `firstname` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `lastname` on the `UserProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserProfile" DROP COLUMN "firstname",
DROP COLUMN "lastname";
