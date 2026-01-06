import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkMilestones() {
    console.log('🔍 Checking all milestones...\n');

    const milestones = await prisma.milestone.findMany({
        include: {
            deliverableFolder: true
        },
        orderBy: {
            order: 'asc'
        }
    });

    for (const m of milestones) {
        console.log(`📌 Milestone: ${m.title} (Order: ${m.order})`);
        console.log(`   Status: ${m.status}`);
        console.log(`   Completed: ${m.completedAt ? 'Yes' : 'No'}`);
        if (m.deliverableFolder) {
            console.log(`   Folder Status: ${m.deliverableFolder.status}`);
            console.log(`   Folder Unlocked: ${m.deliverableFolder.unlockedAt ? 'Yes' : 'No'}`);
        } else {
            console.log(`   Folder: Not created`);
        }
        console.log('');
    }
}

checkMilestones()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Error:', error);
        process.exit(1);
    });
