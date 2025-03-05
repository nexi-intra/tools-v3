-- AlterTable
ALTER TABLE "Board" ADD COLUMN     "parentId" INTEGER;

-- AlterTable
ALTER TABLE "Tool" ADD COLUMN     "parentId" INTEGER;

-- AddForeignKey
ALTER TABLE "Board" ADD CONSTRAINT "Board_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Board"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tool" ADD CONSTRAINT "Tool_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Tool"("id") ON DELETE SET NULL ON UPDATE CASCADE;
