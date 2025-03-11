/*
  Warnings:

  - You are about to drop the `AppFeature` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AppLink` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AppNode` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AppFeature" DROP CONSTRAINT "AppFeature_appMenuId_fkey";

-- DropForeignKey
ALTER TABLE "AppLink" DROP CONSTRAINT "AppLink_appFeatureId_fkey";

-- DropForeignKey
ALTER TABLE "AppNode" DROP CONSTRAINT "AppNode_appLinkId_fkey";

-- DropForeignKey
ALTER TABLE "AppNode" DROP CONSTRAINT "AppNode_parentId_fkey";

-- DropTable
DROP TABLE "AppFeature";

-- DropTable
DROP TABLE "AppLink";

-- DropTable
DROP TABLE "AppNode";
