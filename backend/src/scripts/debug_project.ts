
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const projectId = '55b84011-8980-4cab-b368-080ecd9add69';

    console.log(`Checking project: ${projectId}`);

    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
            client: {
                include: { user: true }
            }
        }
    });

    if (!project) {
        console.log('❌ Project not found!');
    } else {
        console.log('✅ Project found:');
        console.log(`- Title: ${project.title}`);
        console.log(`- Owner (Client ID): ${project.clientId}`);
        console.log(`- Owner (User ID): ${project.client.userId}`);
        console.log(`- Owner (Email): ${project.client.user.email}`);
    }

    console.log('\nList of all Clients:');
    const clients = await prisma.clientProfile.findMany({
        include: { user: true }
    });
    clients.forEach(c => {
        console.log(`- ClientId: ${c.id}, UserId: ${c.userId}, Email: ${c.user.email}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
