-- CreateTable
CREATE TABLE "DeliverableSubfolder" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" TEXT,
    "folderId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeliverableSubfolder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DeliverableSubfolder_folderId_idx" ON "DeliverableSubfolder"("folderId");

-- CreateIndex
CREATE INDEX "DeliverableSubfolder_parentId_idx" ON "DeliverableSubfolder"("parentId");

-- AddForeignKey
ALTER TABLE "DeliverableSubfolder" ADD CONSTRAINT "DeliverableSubfolder_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "DeliverableFolder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliverableSubfolder" ADD CONSTRAINT "DeliverableSubfolder_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "DeliverableSubfolder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
