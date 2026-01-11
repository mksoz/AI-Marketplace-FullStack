import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createSampleUsers() {
    try {
        console.log('Creating sample users...');

        const password = await bcrypt.hash('password123', 10);

        // Create 3 Clients
        const clients = [
            { email: 'client1@example.com', companyName: 'TechCorp Inc', city: 'Madrid', country: 'España' },
            { email: 'client2@example.com', companyName: 'DataSolutions SA', city: 'Barcelona', country: 'España' },
            { email: 'client3@example.com', companyName: 'AI Ventures Ltd', city: 'Valencia', country: 'España' }
        ];

        for (const clientData of clients) {
            const existingUser = await prisma.user.findUnique({ where: { email: clientData.email } });

            if (!existingUser) {
                const user = await prisma.user.create({
                    data: {
                        email: clientData.email,
                        password,
                        role: 'CLIENT'
                    }
                });

                await prisma.clientProfile.create({
                    data: {
                        userId: user.id,
                        companyName: clientData.companyName,
                        city: clientData.city,
                        country: clientData.country
                    }
                });

                console.log(`✅ Created client: ${clientData.email}`);
            } else {
                console.log(`⏭️  Client already exists: ${clientData.email}`);
            }
        }

        // Create 4 Vendors
        const vendors = [
            { email: 'vendor1@example.com', companyName: 'QuantumLeap AI', hourlyRate: 85, city: 'San Francisco', country: 'USA' },
            { email: 'vendor2@example.com', companyName: 'DevStudio X', hourlyRate: 75, city: 'London', country: 'UK' },
            { email: 'vendor3@example.com', companyName: 'CodeCraft Labs', hourlyRate: 65, city: 'Berlin', country: 'Germany' },
            { email: 'vendor4@example.com', companyName: 'AI Solutions Pro', hourlyRate: 95, city: 'Toronto', country: 'Canada' }
        ];

        for (const vendorData of vendors) {
            const existingUser = await prisma.user.findUnique({ where: { email: vendorData.email } });

            if (!existingUser) {
                const user = await prisma.user.create({
                    data: {
                        email: vendorData.email,
                        password,
                        role: 'VENDOR'
                    }
                });

                await prisma.vendorProfile.create({
                    data: {
                        userId: user.id,
                        companyName: vendorData.companyName,
                        hourlyRate: vendorData.hourlyRate,
                        city: vendorData.city,
                        country: vendorData.country,
                        bio: `Professional AI development services from ${vendorData.companyName}`
                    }
                });

                console.log(`✅ Created vendor: ${vendorData.email}`);
            } else {
                console.log(`⏭️  Vendor already exists: ${vendorData.email}`);
            }
        }

        console.log('\n✅ Sample users created successfully!');
        console.log('\n📝 Login credentials for all users:');
        console.log('Password: password123');

    } catch (error) {
        console.error('❌ Error creating sample users:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

createSampleUsers();
