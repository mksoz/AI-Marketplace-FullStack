/*
  Warnings:

  - Added the required column `name` to the `DeliverableFolder` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex (remove unique constraint)
DROP INDEX "DeliverableFolder_milestoneId_key";

-- AlterTable (add name column with default for existing rows, then make it required)
ALTER TABLE "DeliverableFolder" ADD COLUMN "name" TEXT NOT NULL DEFAULT 'Carpeta Principal';

-- Update existing folders to have milestone-based names
UPDATE "DeliverableFolder" 
SET "name" = CONCAT('Hito ', m.title)
FROM "Milestone" m
WHERE "DeliverableFolder"."milestoneId" = m.id;
