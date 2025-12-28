import { Request, Response } from 'express';
import { PrismaClient, UserRole, ProjectStatus } from '@prisma/client';

const prisma = new PrismaClient();

// CLIENT: Create a generic project (Old flow, keeping for compatibility if needed, but updated)
export const createProject = async (req: Request, res: Response) => {
    try {
        const { title, description, budget } = req.body;
        const user = req.user;

        if (!user || user.role !== UserRole.CLIENT) {
            return res.status(403).json({ message: 'Only clients can create projects' });
        }

        const clientProfile = await prisma.clientProfile.findUnique({ where: { userId: user.userId } });

        if (!clientProfile) {
            return res.status(404).json({ message: 'Client profile not found' });
        }

        const project = await prisma.project.create({
            data: {
                title,
                description,
                budget,
                clientId: clientProfile.id,
                status: ProjectStatus.OPEN
            }
        });

        res.status(201).json(project);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating project' });
    }
};

// CLIENT: Create a Request to a specific Vendor (New Flow)
export const requestProject = async (req: Request, res: Response) => {
    try {
        const { title, description, budget, vendorId, templateData } = req.body;
        const user = req.user;

        if (!user || user.role !== UserRole.CLIENT) {
            return res.status(403).json({ message: 'Only clients can request projects' });
        }

        const clientProfile = await prisma.clientProfile.findUnique({ where: { userId: user.userId } });
        if (!clientProfile) return res.status(404).json({ message: 'Client profile not found' });

        const project = await prisma.project.create({
            data: {
                title,
                description,
                budget,
                clientId: clientProfile.id,
                vendorId: vendorId,              // Directly assigned
                templateData: templateData,      // JSON form data
                status: ProjectStatus.PROPOSED   // Initial status
            }
        });

        res.status(201).json(project);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error requesting project' });
    }
};

// CLIENT: Get My Projects
export const getMyProjects = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user || user.role !== UserRole.CLIENT) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const clientProfile = await prisma.clientProfile.findUnique({ where: { userId: user.userId } });
        if (!clientProfile) return res.status(404).json({ message: 'Profile not found' });

        const projects = await prisma.project.findMany({
            where: { clientId: clientProfile.id },
            include: {
                _count: { select: { proposals: true } },
                vendor: { select: { companyName: true } }, // Include vendor name if assigned
                contract: { select: { clientSigned: true, vendorSigned: true, status: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(projects);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching projects' });
    }
};

// VENDOR: Get Incoming Requests (Projects proposed to me)
export const getVendorRequests = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user || user.role !== UserRole.VENDOR) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const vendorProfile = await prisma.vendorProfile.findUnique({ where: { userId: user.userId } });
        if (!vendorProfile) return res.status(404).json({ message: 'Profile not found' });

        const requests = await prisma.project.findMany({
            where: {
                vendorId: vendorProfile.id,
                // We show everything that involves this vendor
                OR: [
                    { status: ProjectStatus.PROPOSED },
                    { status: ProjectStatus.CONTACTED },
                    { status: ProjectStatus.IN_NEGOTIATION },
                    { status: ProjectStatus.ACCEPTED },
                    { status: ProjectStatus.DECLINED }
                ]
            },
            include: {
                client: { select: { companyName: true, website: true, user: { select: { email: true } } } },
                contract: { select: { clientSigned: true, vendorSigned: true, status: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(requests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching requests' });
    }
};

// VENDOR: Update Request Status (Accept/Decline)
export const updateRequestStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status, rejectionReason, initialMessage } = req.body;
        const user = req.user;

        if (!user || user.role !== UserRole.VENDOR) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const vendorProfile = await prisma.vendorProfile.findUnique({ where: { userId: user.userId } });

        // Verify ownership
        const project = await prisma.project.findUnique({ where: { id } });
        if (!project || project.vendorId !== vendorProfile?.id) {
            return res.status(404).json({ message: 'Request not found or not authorized' });
        }

        // Side Effects based on NEW status
        if (status === ProjectStatus.CONTACTED || status === ProjectStatus.IN_NEGOTIATION) {
            // 1. Create Conversation if not exists
            const existingChat = await prisma.conversation.findUnique({ where: { projectId: id } });
            if (!existingChat) {
                const projectData = await prisma.project.findUnique({
                    where: { id },
                    include: { client: { select: { userId: true } } }
                });

                if (projectData?.client?.userId) {
                    const newChat = await prisma.conversation.create({
                        data: {
                            projectId: id,
                            participants: {
                                connect: [
                                    { id: user.userId },
                                    { id: projectData.client.userId }
                                ]
                            }
                        }
                    });

                    // Send initial message
                    await prisma.message.create({
                        data: {
                            conversationId: newChat.id,
                            senderId: user.userId,
                            content: initialMessage || "¡Hola! He aceptado tu solicitud de proyecto. ¿Hablamos de los detalles?",
                            isRead: false
                        }
                    });
                }
            }

            // 2. Create Draft Contract with Initial Version if not exists
            const existingContract = await prisma.contract.findUnique({ where: { projectId: id } });
            if (!existingContract) {
                const initialContent = `# Contrato de Servicios\n\n**Proyecto:** ${project.title}\n**Presupuesto:** $${project.budget}\n\nEste contrato sirve como acuerdo preliminar... (Borrador Automático)`;

                // Transaction to ensure atomicity
                await prisma.$transaction(async (tx) => {
                    const contract = await tx.contract.create({
                        data: {
                            projectId: id,
                            status: 'DRAFT',
                            content: initialContent
                        }
                    });

                    const version = await tx.contractVersion.create({
                        data: {
                            contractId: contract.id,
                            versionNumber: 1,
                            content: initialContent,
                            changeMessage: 'Generación automática inicial',
                            createdBy: user.userId, // Vendor
                            status: 'DRAFT'
                        }
                    });

                    await tx.contract.update({
                        where: { id: contract.id },
                        data: { activeVersionId: version.id }
                    });
                });
            }
        }

        // Update
        const updated = await prisma.project.update({
            where: { id },
            data: {
                status: status as ProjectStatus,
                rejectionReason: rejectionReason
            }
        });

        res.json(updated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating status' });
    }
};
