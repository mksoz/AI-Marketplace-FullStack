import { UserRole, AdminPermission } from '@prisma/client';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';

export const ensureAdminExists = async () => {
    try {
        console.log('🔒 Verifying Admin Access...');
        const email = 'admin@aimarketplace.com';
        const password = 'admin123'; // Default password

        // Check if user exists
        let user = await prisma.user.findUnique({
            where: { email },
            include: { adminProfile: true }
        });

        if (!user) {
            console.log('⚠️ Admin user not found. Creating...');
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create user first
            user = await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    role: UserRole.ADMIN,
                },
                include: { adminProfile: true }
            });
            console.log('✅ Admin user created.');
        }

        // At this point user is definitely defined, but TS might complain if we reassign it conditionally above.
        // Let's refetch or assert.
        if (!user) throw new Error("Failed to retrieve or create admin user");

        // Check if profile exists
        if (!user.adminProfile) {
            console.log('⚠️ Admin profile missing. Creating...');
            await prisma.adminProfile.create({
                data: {
                    userId: user.id,
                    displayName: 'System Admin',
                    permissions: Object.values(AdminPermission) // Grant ALL permissions
                }
            });
            console.log('✅ Admin profile created with ALL permissions.');
        } else {
            // Ensure permissions are up to date
            const currentPermissions = user.adminProfile.permissions;
            const allPermissions = Object.values(AdminPermission);

            if (currentPermissions.length !== allPermissions.length) {
                console.log('Updating Admin permissions...');
                await prisma.adminProfile.update({
                    where: { id: user.adminProfile.id },
                    data: { permissions: allPermissions }
                });
                console.log('✅ Admin permissions updated.');
            }
        }

        console.log('🔒 Admin Access Verified: OK');

    } catch (error) {
        console.error('❌ Error ensuring admin exists:', error);
    }
};
