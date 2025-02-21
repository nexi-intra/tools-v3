-- DropForeignKey
ALTER TABLE "Channel" DROP CONSTRAINT "Channel_regionId_fkey";

-- AlterTable
ALTER TABLE "Channel" ALTER COLUMN "regionId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Channel" ADD CONSTRAINT "Channel_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;
