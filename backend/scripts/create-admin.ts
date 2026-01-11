import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createAdminUser() {
    try {
        console.log('Creating admin user...');

        // Check if admin already exists
        const existingAdmin = await prisma.user.findUnique({
            where: { email: 'admin@aimarketplace.com' }
        });

        if (existingAdmin) {
            console.log('✅ Admin user already exists:', existingAdmin.email);

            // Check if admin profile exists
            const adminProfile = await prisma.adminProfile.findUnique({
                where: { userId: existingAdmin.id }
            });

            if (!adminProfile) {
                // Create admin profile
                await prisma.adminProfile.create({
                    data: {
                        userId: existingAdmin.id,
                        displayName: 'Super Admin',
                        permissions: ['SUPER_ADMIN']
                    }
                });
                console.log('✅ Created admin profile for existing user');
            } else {
                console.log('✅ Admin profile already exists');
            }

            return existingAdmin;
        }

        // Hash password: admin123
        const hashedPassword = await bcrypt.hash('admin123', 10);

        // Create admin user
        const adminUser = await prisma.user.create({
            data: {
                email: 'admin@aimarketplace.com',
                password: hashedPassword,
                role: 'ADMIN'
            }
        });

        // Create admin profile with SUPER_ADMIN permissions
        await prisma.adminProfile.create({
            data: {
                userId: adminUser.id,
                displayName: 'Super Admin',
                permissions: ['SUPER_ADMIN']
            }
        });

        console.log('\n✅ Admin user created successfully!');
        console.log('📧 Email: admin@aimarketplace.com');
        console.log('🔑 Password: admin123');
        console.log('\n⚠️  IMPORTANT: Change this password in production!');

        return adminUser;
    } catch (error) {
        console.error('❌ Error creating admin user:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

createAdminUser();
