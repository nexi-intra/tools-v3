-- AlterTable
ALTER TABLE "Blob" ADD COLUMN     "source_tool_id" INTEGER;

-- AddForeignKey
ALTER TABLE "Blob" ADD CONSTRAINT "Blob_source_tool_id_fkey" FOREIGN KEY ("source_tool_id") REFERENCES "Tool"("id") ON DELETE SET NULL ON UPDATE CASCADE;
