
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearChatData() {
    console.log('Starting chat data cleanup...');
    try {
        // Delete all messages first (foreign key constraint)
        const deletedMessages = await prisma.message.deleteMany({});
        console.log(`Deleted ${deletedMessages.count} messages.`);

        // Delete all conversations
        const deletedConversations = await prisma.conversation.deleteMany({});
        console.log(`Deleted ${deletedConversations.count} conversations.`);

        console.log('Chat data cleanup completed successfully.');
    } catch (error) {
        console.error('Error clearing chat data:', error);
    } finally {
        await prisma.$disconnect();
    }
}

clearChatData();
