-- CreateEnum
CREATE TYPE "DeliverableFolderStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'READY_FOR_REVIEW', 'UNLOCKED');

-- CreateTable
CREATE TABLE "DeliverableFolder" (
    "id" TEXT NOT NULL,
    "milestoneId" TEXT NOT NULL,
    "status" "DeliverableFolderStatus" NOT NULL DEFAULT 'PENDING',
    "totalFiles" INTEGER NOT NULL DEFAULT 0,
    "totalSize" BIGINT NOT NULL DEFAULT 0,
    "unlockedAt" TIMESTAMP(3),
    "unlockedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliverableFolder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliverableFile" (
    "id" TEXT NOT NULL,
    "folderId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "fileSize" BIGINT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "thumbnailPath" TEXT,
    "previewAvailable" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isLatest" BOOLEAN NOT NULL DEFAULT true,
    "uploadedBy" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeliverableFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeliverableFolder_milestoneId_key" ON "DeliverableFolder"("milestoneId");

-- CreateIndex
CREATE INDEX "DeliverableFolder_milestoneId_idx" ON "DeliverableFolder"("milestoneId");

-- CreateIndex
CREATE INDEX "DeliverableFolder_status_idx" ON "DeliverableFolder"("status");

-- CreateIndex
CREATE INDEX "DeliverableFile_folderId_idx" ON "DeliverableFile"("folderId");

-- CreateIndex
CREATE INDEX "DeliverableFile_uploadedBy_idx" ON "DeliverableFile"("uploadedBy");

-- CreateIndex
CREATE INDEX "DeliverableFile_isLatest_idx" ON "DeliverableFile"("isLatest");

-- AddForeignKey
ALTER TABLE "DeliverableFolder" ADD CONSTRAINT "DeliverableFolder_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "Milestone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliverableFile" ADD CONSTRAINT "DeliverableFile_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "DeliverableFolder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
