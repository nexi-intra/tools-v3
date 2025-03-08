-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "isGroupTool" BOOLEAN DEFAULT false;

-- CreateTable
CREATE TABLE "Blob" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR,
    "deleted_at" TIMESTAMPTZ(6),
    "name" VARCHAR NOT NULL,
    "hash" VARCHAR NOT NULL,
    "slug" VARCHAR NOT NULL,
    "data" BYTEA NOT NULL,

    CONSTRAINT "Blob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "unique_blob_hash" ON "Blob"("hash");

-- CreateIndex
CREATE UNIQUE INDEX "unique_blob_slug" ON "Blob"("slug");
