
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Starting Deep Audit...");

    const templates = await prisma.requirementTemplate.findMany();

    for (const t of templates) {
        console.log(`\nTemplate: ${t.name} (ID: ${t.id})`);
        // @ts-ignore
        const structure = (t.structure as any[]) || [];

        structure.forEach((field: any) => {
            console.log(`  - Field: Label="${field.label}", ID="${field.id}", Type="${field.type}", Mandatory=${field.isMandatory || false}`);
        });
    }
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
