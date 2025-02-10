/*
  Warnings:

  - You are about to drop the `_ToolToToolTexts` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[toolId,languageId]` on the table `ToolTexts` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `toolId` to the `ToolTexts` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_ToolToToolTexts" DROP CONSTRAINT "_ToolToToolTexts_A_fkey";

-- DropForeignKey
ALTER TABLE "_ToolToToolTexts" DROP CONSTRAINT "_ToolToToolTexts_B_fkey";

-- AlterTable
ALTER TABLE "ToolTexts" ADD COLUMN     "toolId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "_ToolToToolTexts";

-- CreateIndex
CREATE UNIQUE INDEX "ToolTexts_toolId_languageId_key" ON "ToolTexts"("toolId", "languageId");

-- AddForeignKey
ALTER TABLE "ToolTexts" ADD CONSTRAINT "ToolTexts_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
