/**
 * Script to fix notification URLs in the existing database
 * Run with: ts-node fix-notification-urls.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixNotificationUrls() {
    console.log('🔧 Starting notification URL fix...\n');

    try {
        // 1. Fix Proposal notifications
        const proposals = await prisma.$executeRaw`
            UPDATE "Notification"
            SET "actionUrl" = REGEXP_REPLACE("actionUrl", '/vendor/proposals/[^/]+$', '/vendor/proposals')
            WHERE "type" IN ('PROPOSAL_RECEIVED', 'PROPOSAL_ACCEPTED', 'PROPOSAL_REJECTED')
              AND "actionUrl" ~ '/vendor/proposals/';
        `;
        console.log(`✅ Fixed ${proposals} proposal notifications`);

        // 2. Fix Contract notifications (remove /contract suffix)
        const contracts = await prisma.$executeRaw`
            UPDATE "Notification"
            SET "actionUrl" = REGEXP_REPLACE("actionUrl", '/contract$', '')
            WHERE "type" IN ('CONTRACT_GENERATED', 'CONTRACT_SIGNED', 'CONTRACT_REMINDER')
              AND "actionUrl" ~ '/contract$';
        `;
        console.log(`✅ Fixed ${contracts} contract notifications`);

        // 3. Fix Milestone notifications (remove /milestones suffix)
        const milestones = await prisma.$executeRaw`
            UPDATE "Notification"
            SET "actionUrl" = REGEXP_REPLACE("actionUrl", '/milestones$', '')
            WHERE "type" IN ('MILESTONE_COMPLETED', 'MILESTONE_APPROVED', 'MILESTONE_REJECTED')
              AND "actionUrl" ~ '/milestones$';
        `;
        console.log(`✅ Fixed ${milestones} milestone notifications`);

        // 4. Fix Payment notifications (remove /payments suffix)
        const payments = await prisma.$executeRaw`
            UPDATE "Notification"
            SET "actionUrl" = REGEXP_REPLACE("actionUrl", '/payments$', '')
            WHERE "type" IN ('PAYMENT_REQUESTED', 'PAYMENT_APPROVED', 'PAYMENT_REJECTED', 'PAYMENT_COMPLETED')
              AND "actionUrl" ~ '/payments$';
        `;
        console.log(`✅ Fixed ${payments} payment notifications`);

        // 5. Fix File/Folder notifications (remove /files suffix)
        const files = await prisma.$executeRaw`
            UPDATE "Notification"
            SET "actionUrl" = REGEXP_REPLACE("actionUrl", '/files$', '')
            WHERE "type" IN ('FILE_UPLOADED', 'FOLDER_CREATED', 'FOLDER_ACCESS')
              AND "actionUrl" ~ '/files$';
        `;
        console.log(`✅ Fixed ${files} file/folder notifications`);

        // 6. Fix Message notifications (remove conversation ID)
        const messages = await prisma.$executeRaw`
            UPDATE "Notification"
            SET "actionUrl" = REGEXP_REPLACE("actionUrl", '/messages/[^/]+$', '/messages')
            WHERE "type" = 'MESSAGE_RECEIVED'
              AND "actionUrl" ~ '/messages/';
        `;
        console.log(`✅ Fixed ${messages} message notifications`);

        // 7. Fix Incident notifications (remove incidents sub-route)
        const incidents = await prisma.$executeRaw`
            UPDATE "Notification"
            SET "actionUrl" = REGEXP_REPLACE("actionUrl", '/incidents/[^/]+$', '')
            WHERE "type" IN ('INCIDENT_CREATED', 'INCIDENT_RESOLVED')
              AND "actionUrl" ~ '/incidents/';
        `;
        console.log(`✅ Fixed ${incidents} incident notifications`);

        // 8. Fix GitHub notifications (remove /github suffix)
        const github = await prisma.$executeRaw`
            UPDATE "Notification"
            SET "actionUrl" = REGEXP_REPLACE("actionUrl", '/github$', '')
            WHERE "type" = 'GITHUB_COMMIT'
              AND "actionUrl" ~ '/github$';
        `;
        console.log(`✅ Fixed ${github} GitHub notifications`);

        // 9. Fix Deliverable notifications (legacy - remove /deliverables suffix)
        const deliverables = await prisma.$executeRaw`
            UPDATE "Notification"
            SET "actionUrl" = REGEXP_REPLACE("actionUrl", '/deliverables$', '')
            WHERE "type" IN ('DELIVERABLE_UPLOADED', 'DELIVERABLE_APPROVED')
              AND "actionUrl" ~ '/deliverables$';
        `;
        console.log(`✅ Fixed ${deliverables} deliverable notifications`);

        const total = Number(proposals) + Number(contracts) + Number(milestones) +
            Number(payments) + Number(files) + Number(messages) +
            Number(incidents) + Number(github) + Number(deliverables);

        console.log(`\n🎉 Successfully fixed ${total} total notifications!`);

        // Verification - show sample of updated URLs
        const sample = await prisma.notification.findMany({
            where: {
                createdAt: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
                }
            },
            select: {
                type: true,
                actionUrl: true
            },
            take: 20
        });

        console.log('\n📋 Sample of updated notifications:');
        const grouped = sample.reduce((acc: any, n) => {
            if (!acc[n.type]) acc[n.type] = [];
            acc[n.type].push(n.actionUrl);
            return acc;
        }, {});

        Object.entries(grouped).forEach(([type, urls]: [string, any]) => {
            console.log(`  ${type}: ${[...new Set(urls)].join(', ')}`);
        });

    } catch (error) {
        console.error('❌ Error fixing notifications:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

fixNotificationUrls()
    .then(() => {
        console.log('\n✨ Done!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
