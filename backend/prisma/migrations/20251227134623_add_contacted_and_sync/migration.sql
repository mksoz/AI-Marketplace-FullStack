/*
  Warnings:

  - The values [REVIEW,APPROVED,REJECTED] on the enum `MilestoneStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MilestoneStatus_new" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'PAID');
ALTER TABLE "Milestone" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Milestone" ALTER COLUMN "status" TYPE "MilestoneStatus_new" USING ("status"::text::"MilestoneStatus_new");
ALTER TYPE "MilestoneStatus" RENAME TO "MilestoneStatus_old";
ALTER TYPE "MilestoneStatus_new" RENAME TO "MilestoneStatus";
DROP TYPE "MilestoneStatus_old";
ALTER TABLE "Milestone" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ProjectStatus" ADD VALUE 'PROPOSED';
ALTER TYPE "ProjectStatus" ADD VALUE 'CONTACTED';
ALTER TYPE "ProjectStatus" ADD VALUE 'IN_NEGOTIATION';
ALTER TYPE "ProjectStatus" ADD VALUE 'ACCEPTED';
ALTER TYPE "ProjectStatus" ADD VALUE 'DECLINED';

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "templateData" JSONB,
ADD COLUMN     "vendorId" TEXT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'CLIENT';

-- CreateTable
CREATE TABLE "RequirementTemplate" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "structure" JSONB NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RequirementTemplate_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RequirementTemplate" ADD CONSTRAINT "RequirementTemplate_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "VendorProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "VendorProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
