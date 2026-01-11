const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createAdminProfile() {
    try {
        const adminUser = await prisma.user.findUnique({
            where: { email: 'admin@aimarketplace.com' }
        });

        if (!adminUser) {
            console.log('Admin user not found');
            return;
        }

        console.log('Admin User ID:', adminUser.id);

        const existingAdmin = await prisma.adminProfile.findUnique({
            where: { userId: adminUser.id }
        });

        if (existingAdmin) {
            console.log('✅ Admin profile already exists');
        } else {
            await prisma.adminProfile.create({
                data: {
                    userId: adminUser.id,
                    displayName: 'Admin User'
                }
            });
            console.log('✅ Admin profile created successfully!');
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createAdminProfile();
