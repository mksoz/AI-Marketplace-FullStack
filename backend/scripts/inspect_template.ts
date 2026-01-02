
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const template = await prisma.requirementTemplate.findFirst({
        where: { name: 'Python Project Starter' }
    });

    if (!template) {
        console.log("Template 'Python Project Starter' not found.");
        return;
    }

    console.log("Template Found:", template.name);
    console.log("Structure:", JSON.stringify(template.structure, null, 2));
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
