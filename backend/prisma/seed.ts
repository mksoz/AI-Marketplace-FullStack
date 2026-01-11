import { PrismaClient, UserRole, ProjectStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('password123', 10);
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);

    console.log("Cleaning up database...");

    // Clean up everything
    await prisma.deliverableReview.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.message.deleteMany({});
    await prisma.conversation.deleteMany({});
    await prisma.milestone.deleteMany({});
    await prisma.contractVersion.deleteMany({});
    await prisma.contract.deleteMany({});
    await prisma.incident.deleteMany({});
    await prisma.projectFile.deleteMany({});
    await prisma.projectFolder.deleteMany({});
    await prisma.deliverableFolder.deleteMany({});
    await prisma.review.deleteMany({});
    await prisma.proposal.deleteMany({});
    await prisma.project.deleteMany({});
    await prisma.requirementTemplate.deleteMany({});
    await prisma.adminProfile.deleteMany({});
    await prisma.vendorProfile.deleteMany({});
    await prisma.clientProfile.deleteMany({});
    await prisma.user.deleteMany({});

    console.log("Cleanup complete.");

    // --- SEEDING ---

    // 1. Create Client
    const clientUser = await prisma.user.create({
        data: {
            email: 'client@example.com',
            password: hashedPassword,
            role: UserRole.CLIENT,
            clientProfile: {
                create: {
                    companyName: 'TechCorp Inc.',
                    industry: 'Fintech',
                },
            },
        },
        include: { clientProfile: true }
    });
    const clientId = clientUser.clientProfile!.id;

    console.log("✓ Created Client: client@example.com / password123");

    // 2. Create Vendor
    const vendorUser = await prisma.user.create({
        data: {
            email: 'vendor1@example.com',
            password: hashedPassword,
            role: UserRole.VENDOR,
            vendorProfile: {
                create: {
                    companyName: 'AI Solutions Pro',
                    bio: 'Experts in AI/ML providing top-tier development and consulting services.',
                    hourlyRate: 150.0,
                    skills: ['AI/ML', 'Python', 'React', 'Node.js'],
                    templates: {
                        create: [
                            {
                                name: 'AI Project Starter',
                                description: 'Standard template for AI/ML based applications.',
                                status: 'PUBLISHED',
                                structure: [
                                    { id: 'mandatory-title', type: 'text', label: 'Título del Proyecto', isMandatory: true, required: true, helperText: 'Asigna un nombre claro a tu proyecto.' },
                                    { id: 'mandatory-desc', type: 'textarea', label: 'Descripción Detallada', isMandatory: true, required: true, helperText: 'Describe los objetivos y alcance del trabajo.' },
                                    { id: 'mandatory-budget', type: 'number', label: 'Presupuesto Estimado', isMandatory: true, required: true, helperText: 'Define el presupuesto del proyecto.' },
                                    { id: '1', type: 'text', label: 'Project Goal', required: true },
                                    { id: '2', type: 'date', label: 'Deadline', required: true }
                                ]
                            }
                        ]
                    }
                },
            },
        },
        include: { vendorProfile: true }
    });

    // Create a Project for Vendor -> Client
    const project = await prisma.project.create({
        data: {
            title: 'Solicitud: Nueva Plantilla de Requisitos',
            description: 'El cliente solicita crear un proyecto de IA personalizado.',
            budget: 9000,
            status: ProjectStatus.ACCEPTED, // Already accepted and ready for vendor to configure
            clientId: clientId,
            vendorId: vendorUser.vendorProfile!.id,
            templateData: {
                templateName: 'AI Project Starter',
                answers: {
                    '1': 'Build an AI chatbot',
                    '2': '2025-02-28'
                }
            },
            milestones: {
                create: [
                    {
                        title: 'Inicio',
                        description: 'Kickoff y Planificación',
                        amount: 897,
                        status: 'IN_PROGRESS',
                        dueDate: new Date('2025-02-02'),
                        order: 1
                    },
                    {
                        title: 'Medio',
                        description: 'Desarrollo',
                        amount: 5600,
                        status: 'PENDING',
                        dueDate: new Date('2025-03-03'),
                        order: 2
                    }
                ]
            }
        }
    });

    console.log("✓ Created Vendor: vendor1@example.com / password123");
    console.log(`✓ Created Project: "${project.title}" (ID: ${project.id})`);

    // 3. Create Admin
    const adminUser = await prisma.user.create({
        data: {
            email: 'admin@aimarketplace.com',
            password: hashedAdminPassword,
            role: UserRole.ADMIN,
            adminProfile: {
                create: {
                    displayName: 'Platform Admin',
                    permissions: ['SUPER_ADMIN', 'USER_MANAGEMENT', 'PROJECT_OVERSIGHT', 'DISPUTE_RESOLUTION'],
                }
            }
        },
        include: { adminProfile: true }
    });

    console.log("✓ Created Admin: admin@aimarketplace.com / admin123");

    console.log("\n=== SEED COMPLETED ===");
    console.log("Available users:");
    console.log("  Cliente: client@example.com / password123");
    console.log("  Vendor:  vendor1@example.com / password123");
    console.log("  Admin:   admin@aimarketplace.com / admin123");
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
