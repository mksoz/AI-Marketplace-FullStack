import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Checking template integrity...");

    const templates = await prisma.requirementTemplate.findMany();

    for (const t of templates) {
        let updated = false;
        // @ts-ignore
        const structure = t.structure as any[];

        const newStructure = structure.map(field => {
            // Fix Title
            if (field.label.toLowerCase().includes('título') || field.label.toLowerCase().includes('title') || field.id === 'mandatory-title') {
                if (field.id !== 'mandatory-title') {
                    console.log(`Fixing Title ID for template ${t.name}: ${field.id} -> mandatory-title`);
                    updated = true;
                    return { ...field, id: 'mandatory-title', isMandatory: true, required: true };
                }
            }

            // Fix Description
            if ((field.label.toLowerCase().includes('descripción') || field.label.toLowerCase().includes('description')) && field.type === 'textarea') {
                if (field.id !== 'mandatory-desc') {
                    console.log(`Fixing Description ID for template ${t.name}: ${field.id} -> mandatory-desc`);
                    updated = true;
                    return { ...field, id: 'mandatory-desc', isMandatory: true, required: true };
                }
            }

            // Fix Budget
            if ((field.label.toLowerCase().includes('presupuesto') || field.label.toLowerCase().includes('budget')) && field.type === 'number') {
                if (field.id !== 'mandatory-budget') {
                    console.log(`Fixing Budget ID for template ${t.name}: ${field.id} -> mandatory-budget`);
                    updated = true;
                    return { ...field, id: 'mandatory-budget', isMandatory: true, required: true };
                }
            }

            return field;
        });

        if (updated) {
            await prisma.requirementTemplate.update({
                where: { id: t.id },
                data: { structure: newStructure }
            });
            console.log(`Updated template: ${t.name}`);
        }
    }

    console.log("Audit complete.");
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
