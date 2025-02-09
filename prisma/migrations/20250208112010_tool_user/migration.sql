-- AlterTable
ALTER TABLE "Tool" ADD COLUMN     "userProfileId" INTEGER;

-- AddForeignKey
ALTER TABLE "Tool" ADD CONSTRAINT "Tool_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
