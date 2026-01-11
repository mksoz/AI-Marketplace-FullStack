/*
  Warnings:

  - The values [INFO,SUCCESS,WARNING,ERROR] on the enum `NotificationType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `link` on the `Notification` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "NotificationType_new" AS ENUM ('PROPOSAL_RECEIVED', 'PROPOSAL_ACCEPTED', 'PROPOSAL_REJECTED', 'PROPOSAL_UPDATED', 'PROJECT_CREATED', 'PROJECT_STARTED', 'PROJECT_COMPLETED', 'PROJECT_CANCELLED', 'MILESTONE_COMPLETED', 'MILESTONE_APPROVED', 'MILESTONE_REJECTED', 'DELIVERABLE_UPLOADED', 'DELIVERABLE_APPROVED', 'DEADLINE_REMINDER', 'PAYMENT_REQUESTED', 'PAYMENT_APPROVED', 'PAYMENT_REJECTED', 'PAYMENT_COMPLETED', 'PAYMENT_FAILED', 'MESSAGE_RECEIVED', 'MESSAGE_REPLY', 'EVENT_CREATED', 'EVENT_INVITATION', 'EVENT_ACCEPTED', 'EVENT_REJECTED', 'EVENT_PROPOSED', 'EVENT_REMINDER', 'FILE_UPLOADED', 'FILE_UPDATED', 'FOLDER_CREATED', 'FOLDER_ACCESS', 'CONTRACT_GENERATED', 'CONTRACT_SIGNED', 'CONTRACT_REMINDER', 'INCIDENT_CREATED', 'INCIDENT_ASSIGNED', 'INCIDENT_RESOLVED', 'INCIDENT_UPDATED', 'INCIDENT_CRITICAL', 'REVIEW_RECEIVED', 'REVIEW_REPLIED', 'GITHUB_COMMIT', 'GITHUB_RELEASE', 'GITHUB_MILESTONE', 'SYSTEM_ASSIGNMENT', 'SYSTEM_REMINDER', 'SYSTEM_SUCCESS', 'SYSTEM_WARNING');
ALTER TABLE "Notification" ALTER COLUMN "type" DROP DEFAULT;

-- Remove default from updatedAt after backfilling
ALTER TABLE "Notification" ALTER COLUMN "updatedAt" DROP DEFAULT;
ALTER TABLE "Notification" ALTER COLUMN "type" TYPE "NotificationType_new" USING ("type"::text::"NotificationType_new");
ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "NotificationType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "link",
ADD COLUMN     "actionUrl" TEXT,
ADD COLUMN     "actorId" TEXT,
ADD COLUMN     "entityId" TEXT,
ADD COLUMN     "entityType" TEXT,
ADD COLUMN     "readAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "type" DROP DEFAULT;

-- Remove default from updatedAt after backfilling
ALTER TABLE "Notification" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Notification_entityId_entityType_idx" ON "Notification"("entityId", "entityType");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
