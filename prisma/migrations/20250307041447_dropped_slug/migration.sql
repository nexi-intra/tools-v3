/*
  Warnings:

  - You are about to drop the column `slug` on the `Blob` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "unique_blob_slug";

-- AlterTable
ALTER TABLE "Blob" DROP COLUMN "slug";
