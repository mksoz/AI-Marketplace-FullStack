/**
 * Migration Script: Update Existing Dispute Incidents with DisputeId
 * 
 * This script updates all existing incident records of type DISPUTE
 * to populate the disputeId field by extracting it from the resolution field.
 * 
 * Run with: npx ts-node src/scripts/fix-dispute-incidents.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('[Migration] Starting dispute incident fix...');

    try {
        // Find all dispute incidents without disputeId
        const disputeIncidents = await prisma.incident.findMany({
            where: {
                type: 'DISPUTE',
                OR: [
                    { disputeId: null },
                    { disputeId: '' }
                ]
            },
            select: {
                id: true,
                resolution: true,
                projectId: true
            }
        });

        console.log(`[Migration] Found ${disputeIncidents.length} dispute incidents without disputeId`);

        let successCount = 0;
        let failCount = 0;

        for (const incident of disputeIncidents) {
            try {
                // Extract dispute ID from resolution field
                // Format: "DISPUTE_ID:uuid" or "Disputa creada: uuid..."
                let disputeId: string | null = null;

                if (incident.resolution) {
                    // Try pattern 1: DISPUTE_ID:uuid
                    const match1 = incident.resolution.match(/DISPUTE_ID:([a-f0-9-]+)/i);
                    if (match1) {
                        disputeId = match1[1];
                    } else {
                        // Try pattern 2: "Disputa creada: uuid"
                        const match2 = incident.resolution.match(/Disputa creada:\s*([a-f0-9-]+)/i);
                        if (match2) {
                            disputeId = match2[1];
                        }
                    }
                }

                if (disputeId) {
                    // Verify the dispute exists
                    const dispute = await prisma.dispute.findUnique({
                        where: { id: disputeId },
                        select: { id: true }
                    });

                    if (dispute) {
                        // Update the incident with disputeId
                        await prisma.incident.update({
                            where: { id: incident.id },
                            data: { disputeId }
                        });

                        console.log(`[Migration] ✓ Updated incident ${incident.id} with disputeId ${disputeId}`);
                        successCount++;
                    } else {
                        console.warn(`[Migration] ⚠ Dispute ${disputeId} not found for incident ${incident.id}`);
                        failCount++;
                    }
                } else {
                    console.warn(`[Migration] ⚠ Could not extract disputeId from incident ${incident.id}`);
                    failCount++;
                }
            } catch (error) {
                console.error(`[Migration] ✗ Error updating incident ${incident.id}:`, error);
                failCount++;
            }
        }

        console.log('\n[Migration] Summary:');
        console.log(`  Total incidents: ${disputeIncidents.length}`);
        console.log(`  Successfully updated: ${successCount}`);
        console.log(`  Failed: ${failCount}`);
        console.log('[Migration] Complete!');

    } catch (error) {
        console.error('[Migration] Fatal error:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
