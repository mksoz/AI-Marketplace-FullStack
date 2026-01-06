-- AlterTable
ALTER TABLE "DeliverableFile" ADD COLUMN     "subfolderId" TEXT;

-- CreateIndex
CREATE INDEX "DeliverableFile_subfolderId_idx" ON "DeliverableFile"("subfolderId");

-- AddForeignKey
ALTER TABLE "DeliverableFile" ADD CONSTRAINT "DeliverableFile_subfolderId_fkey" FOREIGN KEY ("subfolderId") REFERENCES "DeliverableSubfolder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
