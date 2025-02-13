/*
  Warnings:

  - You are about to drop the column `userProfileId` on the `Tool` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Tool" DROP CONSTRAINT "Tool_userProfileId_fkey";

-- AlterTable
ALTER TABLE "Tool" DROP COLUMN "userProfileId";

-- CreateTable
CREATE TABLE "_ToolToUserProfile" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ToolToUserProfile_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ToolToUserProfile_B_index" ON "_ToolToUserProfile"("B");

-- AddForeignKey
ALTER TABLE "_ToolToUserProfile" ADD CONSTRAINT "_ToolToUserProfile_A_fkey" FOREIGN KEY ("A") REFERENCES "Tool"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ToolToUserProfile" ADD CONSTRAINT "_ToolToUserProfile_B_fkey" FOREIGN KEY ("B") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
