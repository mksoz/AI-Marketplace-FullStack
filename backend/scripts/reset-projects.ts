import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetProjects() {
    console.log('🗑️  Starting database cleanup...\n');

    try {
        // Delete in order to respect foreign key constraints
        console.log('Deleting messages...');
        await prisma.message.deleteMany({});

        console.log('Deleting conversations...');
        await prisma.conversation.deleteMany({});

        console.log('Deleting contract versions...');
        await prisma.contractVersion.deleteMany({});

        console.log('Deleting contracts...');
        await prisma.contract.deleteMany({});

        console.log('Deleting reviews...');
        await prisma.review.deleteMany({});

        console.log('Deleting incidents...');
        await prisma.incident.deleteMany({});

        console.log('Deleting project files...');
        await prisma.projectFile.deleteMany({});

        console.log('Deleting project folders...');
        await prisma.projectFolder.deleteMany({});

        console.log('Deleting milestones...');
        await prisma.milestone.deleteMany({});

        console.log('Deleting proposals...');
        await prisma.proposal.deleteMany({});

        console.log('Deleting projects...');
        await prisma.project.deleteMany({});

        console.log('✅ Cleanup complete!\n');

        // Now seed test proposals
        console.log('🌱 Seeding test proposals...\n');

        // Get client user
        const clientUser = await prisma.user.findFirst({
            where: { role: 'CLIENT' },
            include: { clientProfile: true }
        });

        if (!clientUser || !clientUser.clientProfile) {
            console.error('❌ No client found in database');
            return;
        }

        console.log(`📧 Client found: ${clientUser.email}`);

        // Get all vendors
        const vendors = await prisma.vendorProfile.findMany({
            include: { user: true }
        });

        if (vendors.length === 0) {
            console.error('❌ No vendors found in database');
            return;
        }

        console.log(`👥 Found ${vendors.length} vendors\n`);

        // Create a proposal for each vendor
        const proposalTemplates = [
            {
                title: 'Desarrollo de E-commerce con React',
                description: 'Necesito una tienda online completa con carrito de compras, pasarela de pagos y panel de administración.',
                budget: 15000
            },
            {
                title: 'App Móvil de Delivery',
                description: 'Aplicación móvil para iOS y Android que permita ordenar comida de restaurantes locales.',
                budget: 25000
            },
            {
                title: 'Sistema de Gestión Empresarial (ERP)',
                description: 'Sistema web para gestionar inventario, ventas, compras y contabilidad.',
                budget: 35000
            },
            {
                title: 'Plataforma de Cursos Online',
                description: 'Portal educativo con sistema de pagos, certificados y seguimiento de progreso.',
                budget: 20000
            },
            {
                title: 'Dashboard Analytics en Tiempo Real',
                description: 'Panel de visualización de datos con gráficos interactivos y reportes personalizados.',
                budget: 12000
            }
        ];

        for (let i = 0; i < vendors.length; i++) {
            const vendor = vendors[i];
            const template = proposalTemplates[i % proposalTemplates.length];

            const project = await prisma.project.create({
                data: {
                    title: template.title,
                    description: template.description,
                    budget: template.budget,
                    clientId: clientUser.clientProfile.id,
                    vendorId: vendor.id,
                    status: 'PROPOSED',
                    templateData: {
                        templateName: 'Solicitud de Proyecto',
                        templateDesc: 'Solicitud general de proyecto de desarrollo',
                        structure: [
                            {
                                id: 'desc',
                                type: 'textarea',
                                label: 'Mandatory-Desc',
                                required: true,
                                placeholder: 'Describe tu proyecto...'
                            },
                            {
                                id: 'title',
                                type: 'text',
                                label: 'Mandatory-Title',
                                required: true,
                                placeholder: 'Título del proyecto'
                            },
                            {
                                id: 'budget',
                                type: 'number',
                                label: 'Mandatory-Budget',
                                required: true,
                                placeholder: 'Presupuesto estimado'
                            }
                        ],
                        answers: {
                            desc: template.description,
                            title: template.title,
                            budget: template.budget.toString()
                        }
                    }
                }
            });

            console.log(`✅ Created proposal for ${vendor.companyName}: "${project.title}"`);
        }

        console.log('\n🎉 Database reset and seeding complete!');
        console.log(`📊 Created ${vendors.length} test proposals`);

    } catch (error) {
        console.error('❌ Error during reset:', error);
    } finally {
        await prisma.$disconnect();
    }
}

resetProjects();
