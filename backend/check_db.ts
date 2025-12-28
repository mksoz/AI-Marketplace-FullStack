
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
    try {
        console.log("Checking Users...");
        const users = await prisma.user.findMany();
        console.log(`Found ${users.length} users.`);
        users.forEach(u => console.log(` - ${u.email} (${u.role})`));

        console.log("\nChecking Chats...");
        const chats = await prisma.conversation.findMany({ include: { project: true } });
        console.log(`Found ${chats.length} chats.`);
        chats.forEach(c => {
            console.log(` - Chat ID: ${c.id}`);
            console.log(`   Project: ${c.project?.title || 'NULL'}`);
            console.log(`   ProjectId: ${c.projectId}`);
        });

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
