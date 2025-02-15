/*
  Warnings:

  - You are about to drop the `AppMenu` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AppFeature" DROP CONSTRAINT "AppFeature_appMenuId_fkey";

-- DropForeignKey
ALTER TABLE "AppMenu" DROP CONSTRAINT "AppMenu_appLinkId_fkey";

-- DropForeignKey
ALTER TABLE "AppMenu" DROP CONSTRAINT "AppMenu_parentId_fkey";

-- DropTable
DROP TABLE "AppMenu";

-- CreateTable
CREATE TABLE "AppNode" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR,
    "deleted_at" TIMESTAMPTZ(6),
    "name" VARCHAR NOT NULL,
    "description" VARCHAR,
    "translations" JSONB,
    "status" VARCHAR,
    "sortorder" DECIMAL(65,30),
    "parentId" INTEGER,
    "appLinkId" INTEGER NOT NULL,

    CONSTRAINT "AppNode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "unique_appmenu_name" ON "AppNode"("name");

-- AddForeignKey
ALTER TABLE "AppFeature" ADD CONSTRAINT "AppFeature_appMenuId_fkey" FOREIGN KEY ("appMenuId") REFERENCES "AppNode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppNode" ADD CONSTRAINT "AppNode_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "AppNode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppNode" ADD CONSTRAINT "AppNode_appLinkId_fkey" FOREIGN KEY ("appLinkId") REFERENCES "AppLink"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
