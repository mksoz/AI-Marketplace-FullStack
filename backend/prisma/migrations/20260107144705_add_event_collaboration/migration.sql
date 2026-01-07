-- AlterTable
ALTER TABLE "CalendarEvent" ADD COLUMN     "clientId" TEXT,
ADD COLUMN     "proposalComment" TEXT,
ADD COLUMN     "proposedBy" TEXT,
ADD COLUMN     "proposedEndDate" TIMESTAMP(3),
ADD COLUMN     "proposedStartDate" TIMESTAMP(3),
ADD COLUMN     "vendorId" TEXT;

-- AddForeignKey
ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "VendorProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "ClientProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
