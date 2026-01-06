import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixFolderStatuses() {
    console.log('🔄 Fixing folder statuses for completed milestones...');

    // Get all completed milestones
    const completedMilestones = await prisma.milestone.findMany({
        where: {
            status: 'COMPLETED'
        },
        include: {
            deliverableFolder: true
        }
    });

    console.log(`Found ${completedMilestones.length} completed milestones`);

    let updated = 0;
    for (const milestone of completedMilestones) {
        if (milestone.deliverableFolder && milestone.deliverableFolder.status !== 'UNLOCKED') {
            await prisma.deliverableFolder.update({
                where: { id: milestone.deliverableFolder.id },
                data: {
                    status: 'UNLOCKED',
                    unlockedAt: new Date()
                }
            });
            updated++;
            console.log(`✅ Unlocked folder for milestone: ${milestone.title}`);
        }
    }

    console.log(`\n✨ Updated ${updated} folders`);
}

fixFolderStatuses()
    .then(() => {
        console.log('✅ Done!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Error:', error);
        process.exit(1);
    });
