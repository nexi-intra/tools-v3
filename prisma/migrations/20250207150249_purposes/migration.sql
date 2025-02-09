/*
  Warnings:

  - You are about to drop the column `toolId` on the `Purpose` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Purpose" DROP CONSTRAINT "Purpose_toolId_fkey";

-- AlterTable
ALTER TABLE "Purpose" DROP COLUMN "toolId";

-- CreateTable
CREATE TABLE "_ToolPurposes" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ToolPurposes_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ToolPurposes_B_index" ON "_ToolPurposes"("B");

-- AddForeignKey
ALTER TABLE "_ToolPurposes" ADD CONSTRAINT "_ToolPurposes_A_fkey" FOREIGN KEY ("A") REFERENCES "Purpose"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ToolPurposes" ADD CONSTRAINT "_ToolPurposes_B_fkey" FOREIGN KEY ("B") REFERENCES "Tool"("id") ON DELETE CASCADE ON UPDATE CASCADE;
