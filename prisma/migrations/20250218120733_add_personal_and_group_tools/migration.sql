-- CreateEnum
CREATE TYPE "Status" AS ENUM ('GLOBAL', 'GROUP', 'PERSONAL');

-- AlterTable
ALTER TABLE "ToolGroup" ADD COLUMN     "visibility" "Status" NOT NULL DEFAULT 'PERSONAL';

-- CreateTable
CREATE TABLE "_ToolGroupToUserProfile" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ToolGroupToUserProfile_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ToolGroupToUserGroup" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ToolGroupToUserGroup_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ToolGroupToUserProfile_B_index" ON "_ToolGroupToUserProfile"("B");

-- CreateIndex
CREATE INDEX "_ToolGroupToUserGroup_B_index" ON "_ToolGroupToUserGroup"("B");

-- AddForeignKey
ALTER TABLE "_ToolGroupToUserProfile" ADD CONSTRAINT "_ToolGroupToUserProfile_A_fkey" FOREIGN KEY ("A") REFERENCES "ToolGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ToolGroupToUserProfile" ADD CONSTRAINT "_ToolGroupToUserProfile_B_fkey" FOREIGN KEY ("B") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ToolGroupToUserGroup" ADD CONSTRAINT "_ToolGroupToUserGroup_A_fkey" FOREIGN KEY ("A") REFERENCES "ToolGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ToolGroupToUserGroup" ADD CONSTRAINT "_ToolGroupToUserGroup_B_fkey" FOREIGN KEY ("B") REFERENCES "UserGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
