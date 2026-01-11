
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import notificationService from '../services/notification.service';

const prisma = new PrismaClient();

// Get all Conversations for current user
export const getMyConversations = async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) return res.status(403).json({ message: "Unauthorized" });

    try {
        const conversations = await prisma.conversation.findMany({
            where: {
                participants: {
                    some: { id: user.userId }
                },
                NOT: {
                    deletedBy: { has: user.userId }
                }
            },
            include: {
                project: {
                    select: {
                        id: true,
                        title: true,
                    }
                },
                participants: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                        vendorProfile: {
                            select: { companyName: true }
                        },
                        clientProfile: {
                            select: { companyName: true }
                        }
                    }
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        // Format for frontend
        const formatted = conversations.map(conv => {
            const otherParticipant = conv.participants.find(p => p.id !== user.userId);
            let counterpartyName = 'Usuario';

            if (otherParticipant) {
                if (otherParticipant.role === 'VENDOR') {
                    counterpartyName = otherParticipant.vendorProfile?.companyName || otherParticipant.email;
                } else if (otherParticipant.role === 'CLIENT') {
                    counterpartyName = otherParticipant.clientProfile?.companyName || otherParticipant.email;
                } else {
                    counterpartyName = otherParticipant.email;
                }
            }

            return {
                id: conv.id,
                projectId: conv.projectId,
                projectTitle: conv.project?.title || 'Sin Título',
                counterpartyName: counterpartyName || 'Usuario Desconocido',
                lastMessage: conv.messages[0]?.content || 'Sin mensajes',
                updatedAt: conv.updatedAt,
                isArchived: conv.archivedBy.includes(user.userId),
                unread: 0 // Mock for now
            };
        });

        res.json(formatted);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching conversations" });
    }
};

// Get (or create) Chat for a Project
export const getProjectChat = async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const user = req.user;

    if (!user) return res.status(403).json({ message: "Unauthorized" });

    try {
        let conversation = await prisma.conversation.findUnique({
            where: { projectId },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' },
                    include: { sender: { select: { id: true, email: true, role: true } } }
                }
            }
        });

        if (!conversation) {
            // Lazy create if not exists (should be created on Contacted status, but safeguard)
            conversation = await prisma.conversation.create({
                data: {
                    projectId,
                    participants: {
                        connect: [{ id: user.userId }] // Connect current user at least
                    }
                },
                include: {
                    messages: { include: { sender: true } }
                }
            });
        }

        res.json(conversation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching chat" });
    }
};

// Send Message
export const sendMessage = async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const { content } = req.body;
    const user = req.user;

    if (!user) return res.status(403).json({ message: "Unauthorized" });

    try {
        const conversation = await prisma.conversation.findUnique({ where: { projectId } });
        if (!conversation) return res.status(404).json({ message: "Chat not found" });

        const message = await prisma.message.create({
            data: {
                conversationId: conversation.id,
                senderId: user.userId,
                content
            },
            include: { sender: { select: { id: true, email: true, role: true } } }
        });

        // Notify other participants
        try {
            const convo = await prisma.conversation.findUnique({
                where: { id: conversation.id },
                include: {
                    participants: true,
                    project: true
                }
            });

            if (convo) {
                const sender = await prisma.user.findUnique({
                    where: { id: user.userId },
                    include: { vendorProfile: true, clientProfile: true }
                });
                const senderName = sender?.vendorProfile?.companyName || sender?.clientProfile?.companyName || sender?.email || 'Usuario';

                for (const participant of convo.participants) {
                    if (participant.id !== user.userId) {
                        await notificationService.notifyMessageReceived(
                            participant.id,
                            {
                                messageId: message.id,
                                conversationId: conversation.id,
                                senderId: user.userId,
                                senderName,
                                recipientRole: participant.role.toLowerCase(),
                                preview: content.substring(0, 100)
                            }
                        );
                    }
                }
            }
        } catch (notifError) {
            console.error('Failed to send notification:', notifError);
        }

        res.json(message);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error sending message" });
    }
};

// Archive Conversation
export const archiveConversation = async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = req.user;
    if (!user) return res.status(403).json({ message: "Unauthorized" });

    try {
        const conversation = await prisma.conversation.findUnique({ where: { id } });
        if (!conversation) return res.status(404).json({ message: "Chat not found" });

        const isArchived = conversation.archivedBy.includes(user.userId);
        let newArchivedBy = [...conversation.archivedBy];

        if (isArchived) {
            newArchivedBy = newArchivedBy.filter(uid => uid !== user.userId);
        } else {
            newArchivedBy.push(user.userId);
        }

        await prisma.conversation.update({
            where: { id },
            data: { archivedBy: newArchivedBy }
        });

        res.json({ message: isArchived ? "Unarchived" : "Archived" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error archiving chat" });
    }
};

// Delete Conversation (for current user)
export const deleteConversation = async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = req.user;
    if (!user) return res.status(403).json({ message: "Unauthorized" });

    try {
        const conversation = await prisma.conversation.findUnique({ where: { id } });
        if (!conversation) return res.status(404).json({ message: "Chat not found" });

        if (!conversation.deletedBy.includes(user.userId)) {
            await prisma.conversation.update({
                where: { id },
                data: {
                    deletedBy: {
                        push: user.userId
                    }
                }
            });
        }

        res.json({ message: "Deleted" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting chat" });
    }
};

// Get Unread Messages Count
export const getUnreadMessagesCount = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        // Count unread messages for the current user
        const count = await prisma.message.count({
            where: {
                conversation: {
                    participants: {
                        some: {
                            id: user.userId
                        }
                    }
                },
                senderId: {
                    not: user.userId
                },
                isRead: false
            }
        });

        res.json({ count });
    } catch (error: any) {
        console.error('Get unread messages count error:', error);
        res.status(500).json({ message: error.message });
    }
};
