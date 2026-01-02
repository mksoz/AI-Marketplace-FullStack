import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log("--- DIAGNOSTIC START ---");

    // 1. Check if client exists
    const client = await prisma.user.findUnique({
        where: { email: 'client@example.com' }
    });

    if (!client) {
        console.error("❌ Client user 'client@example.com' NOT FOUND in database.");
    } else {
        console.log("✅ Client user found:", client.email, client.role);

        // 2. Verify Password
        const isMatch = await bcrypt.compare('password123', client.password);
        if (isMatch) {
            console.log("✅ Password 'password123' validates correctly against stored hash.");
        } else {
            console.error("❌ Password 'password123' DOES NOT match stored hash.");
            console.log("Stored Hash:", client.password);

            // Generate what it should be for debug
            const newHash = await bcrypt.hash('password123', 10);
            console.log("Expected Hash format example:", newHash);
        }
    }

    // 3. Count Vendors
    const vendorCount = await prisma.user.count({
        where: { role: 'VENDOR', email: { contains: '@example.com' } }
    });
    console.log(`ℹ️  Found ${vendorCount} mock vendors in database.`);

    console.log("--- DIAGNOSTIC END ---");
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
