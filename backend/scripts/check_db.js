const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.count();
    const vendors = await prisma.vendorProfile.count();
    const clients = await prisma.clientProfile.count();
    const rawVendors = await prisma.vendorProfile.findMany();
    console.log({ users, vendors, clients });
    console.log('Vendors:', JSON.stringify(rawVendors, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
