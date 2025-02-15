-- DropForeignKey
ALTER TABLE "AppNode" DROP CONSTRAINT "AppNode_appLinkId_fkey";

-- AlterTable
ALTER TABLE "AppNode" ALTER COLUMN "appLinkId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "AppNode" ADD CONSTRAINT "AppNode_appLinkId_fkey" FOREIGN KEY ("appLinkId") REFERENCES "AppLink"("id") ON DELETE SET NULL ON UPDATE CASCADE;
