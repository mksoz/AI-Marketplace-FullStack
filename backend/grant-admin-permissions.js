const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function grantAllPermissions() {
    try {
        const adminUser = await prisma.user.findUnique({
            where: { email: 'admin@aimarketplace.com' },
            include: { adminProfile: true }
        });

        if (!adminUser || !adminUser.adminProfile) {
            console.log('❌ Admin profile not found');
            return;
        }

        console.log('Admin Profile ID:', adminUser.adminProfile.id);

        // Grant all permissions
        const allPermissions = [
            'SUPER_ADMIN',
            'USER_MANAGEMENT',
            'PROJECT_OVERSIGHT',
            'DISPUTE_RESOLUTION',
            'PLATFORM_CONFIG',
            'METRICS_VIEW',
            'REPORT_GENERATE'
        ];

        await prisma.adminProfile.update({
            where: { id: adminUser.adminProfile.id },
            data: { permissions: allPermissions }
        });

        console.log('✅ All permissions granted to admin!');
        console.log('Permissions:', allPermissions.join(', '));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

grantAllPermissions();
