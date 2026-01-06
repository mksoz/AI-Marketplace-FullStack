import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixAllFolders() {
    console.log('🔄 Unlocking folders for all PAID and COMPLETED milestones...\n');

    // Get all milestones that should have unlocked folders
    const milestones = await prisma.milestone.findMany({
        where: {
            OR: [
                { status: 'PAID' },
                { status: 'COMPLETED' }
            ]
        },
        include: {
            deliverableFolder: true
        }
    });

    console.log(`Found ${milestones.length} milestones that should be unlocked\n`);

    let updated = 0;
    for (const milestone of milestones) {
        if (milestone.deliverableFolder && milestone.deliverableFolder.status !== 'UNLOCKED') {
            await prisma.deliverableFolder.update({
                where: { id: milestone.deliverableFolder.id },
                data: {
                    status: 'UNLOCKED',
                    unlockedAt: new Date()
                }
            });
            updated++;
            console.log(`✅ Unlocked folder for: ${milestone.title} (Status: ${milestone.status})`);
        } else if (milestone.deliverableFolder) {
            console.log(`⏭️  Already unlocked: ${milestone.title}`);
        } else {
            console.log(`⚠️  No folder found for: ${milestone.title}`);
        }
    }

    console.log(`\n✨ Updated ${updated} folders`);
}

fixAllFolders()
    .then(() => {
        console.log('✅ Done!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Error:', error);
        process.exit(1);
    });
