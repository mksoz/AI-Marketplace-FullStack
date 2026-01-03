import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function testLogin() {
    try {
        // Get user from database
        const user = await prisma.user.findUnique({
            where: { email: 'client@example.com' }
        });

        if (!user) {
            console.log('❌ User not found');
            return;
        }

        console.log('✅ User found:', user.email);
        console.log('Password hash in DB:', user.password);

        // Test password
        const testPassword = 'password123';
        const isValid = await bcrypt.compare(testPassword, user.password);

        if (isValid) {
            console.log('✅ Password "password123" is VALID');
        } else {
            console.log('❌ Password "password123" is INVALID');

            // Try to create correct hash
            const correctHash = await bcrypt.hash('password123', 10);
            console.log('\n🔧 Fixing password...');

            await prisma.user.update({
                where: { id: user.id },
                data: { password: correctHash }
            });

            console.log('✅ Password updated successfully');
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testLogin();
