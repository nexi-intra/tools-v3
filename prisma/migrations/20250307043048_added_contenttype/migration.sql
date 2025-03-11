/*
  Warnings:

  - Added the required column `content_type` to the `Blob` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Blob" ADD COLUMN     "content_type" VARCHAR NOT NULL;
