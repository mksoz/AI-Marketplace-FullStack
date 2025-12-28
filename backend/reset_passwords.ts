
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

async function resetPasswords() {
    try {
        const hashedPassword = await bcrypt.hash('password123', SALT_ROUNDS);
        console.log("Resetting passwords for all users to 'password123'...");

        const emails = ['client@example.com', 'vendor1@example.com', 'admin@example.com'];

        for (const email of emails) {
            const user = await prisma.user.findUnique({ where: { email } });
            if (user) {
                await prisma.user.update({
                    where: { email },
                    data: { password: hashedPassword }
                });
                console.log(`Updated password for ${email}`);
            } else {
                console.warn(`User ${email} not found.`);
            }
        }
    } catch (e) {
        console.error("Error resetting passwords", e);
    } finally {
        await prisma.$disconnect();
    }
}

resetPasswords();
