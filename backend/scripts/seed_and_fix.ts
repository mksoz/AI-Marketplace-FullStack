
import { PrismaClient, UserRole, ProjectStatus, MilestoneStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting Seed & Fix...');

    const passwordHash = await bcrypt.hash('password123', 10);

    // 1. Fix Users
    const users = [
        { email: 'client@example.com', role: UserRole.CLIENT },
        { email: 'vendor1@example.com', role: UserRole.VENDOR },
        { email: 'vendor2@example.com', role: UserRole.VENDOR }
    ];

    for (const u of users) {
        const user = await prisma.user.upsert({
            where: { email: u.email },
            update: { password: passwordHash, role: u.role },
            create: {
                email: u.email,
                password: passwordHash,
                role: u.role,
                clientProfile: u.role === UserRole.CLIENT ? {
                    create: {
                        companyName: "TechCorp Global",
                        industry: "Software",
                        website: "https://techcorp.example.com"
                    }
                } : undefined,
                vendorProfile: u.role === UserRole.VENDOR ? {
                    create: {
                        companyName: u.email === 'vendor1@example.com' ? "QuantumLeap AI" : "Innovate Solutions",
                        bio: "Specialized in AI and ML.",
                        skills: ["Python", "React", "TensorFlow"],
                        hourlyRate: 150
                    }
                } : undefined
            }
        });
        console.log(`Updated/Created User: ${user.email}`);
    }

    // 2. Create Active Project (Client <-> Vendor1)
    const client = await prisma.user.findUnique({
        where: { email: 'client@example.com' },
        include: { clientProfile: true }
    });
    const vendor1 = await prisma.user.findUnique({
        where: { email: 'vendor1@example.com' },
        include: { vendorProfile: true }
    });

    if (client && client.clientProfile && vendor1 && vendor1.vendorProfile) {
        console.log('Creating Active Project...');
        const project = await prisma.project.create({
            data: {
                title: "Motor de Recomendación con IA",
                description: "Desarrollo de un sistema de recomendación avanzado para e-commerce.",
                status: ProjectStatus.IN_PROGRESS,
                budget: 15000,
                startDate: new Date(),
                endDate: new Date(new Date().setDate(new Date().getDate() + 90)),
                clientId: client.clientProfile.id,      // Use Profile ID
                vendorId: vendor1.vendorProfile.id,      // Use Profile ID
                milestones: {
                    create: [
                        { title: "Fase 1: Diseño", description: "Arquitectura y Wireframes", amount: 5000, status: MilestoneStatus.COMPLETED, isPaid: true, dueDate: new Date() },
                        { title: "Fase 2: MVP", description: "Desarrollo del núcleo", amount: 5000, status: MilestoneStatus.IN_PROGRESS, isPaid: false, dueDate: new Date(new Date().setDate(new Date().getDate() + 30)) },
                        { title: "Fase 3: Producción", description: "Despliegue y pruebas", amount: 5000, status: MilestoneStatus.PENDING, isPaid: false, dueDate: new Date(new Date().setDate(new Date().getDate() + 60)) }
                    ]
                },
                folders: {
                    create: [
                        { name: "Documentación Legal" }, // parentId is optional
                        { name: "Diseños UI/UX" },
                        { name: "Entregables" }
                    ]
                },
                repoName: "techcorp/recommendation-engine",
                repoUrl: "https://github.com/techcorp/recommendation-engine"
            }
        });
        console.log(`Created Project: ${project.title}`);

        await prisma.incident.create({
            data: {
                title: "Retraso en entrega de API",
                description: "La documentación de la API se retrasó 2 días.",
                priority: "LOW",
                status: "OPEN",
                projectId: project.id,
                reporterId: client.id // Reporter IS User
            }
        });
    }

    // 3. Create Completed Project (Client <-> Vendor2)
    const vendor2 = await prisma.user.findUnique({
        where: { email: 'vendor2@example.com' },
        include: { vendorProfile: true }
    });

    if (client && client.clientProfile && vendor2 && vendor2.vendorProfile) {
        console.log('Creating Completed Project...');
        await prisma.project.create({
            data: {
                title: "Chatbot de Soporte Legacy",
                description: "Chatbot básico para soporte al cliente v1.",
                status: ProjectStatus.COMPLETED,
                budget: 5000,
                startDate: new Date(new Date().setMonth(new Date().getMonth() - 6)),
                endDate: new Date(new Date().setMonth(new Date().getMonth() - 3)),
                clientId: client.clientProfile.id,
                vendorId: vendor2.vendorProfile.id,
                milestones: {
                    create: [
                        { title: "Entrega Final", description: "Código y documentación", amount: 5000, status: MilestoneStatus.COMPLETED, isPaid: true, dueDate: new Date() }
                    ]
                }
            }
        });
    }

    // 4. Create Proposal (Vendor2 -> Client)
    if (client && client.clientProfile && vendor2 && vendor2.vendorProfile) {
        console.log('Creating Proposal...');

        const openProject = await prisma.project.create({
            data: {
                title: "Aplicación Móvil eCommerce",
                description: "Necesitamos una app móvil para nuestra tienda online existente.",
                status: ProjectStatus.OPEN,
                budget: 8000,
                startDate: new Date(),
                clientId: client.clientProfile.id
                // No vendorId yet, waiting for proposals
            }
        });

        await prisma.proposal.create({
            data: {
                projectId: openProject.id,
                vendorId: vendor2.vendorProfile.id,
                price: 7500,
                coverLetter: "Hola, tenemos experiencia extensa en apps de eCommerce. Adjunto portafolio.",
                status: "PENDING"
            }
        });
    }

    console.log('Done!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
