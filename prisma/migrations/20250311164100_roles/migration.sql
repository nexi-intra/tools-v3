/*
  Warnings:

  - You are about to drop the column `userProfileId` on the `UserRole` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserRole" DROP CONSTRAINT "UserRole_userProfileId_fkey";

-- AlterTable
ALTER TABLE "UserRole" DROP COLUMN "userProfileId";

-- CreateTable
CREATE TABLE "_UserProfileToUserRole" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_UserProfileToUserRole_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_UserProfileToUserRole_B_index" ON "_UserProfileToUserRole"("B");

-- AddForeignKey
ALTER TABLE "_UserProfileToUserRole" ADD CONSTRAINT "_UserProfileToUserRole_A_fkey" FOREIGN KEY ("A") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserProfileToUserRole" ADD CONSTRAINT "_UserProfileToUserRole_B_fkey" FOREIGN KEY ("B") REFERENCES "UserRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;
