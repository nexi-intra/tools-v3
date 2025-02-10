-- CreateTable
CREATE TABLE "ToolTexts" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR,
    "deleted_at" TIMESTAMPTZ(6),
    "name" VARCHAR NOT NULL,
    "description" VARCHAR,
    "languageId" INTEGER NOT NULL,

    CONSTRAINT "ToolTexts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ToolToToolTexts" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ToolToToolTexts_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ToolToToolTexts_B_index" ON "_ToolToToolTexts"("B");

-- AddForeignKey
ALTER TABLE "ToolTexts" ADD CONSTRAINT "ToolTexts_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ToolToToolTexts" ADD CONSTRAINT "_ToolToToolTexts_A_fkey" FOREIGN KEY ("A") REFERENCES "Tool"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ToolToToolTexts" ADD CONSTRAINT "_ToolToToolTexts_B_fkey" FOREIGN KEY ("B") REFERENCES "ToolTexts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
