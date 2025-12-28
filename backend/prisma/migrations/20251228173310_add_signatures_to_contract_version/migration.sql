-- AlterTable
ALTER TABLE "ContractVersion" ADD COLUMN     "clientSignedAt" TIMESTAMP(3),
ADD COLUMN     "vendorSignedAt" TIMESTAMP(3);
