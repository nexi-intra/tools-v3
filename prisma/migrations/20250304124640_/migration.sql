-- AlterTable
ALTER TABLE "Board" ADD COLUMN     "groupOwnerId" VARCHAR,
ADD COLUMN     "groupViewerId" VARCHAR;

-- AlterTable
ALTER TABLE "Tool" ADD COLUMN     "groupOwnerId" VARCHAR,
ADD COLUMN     "groupViewerId" VARCHAR;
