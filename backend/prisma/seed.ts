import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Clean up existing users and related data to avoid foreign key errors
    // 1. Delete Templates related to vendors we are about to delete
    await prisma.requirementTemplate.deleteMany({
        where: {
            vendor: {
                user: {
                    email: { in: ['vendor1@example.com', 'vendor2@example.com'] }
                }
            }
        }
    });

    // 2. Delete Projects/Proposals related to these users
    await prisma.project.deleteMany({
        where: {
            OR: [
                { client: { user: { email: { in: ['client@example.com'] } } } },
                { vendor: { user: { email: { in: ['vendor1@example.com', 'vendor2@example.com'] } } } }
            ]
        }
    });

    // 3. Delete Profiles
    await prisma.vendorProfile.deleteMany({
        where: { user: { email: { in: ['vendor1@example.com', 'vendor2@example.com'] } } }
    });
    await prisma.clientProfile.deleteMany({
        where: { user: { email: 'client@example.com' } }
    });

    // 4. Delete Users
    await prisma.user.deleteMany({
        where: {
            email: {
                in: ['client@example.com', 'vendor1@example.com', 'vendor2@example.com']
            }
        }
    });

    console.log("Deleted existing mock users and related data.");

    // 1. Create a Client
    const clientUser = await prisma.user.upsert({
        where: { email: 'client@example.com' },
        update: { password: hashedPassword },
        create: {
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
    });

    console.log({ clientUser });

    // 2. Create Vendor 1
    const vendor1 = await prisma.user.upsert({
        where: { email: 'vendor1@example.com' },
        update: { password: hashedPassword },
        create: {
            email: 'vendor1@example.com',
            password: hashedPassword,
            role: UserRole.VENDOR,
            vendorProfile: {
                create: {
                    companyName: 'AI Solutions Ltd',
                    bio: 'We specialize in NLP and LLM integration for enterprise.',
                    hourlyRate: 150.0,
                    skills: ['Python', 'LangChain', 'NLP', 'React'],
                    templates: {
                        create: [
                            {
                                name: 'Custom Chatbot Development',
                                description: 'Build a custom LLM-powered chatbot for your business.',
                                status: 'PUBLISHED',
                                structure: [
                                    { id: '1', type: 'text', label: 'Primary Goal', required: true, helperText: 'e.g. Customer Support, Internal Knowledge Base' },
                                    { id: '2', type: 'select', label: 'Preferred Model', options: ['GPT-4', 'Claude 3', 'Open Source (Llama 3)'], required: true },
                                    { id: '3', type: 'number', label: 'Estimated Monthly Users', required: false, validation: { min: 0 } }
                                ]
                            },
                            {
                                name: 'AI Integration Audit',
                                description: 'Analyze your existing systems for AI compatibility.',
                                status: 'PUBLISHED',
                                structure: [
                                    { id: '1', type: 'textarea', label: 'Current Tech Stack', required: true },
                                    { id: '2', type: 'date', label: 'Desired Start Date', required: true }
                                ]
                            }
                        ]
                    }
                },
            },
        },
    });

    console.log({ vendor1 });

    // 3. Create Vendor 2
    const vendor2 = await prisma.user.upsert({
        where: { email: 'vendor2@example.com' },
        update: { password: hashedPassword },
        create: {
            email: 'vendor2@example.com',
            password: hashedPassword,
            role: UserRole.VENDOR,
            vendorProfile: {
                create: {
                    companyName: 'Visionary AI',
                    bio: 'Computer Vision experts for retail and security.',
                    hourlyRate: 200.0,
                    skills: ['PyTorch', 'OpenCV', 'Computer Vision', 'Edge AI'],
                    templates: {
                        create: [
                            {
                                name: 'Retail Analytics Setup',
                                description: 'Request a setup for in-store customer tracking.',
                                status: 'PUBLISHED',
                                structure: [
                                    { id: '1', type: 'text', label: 'Store Location', required: true },
                                    { id: '2', type: 'number', label: 'Number of Cameras', required: true }
                                ]
                            }
                        ]
                    }
                },
            },
        },
    });

    console.log({ vendor2 });
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
