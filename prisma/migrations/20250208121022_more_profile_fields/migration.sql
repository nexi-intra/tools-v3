-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN     "CurrentEmail" VARCHAR,
ADD COLUMN     "OldEmail" VARCHAR,
ADD COLUMN     "OnPremisesId" VARCHAR,
ADD COLUMN     "companykey" VARCHAR,
ADD COLUMN     "isExternal" BOOLEAN NOT NULL DEFAULT false;
