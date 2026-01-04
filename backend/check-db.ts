
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('--- USERS & CLIENT DATA ---');
        const users = await prisma.user.findMany({
            include: {
                clientProfile: {
                    include: {
                        projects: { include: { milestones: true } },
                        account: true
                    }
                },
                vendorProfile: true
            }
        });

        for (const u of users) {
            console.log(`User: ${u.email} (${u.role}) ID: ${u.id}`);
            if (u.clientProfile) {
                console.log(`  [Client] Projects: ${u.clientProfile.projects.length}`);
                u.clientProfile.projects.forEach(p => {
                    if (p.milestones.length > 0) {
                        console.log(`    - Project: ${p.title}`);
                        p.milestones.forEach(m => console.log(`      * Milestone: ${m.title} | Status: ${m.status} | Amount: ${m.amount} | Due: ${m.dueDate}`));
                    }
                });
                console.log(`  [Client] Account: ${u.clientProfile.account?.id} Balance: ${u.clientProfile.account?.balance}`);
            }
            if (u.vendorProfile) {
                console.log(`  [Vendor] Name: ${u.vendorProfile.companyName}`);
            }
        }

        console.log('\n--- TRANSACTIONS ---');
        const tx = await prisma.transaction.findMany({ take: 10 });
        console.log(`Total Transactions found (showing top 10): ${tx.length}`);
        tx.forEach(t => {
            console.log(`  Tx ${t.id} | Amount: ${t.amount} | Type: ${t.type} | From: ${t.fromAccountId} | To: ${t.toAccountId}`);
        });

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
