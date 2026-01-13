// Script to update existing dispute incidents in the database
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateDisputeIncidents() {
    try {
        console.log('🔄 Updating existing dispute incidents...');

        // Update all incidents that have DISPUTE_ID: in their resolution
        const result = await prisma.incident.updateMany({
            where: {
                OR: [
                    { resolution: { startsWith: 'DISPUTE_ID:' } },
                    { title: { startsWith: 'Disputa:' } }
                ]
            },
            data: {
                type: 'DISPUTE'
            }
        });

        console.log(`✅ Updated ${result.count} incidents to type DISPUTE`);

        // Verify the updates
        const disputeCount = await prisma.incident.count({
            where: { type: 'DISPUTE' }
        });

        console.log(`📊 Total DISPUTE incidents in database: ${disputeCount}`);

    } catch (error) {
        console.error('❌ Error updating incidents:', error);
    } finally {
        await prisma.$disconnect();
    }
}

updateDisputeIncidents();
