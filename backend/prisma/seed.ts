import { PrismaClient, UserRole, ProjectStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const industries = ['Fintech', 'HealthTech', 'E-commerce', 'EduTech', 'AgriTech', 'Logistics', 'Real Estate', 'Gaming', 'Cybersecurity', 'Marketing'];
const techs = ['React', 'Node.js', 'Python', 'AI/ML', 'Blockchain', 'IoT', 'Cloud', 'Mobile', 'DevOps', 'Data Science'];

async function main() {
    const hashedPassword = await bcrypt.hash('password123', 10);

    console.log("Cleaning up database...");

    const testEmailsDomain = '@example.com';

    const usersToDelete = await prisma.user.findMany({
        where: { email: { contains: testEmailsDomain } }
    });
    const userIds = usersToDelete.map(u => u.id);

    // --- CLEANUP ORDERED BY DEPENDENCY ---

    // 1. User-dependent & Independent Systems
    await prisma.notification.deleteMany({});
    await prisma.message.deleteMany({});

    // 2. Conversation (Depends on Project, used by Messages)
    await prisma.conversation.deleteMany({});

    // 3. Project Sub-resources
    await prisma.milestone.deleteMany({
        where: {
            project: {
                OR: [
                    { client: { user: { email: { contains: testEmailsDomain } } } },
                    { vendor: { user: { email: { contains: testEmailsDomain } } } }
                ]
            }
        }
    });

    await prisma.contractVersion.deleteMany({});
    await prisma.contract.deleteMany({});

    await prisma.incident.deleteMany({ where: { reporter: { email: { contains: testEmailsDomain } } } });
    await prisma.projectFile.deleteMany({ where: { project: { client: { user: { email: { contains: testEmailsDomain } } } } } });
    await prisma.projectFolder.deleteMany({});
    await prisma.review.deleteMany({});

    // 4. Proposals (Depends on Project and Vendor)
    await prisma.proposal.deleteMany({
        where: {
            vendor: { user: { email: { contains: testEmailsDomain } } }
        }
    });

    // 5. Projects (Depends on Client and Vendor)
    // Delete projects where client OR vendor is our test user
    // Note: If a real user has a project with a test vendor, this might fail if we don't catch it, but here we assume isolation or full cleanup
    await prisma.project.deleteMany({
        where: {
            OR: [
                { client: { user: { email: { contains: testEmailsDomain } } } },
                { vendor: { user: { email: { contains: testEmailsDomain } } } }
            ]
        }
    });

    // 6. Vendor/Client Specifics
    await prisma.requirementTemplate.deleteMany({ where: { vendor: { user: { email: { contains: testEmailsDomain } } } } });
    await prisma.vendorProfile.deleteMany({ where: { user: { email: { contains: testEmailsDomain } } } });
    await prisma.clientProfile.deleteMany({ where: { user: { email: { contains: testEmailsDomain } } } });

    // 7. Users
    await prisma.user.deleteMany({ where: { email: { contains: testEmailsDomain } } });

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

    console.log("Created Client: client@example.com");

    // 2. Create 10 Vendors and 1 Project/Proposal for each
    const vendors = [];
    for (let i = 1; i <= 10; i++) {
        const industry = industries[i % industries.length];
        const tech = techs[i % techs.length];
        const companyName = `Vendor ${i} - ${tech} Solutions`;

        const vendorUser = await prisma.user.create({
            data: {
                email: `vendor${i}@example.com`,
                password: hashedPassword,
                role: UserRole.VENDOR,
                vendorProfile: {
                    create: {
                        companyName: companyName,
                        bio: `Experts in ${industry} providing top-tier ${tech} development and consulting services.`,
                        hourlyRate: 100.0 + (i * 10),
                        skills: [tech, 'JavaScript', 'Consulting'],
                        templates: {
                            create: [
                                {
                                    name: `${tech} Project Starter`,
                                    description: `Standard template for ${tech} based applications.`,
                                    status: 'PUBLISHED',
                                    structure: [
                                        { id: 'mandatory-title', type: 'text', label: 'Título del Proyecto', isMandatory: true, required: true, helperText: 'Asigna un nombre claro a tu proyecto.' },
                                        { id: 'mandatory-desc', type: 'textarea', label: 'Descripción Detallada', isMandatory: true, required: true, helperText: 'Describe los objetivos y alcance del trabajo.' },
                                        { id: 'mandatory-budget', type: 'number', label: 'Presupuesto Estimado', isMandatory: true, required: true, helperText: 'Define si el cliente debe introducir un valor exacto o un rango estimado.' },
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

        // Create a Project (Proposal) for this Vendor -> Client
        await prisma.project.create({
            data: {
                title: `Propuesta: Sistema ${industry} con ${tech}`,
                description: `Propuesta inicial para desarrollar una solución de ${industry} utilizando ${tech}. Incluye análisis, diseño y desarrollo.`,
                budget: 5000 + (i * 1000),
                status: ProjectStatus.PROPOSED,
                clientId: clientId,
                vendorId: vendorUser.vendorProfile!.id,
                templateData: {
                    templateName: `${tech} Project Starter`,
                    answers: {
                        '1': 'Automation and efficiency',
                        '2': '2024-12-31'
                    }
                }
            }
        });

        vendors.push(vendorUser);
        console.log(`Created Vendor ${i}: vendor${i}@example.com with Project`);
    }

    console.log(`Successfully created 1 Client and ${vendors.length} Vendors with Proposals.`);
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
