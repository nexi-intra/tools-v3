-- CreateTable
CREATE TABLE "_CountryToTool" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CountryToTool_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CountryToTool_B_index" ON "_CountryToTool"("B");

-- AddForeignKey
ALTER TABLE "_CountryToTool" ADD CONSTRAINT "_CountryToTool_A_fkey" FOREIGN KEY ("A") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CountryToTool" ADD CONSTRAINT "_CountryToTool_B_fkey" FOREIGN KEY ("B") REFERENCES "Tool"("id") ON DELETE CASCADE ON UPDATE CASCADE;
