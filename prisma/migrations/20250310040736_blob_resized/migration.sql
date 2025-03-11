-- CreateTable
CREATE TABLE "BlobResized" (
    "id" SERIAL NOT NULL,
    "width" INTEGER NOT NULL,
    "data" BYTEA NOT NULL,
    "blobId" INTEGER NOT NULL,

    CONSTRAINT "BlobResized_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BlobResized" ADD CONSTRAINT "BlobResized_blobId_fkey" FOREIGN KEY ("blobId") REFERENCES "Blob"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
