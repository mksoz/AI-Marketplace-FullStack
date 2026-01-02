import { Request, Response } from 'express';
import { PrismaClient, UserRole, ProjectStatus } from '@prisma/client';

const prisma = new PrismaClient();

// CLIENT: Create a generic project (Old flow, keeping for compatibility if needed, but updated)
export const createProject = async (req: Request, res: Response) => {
    try {
        const { title, description, budget, templateData } = req.body;
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
                templateData, // Save template context
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

// SHARED: Get My Projects (Client or Vendor)
export const getMyProjects = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        if (user.role === UserRole.CLIENT) {
            const clientProfile = await prisma.clientProfile.findUnique({ where: { userId: user.userId } });
            if (!clientProfile) return res.status(404).json({ message: 'Profile not found' });

            const projects = await prisma.project.findMany({
                where: { clientId: clientProfile.id },
                include: {
                    _count: { select: { proposals: true } },
                    vendor: { select: { companyName: true } },
                    contract: { select: { clientSigned: true, vendorSigned: true, status: true } }
                },
                orderBy: { createdAt: 'desc' }
            });
            return res.json(projects);

        } else if (user.role === UserRole.VENDOR) {
            const vendorProfile = await prisma.vendorProfile.findUnique({ where: { userId: user.userId } });
            if (!vendorProfile) return res.status(404).json({ message: 'Profile not found' });

            // Vendors only see projects that are actively running or completed (not leads/proposals)
            const projects = await prisma.project.findMany({
                where: {
                    vendorId: vendorProfile.id,
                    status: { in: [ProjectStatus.IN_PROGRESS, ProjectStatus.COMPLETED, ProjectStatus.ACCEPTED] }
                },
                include: {
                    client: { select: { companyName: true } },
                    contract: { select: { status: true } },
                    milestones: { select: { status: true } }
                },
                orderBy: { createdAt: 'desc' }
            });
            return res.json(projects);
        }

        return res.status(403).json({ message: 'Invalid role' });
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
                // Include ALL statuses to show full pipeline history, including Won/Lost
                OR: [
                    { status: ProjectStatus.PROPOSED },
                    { status: ProjectStatus.CONTACTED },
                    { status: ProjectStatus.IN_NEGOTIATION },
                    { status: ProjectStatus.ACCEPTED },
                    { status: ProjectStatus.DECLINED },
                    { status: ProjectStatus.IN_PROGRESS }, // Moves to 'Finalizada' (Closed/Won)
                    { status: ProjectStatus.COMPLETED }    // Moves to 'Finalizada' (Closed/Won)
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

// VENDOR: Setup Project (Post-Contract)
export const setupProject = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { startDate, endDate, milestones, repoUrl, repoName } = req.body;
        const user = req.user;

        if (!user || user.role !== UserRole.VENDOR) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Verify ownership
        const project = await prisma.project.findUnique({ where: { id } });
        // NOTE: Allow setup if project is ACCEPTED (Contract Signed) OR IN_PROGRESS
        if (!project || (project.status !== 'ACCEPTED' && project.status !== 'IN_PROGRESS')) {
            return res.status(400).json({ message: 'Project must be accepted before setup' });
        }

        // Transaction to update project and replace milestones
        const updated = await prisma.$transaction(async (tx) => {
            // Update Project Details
            const p = await tx.project.update({
                where: { id },
                data: {
                    startDate: startDate ? new Date(startDate) : null,
                    endDate: endDate ? new Date(endDate) : null,
                    repoUrl: repoUrl || null,
                    repoName: repoName || null,
                    status: 'IN_PROGRESS' // Activate project
                }
            });

            // Clear old milestones (if re-running setup)
            await tx.milestone.deleteMany({ where: { projectId: id } });

            // Create new milestones
            if (milestones && milestones.length > 0) {
                // Filter out milestones without title or date to be safe
                const validMilestones = milestones.filter((m: any) => m.title && m.dueDate);

                if (validMilestones.length > 0) {
                    await tx.milestone.createMany({
                        data: validMilestones.map((m: any, index: number) => ({
                            projectId: id,
                            title: m.title,
                            description: m.description || '',
                            amount: isNaN(parseFloat(m.amount)) ? 0 : parseFloat(m.amount),
                            dueDate: new Date(m.dueDate),
                            status: 'PENDING',
                            order: index
                        }))
                    });
                }
            }

            // Create Default Folder Structure if none exists
            const rootFolders = await tx.projectFolder.findMany({ where: { projectId: id, parentId: null } });
            if (rootFolders.length === 0) {
                await tx.projectFolder.createMany({
                    data: [
                        { name: 'Documentación Legal', projectId: id },
                        { name: 'Entregables Finales', projectId: id },
                        { name: 'Diseños UI/UX', projectId: id },
                        { name: 'Especificaciones Técnicas', projectId: id }
                    ]
                });
            }

            return p;
        });

        res.json(updated);

    } catch (error) {
        console.error("Error setting up project:", error);
        res.status(500).json({ message: 'Error setting up project' });
    }
};

// SHARED: Get Project Details (Timeline, Files, etc.)
export const getProjectTracking = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = req.user;

        // Fetch project with all tracking relations
        const project = await prisma.project.findUnique({
            where: { id },
            include: {
                milestones: { orderBy: { order: 'asc' } },
                folders: { include: { files: true }, where: { parentId: null } },
                files: { where: { folderId: null } }, // Root files
                contract: { select: { activeVersionId: true, status: true } },
                // @ts-ignore
                incidents: { orderBy: { createdAt: 'desc' }, include: { reporter: { select: { email: true } } } },
                // @ts-ignore
                reviews: true
            }
        });

        if (!project) return res.status(404).json({ message: 'Project not found' });

        // Basic Access Control
        // In a real app we'd check if user.id matches client or vendor profile
        // For now, assuming middleware authentication is enough to "view" if valid ID is known.

        res.json(project);
    } catch (error) {
        console.error("Error fetching project tracking:", error);
        res.status(500).json({ message: 'Error fetching project details' });
    }
};

// SHARED: Create Incident
export const createIncident = async (req: Request, res: Response) => {
    try {
        const { projectId, title, description, priority } = req.body;
        const user = req.user;
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        const incident = await prisma.incident.create({
            data: {
                projectId,
                reporterId: user.userId,
                title,
                description,
                priority: priority || 'MEDIUM',
                status: 'OPEN'
            }
        });

        res.status(201).json(incident);
    } catch (error) {
        console.error("Error creating incident:", error);
        res.status(500).json({ message: 'Error reporting incident' });
    }
};

// SHARED: Update Incident (Resolve/Close)
export const updateIncident = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status, resolution } = req.body;

        const updated = await prisma.incident.update({
            where: { id },
            data: {
                status,
                resolution
            }
        });

        res.json(updated);
    } catch (error) {
        console.error("Error updating incident:", error);
        res.status(500).json({ message: 'Error updating incident' });
    }
};

// SHARED: Create Review
export const createReview = async (req: Request, res: Response) => {
    try {
        const { projectId, vendorId, rating, comment } = req.body;

        const review = await prisma.review.create({
            data: {
                projectId,
                vendorId,
                rating,
                comment
            }
        });

        res.status(201).json(review);
    } catch (error) {
        console.error("Error creating review:", error);
        res.status(500).json({ message: 'Error submitting review' });
    }
};
