import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { notificationService } from '../services/notification.service';

// POST /api/milestones/:id/start
// Vendor inicia hito
export const startMilestone = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = req.user;

        // Verificar que es vendor
        if (!user || user.role !== 'VENDOR') {
            return res.status(403).json({ message: 'Only vendors can start milestones' });
        }

        const milestone = await prisma.milestone.findUnique({
            where: { id },
            include: { project: { include: { vendor: true } } }
        });

        if (!milestone) return res.status(404).json({ message: 'Milestone not found' });

        // Verificar propiedad
        if (!milestone.project.vendor || milestone.project.vendor.userId !== user.userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Validar estado
        if (milestone.status !== 'PENDING') {
            return res.status(400).json({ message: 'Milestone must be PENDING to start' });
        }

        const updated = await prisma.milestone.update({
            where: { id },
            data: { status: 'IN_PROGRESS' }
        });

        res.json({ success: true, milestone: updated });
    } catch (error) {
        console.error('[StartMilestone] Error:', error);
        res.status(500).json({ message: 'Error starting milestone' });
    }
};

// POST /api/milestones/:id/request-payment
// Vendor solicita aprobación de entregables
export const requestPayment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { vendorNote } = req.body;
        const user = req.user;

        // Verificar que es vendor
        if (!user || user.role !== 'VENDOR') {
            return res.status(403).json({ message: 'Only vendors can request payment' });
        }

        // Obtener milestone con proyecto
        const milestone = await prisma.milestone.findUnique({
            where: { id },
            include: {
                project: {
                    include: {
                        vendor: true
                    }
                },
                deliverableFolders: {
                    include: {
                        files: true
                    }
                }
            }
        });

        if (!milestone) {
            return res.status(404).json({ message: 'Milestone not found' });
        }

        // Verificar propiedad
        if (!milestone.project.vendor || milestone.project.vendor.userId !== user.userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Validar estado
        if (milestone.status !== 'IN_PROGRESS' && milestone.status !== 'CHANGES_REQUESTED') {
            return res.status(400).json({ message: 'Milestone must be IN_PROGRESS or CHANGES_REQUESTED to request payment' });
        }

        // Validar que hay archivos
        const hasFiles = milestone.deliverableFolders.some(folder => folder.files.length > 0);
        if (!hasFiles) {
            return res.status(400).json({ message: 'No deliverables uploaded. Please upload files first.' });
        }

        // Actualizar milestone
        const reviewDeadline = new Date();
        reviewDeadline.setDate(reviewDeadline.getDate() + 7); // 7 días

        const updated = await prisma.milestone.update({
            where: { id },
            data: {
                status: 'READY_FOR_REVIEW',
                submittedAt: new Date(),
                reviewDeadline,
                vendorNote: vendorNote?.trim() || null
            },
            include: {
                project: {
                    include: {
                        client: true,
                        vendor: true
                    }
                }
            }
        });

        // Enviar notificación al cliente
        try {
            if ((updated as any).project.client) {
                await prisma.notification.create({
                    data: {
                        userId: (updated as any).project.client.userId,
                        title: '📋 Entregables listos para revisión',
                        message: `El vendor ha completado el hito "${updated.title}" del proyecto "${(updated as any).project.title}". Por favor, revisa y aprueba o solicita cambios.`,
                        type: 'ACTION_REQUIRED',
                        entityId: updated.projectId,
                        entityType: 'project'
                    }
                });
            }
        } catch (notifError) {
            console.error('[RequestPayment] Failed to send notification:', notifError);
        }

        res.json({
            success: true,
            milestone: updated
        });
    } catch (error) {
        console.error('[RequestPayment] Error:', error);
        res.status(500).json({ message: 'Error requesting payment' });
    }
};

// POST /api/milestones/:id/approve
// Cliente aprueba entregables
export const approveMilestone = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        console.log(`[ApproveMilestone] Request received for ID: ${id}`);
        const user = req.user;

        // Verificar que es cliente
        if (!user || user.role !== 'CLIENT') {
            return res.status(403).json({ message: 'Only clients can approve milestones' });
        }

        const milestone = await prisma.milestone.findUnique({
            where: { id },
            include: {
                project: {
                    include: {
                        client: true
                    }
                },
                reviews: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!milestone) {
            return res.status(404).json({ message: 'Milestone not found' });
        }

        // Verificar propiedad
        if (milestone.project.client.userId !== user.userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Validar estado
        if (milestone.status !== 'READY_FOR_REVIEW') {
            return res.status(400).json({ message: 'Milestone is not ready for review' });
        }

        // Crear review
        await prisma.deliverableReview.create({
            data: {
                milestoneId: id,
                reviewerId: user.userId,
                status: 'APPROVED',
                reviewNumber: milestone.reviews.length + 1
            }
        });

        // Actualizar milestone
        const updated = await prisma.milestone.update({
            where: { id },
            data: {
                status: 'COMPLETED',
                isPaid: true,
                completedAt: new Date()
            },
            include: {
                project: {
                    include: {
                        vendor: true
                    }
                }
            }
        });

        // Check for related disputes and cancel them automatically
        const relatedDispute = await prisma.dispute.findFirst({
            where: {
                milestoneId: id,
                status: { in: ['OPEN', 'IN_PROGRESS'] }
            }
        });

        if (relatedDispute) {
            console.log(`[ApproveMilestone] Auto-cancelling dispute ${relatedDispute.id}`);

            // Cancel the dispute
            await prisma.dispute.update({
                where: { id: relatedDispute.id },
                data: {
                    status: 'CANCELLED',
                    resolutionNotes: 'Cancelada automáticamente: el cliente aprobó los entregables sin disputa.'
                }
            });

            // Update related incident to RESOLVED
            await prisma.incident.updateMany({
                where: {
                    projectId: updated.projectId,
                    resolution: { startsWith: `DISPUTE_ID:${relatedDispute.id}` }
                },
                data: {
                    status: 'RESOLVED',
                    resolution: `DISPUTE_ID:${relatedDispute.id} - Cancelada: cliente aprobó entregables`
                }
            });

            // Fetch milestone with vendor details for notification
            const milestoneWithVendor = await prisma.milestone.findUnique({
                where: { id },
                include: {
                    project: {
                        include: {
                            vendor: { include: { user: true } }
                        }
                    }
                }
            });

            // Notify vendor that dispute was cancelled
            try {
                if (milestoneWithVendor?.project.vendor) {
                    await prisma.notification.create({
                        data: {
                            userId: milestoneWithVendor.project.vendor.userId,
                            title: '⚖️ Disputa Cancelada',
                            message: `Tu disputa para el hito "${relatedDispute.milestoneTitle}" fue cancelada porque el cliente aprobó los entregables.`,
                            type: 'DISPUTE_RESOLVED',
                            entityId: relatedDispute.id,
                            entityType: 'dispute'
                        }
                    });
                }
            } catch (notifError) {
                console.error('[ApproveMilestone] Failed to send dispute cancellation notification:', notifError);
            }
        }

        // Enviar notificación al vendor
        try {
            if ((updated as any).project.vendor) {
                await prisma.notification.create({
                    data: {
                        userId: (updated as any).project.vendor.userId,
                        title: '✅ Entregables aprobados',
                        message: `El cliente ha aprobado el hito "${updated.title}" del proyecto "${(updated as any).project.title}". Los fondos han sido liberados.`,
                        type: 'PAYMENT_APPROVED',
                        entityId: updated.projectId,
                        entityType: 'project'
                    }
                });
            }
        } catch (notifError) {
            console.error('[ApproveMilestone] Failed to send notification:', notifError);
        }

        // TODO: Transferir fondos de escrow al vendor

        res.json({
            success: true,
            milestone: updated
        });
    } catch (error) {
        console.error('[ApproveMilestone] Error:', error);
        res.status(500).json({ message: 'Error approving milestone' });
    }
};

// POST /api/milestones/:id/reject
// Cliente rechaza entregables
export const rejectMilestone = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        console.log(`[RejectMilestone] Request received for ID: ${id}`);
        const { comment } = req.body;
        const user = req.user;

        // Verificar que es cliente
        if (!user || user.role !== 'CLIENT') {
            return res.status(403).json({ message: 'Only clients can reject milestones' });
        }

        const milestone = await prisma.milestone.findUnique({
            where: { id },
            include: {
                project: {
                    include: {
                        client: true
                    }
                },
                reviews: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!milestone) {
            console.log(`[RejectMilestone] Milestone not found: ${id}`);
            return res.status(404).json({ message: 'Milestone not found' });
        }

        // Verificar propiedad
        if (milestone.project.client.userId !== user.userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Validar estado
        if (milestone.status !== 'READY_FOR_REVIEW') {
            return res.status(400).json({ message: 'Milestone is not ready for review' });
        }

        const reviewNumber = milestone.reviews.length + 1;

        // Crear review
        await prisma.deliverableReview.create({
            data: {
                milestoneId: id,
                reviewerId: user.userId,
                status: 'REJECTED',
                comment: comment || '',
                reviewNumber
            }
        });

        // Actualizar milestone
        const updated = await prisma.milestone.update({
            where: { id },
            data: {
                status: 'CHANGES_REQUESTED',
                submittedAt: null, // Reset para próximo intento
                reviewDeadline: null
            },
            include: {
                project: {
                    include: {
                        vendor: true,
                        client: true
                    }
                }
            }
        });

        // Enviar notificación al vendor
        try {
            if ((updated as any).project.vendor) {
                const warningText = reviewNumber >= 2
                    ? ` ⚠️ Este es el rechazo #${reviewNumber}. Después de 3 rechazos, podrás abrir una disputa.`
                    : '';

                await prisma.notification.create({
                    data: {
                        userId: (updated as any).project.vendor.userId,
                        title: `🔄 Cambios solicitados (Intento ${reviewNumber})`,
                        message: `El cliente ha solicitado cambios en el hito "${updated.title}" del proyecto "${(updated as any).project.title}". Comentario: "${comment || 'Sin comentarios'}"${warningText}`,
                        type: 'CHANGES_REQUESTED',
                        entityId: updated.projectId,
                        entityType: 'project'
                    }
                });
            }
        } catch (notifError) {
            console.error('[RejectMilestone] Failed to send notification:', notifError);
        }

        res.json({
            success: true,
            milestone: updated,
            reviewNumber
        });
    } catch (error) {
        console.error('[RejectMilestone] Error:', error);
        res.status(500).json({ message: 'Error rejecting milestone' });
    }
};

// POST /api/milestones/:id/open-dispute
// Vendor abre disputa (después de 3+ rechazos)
export const openDispute = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { vendorComment } = req.body;
        const user = req.user;

        console.log(`[OpenDispute] Request received for milestone ID: ${id} by vendor: ${user?.userId}`);

        // Verificar que es vendor
        if (!user || user.role !== 'VENDOR') {
            return res.status(403).json({ message: 'Only vendors can open disputes' });
        }

        // Validar comentario del vendor
        if (!vendorComment || vendorComment.trim().length < 10) {
            return res.status(400).json({ message: 'Vendor comment must be at least 10 characters' });
        }

        // Obtener milestone con todas las relaciones necesarias
        const milestone = await prisma.milestone.findUnique({
            where: { id },
            include: {
                project: {
                    include: {
                        client: { include: { user: true } },
                        vendor: { include: { user: true } },
                        proposals: {
                            where: { status: 'ACCEPTED' },
                            orderBy: { createdAt: 'desc' },
                            take: 1
                        },
                        contract: {
                            include: {
                                versions: {
                                    orderBy: { createdAt: 'desc' }
                                }
                            }
                        }
                    }
                },
                reviews: {
                    include: { reviewer: { select: { email: true, role: true } } },
                    orderBy: { createdAt: 'asc' }
                },
                deliverableFolders: {
                    include: {
                        files: {
                            select: {
                                id: true,
                                originalName: true,
                                fileSize: true,
                                mimeType: true,
                                uploadedAt: true,
                                uploadedBy: true
                            }
                        },
                        subfolders: {
                            include: {
                                files: {
                                    select: {
                                        id: true,
                                        originalName: true,
                                        fileSize: true,
                                        mimeType: true,
                                        uploadedAt: true,
                                        uploadedBy: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!milestone) {
            console.log(`[OpenDispute] Milestone not found: ${id}`);
            return res.status(404).json({ message: 'Milestone not found' });
        }

        // Verificar propiedad
        if (!milestone.project.vendor || milestone.project.vendor.userId !== user.userId) {
            console.log(`[OpenDispute] Not authorized: vendor mismatch`);
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Validar estado del milestone
        if (milestone.status !== 'CHANGES_REQUESTED') {
            return res.status(400).json({ message: 'Dispute can only be opened when milestone is in CHANGES_REQUESTED status' });
        }

        // Contar rechazos (REJECTED)
        const rejectedReviews = milestone.reviews.filter(r => r.status === 'REJECTED');
        console.log(`[OpenDispute] Rejection count: ${rejectedReviews.length}`);

        if (rejectedReviews.length < 3) {
            return res.status(400).json({
                message: 'Dispute can only be opened after 3+ rejections',
                currentRejections: rejectedReviews.length,
                required: 3
            });
        }

        // Verificar que no existe ya una disputa para este milestone
        const existingDispute = await prisma.dispute.findFirst({
            where: { milestoneId: id }
        });

        if (existingDispute) {
            return res.status(400).json({ message: 'Dispute already exists for this milestone' });
        }

        // Recopilar información automáticamente
        const proposalData = milestone.project.proposals[0] || null;
        const contractData = {
            content: milestone.project.contract?.content,
            status: milestone.project.contract?.status,
            signedVersion: milestone.project.contract?.versions?.find(v =>
                v.clientSignedAt && v.vendorSignedAt
            ),
            allVersions: milestone.project.contract?.versions
        };

        const reviewHistory = milestone.reviews.map(r => ({
            reviewNumber: r.reviewNumber,
            status: r.status,
            comment: r.comment,
            vendorMessage: milestone.vendorNote || null, // Include vendor's submission note
            reviewerEmail: r.reviewer.email,
            reviewerRole: r.reviewer.role,
            createdAt: r.createdAt.toISOString()
        }));

        const deliverableFoldersData = milestone.deliverableFolders.map(folder => ({
            id: folder.id,
            name: folder.name,
            status: folder.status,
            totalFiles: folder.totalFiles,
            totalSize: folder.totalSize.toString(),
            files: folder.files.map(file => ({
                id: file.id,
                originalName: file.originalName,
                fileSize: file.fileSize.toString(),
                mimeType: file.mimeType,
                uploadedAt: file.uploadedAt.toISOString(),
                uploadedBy: file.uploadedBy
            })),
            subfolders: folder.subfolders.map(subfolder => ({
                id: subfolder.id,
                name: subfolder.name,
                files: subfolder.files.map(file => ({
                    id: file.id,
                    originalName: file.originalName,
                    fileSize: file.fileSize.toString(),
                    mimeType: file.mimeType,
                    uploadedAt: file.uploadedAt.toISOString(),
                    uploadedBy: file.uploadedBy
                }))
            }))
        }));

        console.log(`[OpenDispute] Creating dispute for milestone: ${milestone.title}`);

        // Crear disputa en una transacción
        const dispute = await prisma.$transaction(async (tx) => {
            // 1. Crear review de disputa
            await tx.deliverableReview.create({
                data: {
                    milestoneId: id,
                    reviewerId: user.userId,
                    status: 'DISPUTED',
                    comment: vendorComment,
                    reviewNumber: milestone.reviews.length + 1
                }
            });

            // 2. Actualizar milestone a IN_DISPUTE
            await tx.milestone.update({
                where: { id },
                data: { status: 'IN_DISPUTE' }
            });

            // 3. Crear registro de disputa con toda la información
            const newDispute = await tx.dispute.create({
                data: {
                    projectId: milestone.projectId,
                    milestoneId: milestone.id,
                    milestoneTitle: milestone.title,
                    milestoneAmount: milestone.amount,
                    plaintiffId: user.userId, // vendor
                    defendantId: milestone.project.client.userId, // client

                    amount: milestone.amount,
                    escrowAmount: milestone.amount,
                    vendorComment: vendorComment.trim(),
                    vendorSubmittedAt: new Date(),

                    // Auto-collected evidence
                    proposalData: proposalData || {},
                    contractData: contractData,
                    reviewHistory: reviewHistory,
                    deliverableFolders: deliverableFoldersData,

                    status: 'OPEN'
                }
            });

            // 4. Crear incidente para tracking en la pestaña de incidencias
            await tx.incident.create({
                data: {
                    projectId: milestone.projectId,
                    reporterId: user.userId,
                    title: `Disputa: ${milestone.title}`,
                    description: `Se ha abierto una disputa para el hito "${milestone.title}" después de ${rejectedReviews.length} rechazos. Cantidad en disputa: $${milestone.amount.toFixed(2)}`,
                    type: 'DISPUTE',
                    status: 'OPEN',
                    priority: 'HIGH',
                    // Store dispute ID in resolution field temporarily for linking
                    resolution: `DISPUTE_ID:${newDispute.id}`
                }
            });

            return newDispute;
        });

        console.log(`[OpenDispute] Dispute created successfully: ${dispute.id}`);

        // Obtener todos los admins para notificar
        const admins = await prisma.user.findMany({
            where: { role: 'ADMIN' }
        });

        console.log(`[OpenDispute] Notifying ${admins.length} administrators`);

        // Notificar a todos los admins
        const adminNotifications = admins.map(admin =>
            prisma.notification.create({
                data: {
                    userId: admin.id,
                    title: '⚖️ Nueva Disputa Abierta',
                    message: `El vendor ${milestone.project.vendor?.user.email} ha abierto una disputa para el hito "${milestone.title}" del proyecto "${milestone.project.title}". Requiere revisión inmediata.`,
                    type: 'DISPUTE_OPENED',
                    entityId: dispute.id,
                    entityType: 'dispute',
                    actorId: user.userId
                }
            })
        );

        // Notificar al cliente
        const clientNotification = prisma.notification.create({
            data: {
                userId: milestone.project.client.userId,
                title: '⚖️ Disputa abierta',
                message: `El vendor ha abierto una disputa para el hito "${milestone.title}" del proyecto "${milestone.project.title}". El equipo de administración revisará el caso.`,
                type: 'DISPUTE_OPENED',
                entityId: dispute.id,
                entityType: 'dispute',
                actorId: user.userId
            }
        });

        // Notificar al vendor (confirmación)
        const vendorNotification = prisma.notification.create({
            data: {
                userId: user.userId,
                title: '⚖️ Disputa enviada',
                message: `Tu disputa para el hito "${milestone.title}" ha sido enviada al equipo de administración. Recibirás una notificación cuando se resuelva el caso.`,
                type: 'DISPUTE_OPENED',
                entityId: dispute.id,
                entityType: 'dispute'
            }
        });

        // Ejecutar todas las notificaciones
        try {
            await prisma.$transaction([
                ...adminNotifications,
                clientNotification,
                vendorNotification
            ]);
        } catch (notifError) {
            console.error('[OpenDispute] Failed to send notifications:', notifError);
        }

        res.json({
            success: true,
            dispute: {
                id: dispute.id,
                status: dispute.status,
                milestoneId: dispute.milestoneId,
                createdAt: dispute.createdAt
            },
            message: 'Dispute opened successfully. Admins have been notified.'
        });
    } catch (error) {
        console.error('[OpenDispute] Error:', error);
        res.status(500).json({ message: 'Error opening dispute' });
    }
};
// POST /api/milestones/:id/complete
// Vendor completa hito (sin pago o ya pagado)
export const completeMilestone = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { completionNote } = req.body;
        const user = req.user;

        // Verificar que es vendor
        if (!user || user.role !== 'VENDOR') {
            return res.status(403).json({ message: 'Only vendors can complete milestones' });
        }

        const milestone = await prisma.milestone.findUnique({
            where: { id },
            include: { project: { include: { vendor: true, client: true } } }
        });

        if (!milestone) return res.status(404).json({ message: 'Milestone not found' });

        // Verificar propiedad
        if (!milestone.project.vendor || milestone.project.vendor.userId !== user.userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Logic check:
        // 1. If amount sent is > 0, it generally requires payment flow (requestPayment).
        //    Exception: If it's already marked isPaid=true (maybe externally?) but status not Completed? 
        //    (Unlikely with current flow, but safe to allow if paid)
        // 2. If amount == 0, can complete directly.

        const needsPayment = milestone.amount > 0;
        const isPaid = milestone.isPaid;

        if (needsPayment && !isPaid) {
            return res.status(400).json({ message: 'Cannot complete a paid milestone without payment approval. Use Request Payment.' });
        }

        const updated = await prisma.milestone.update({
            where: { id },
            data: {
                status: 'COMPLETED',
                completionNote: completionNote || '',
                completedAt: new Date(),
                isPaid: true // If amount is 0, it's effectively paid. If amount > 0, it was already paid.
            }
        });

        // Notify client
        try {
            if (milestone.project.client) {
                const message = completionNote
                    ? `El vendor ha marcado el hito "${updated.title}" como completado. Nota: "${completionNote}"`
                    : `El vendor ha marcado el hito "${updated.title}" como completado.`;

                await prisma.notification.create({
                    data: {
                        userId: milestone.project.client.userId,
                        title: '✅ Hito Completado',
                        message,
                        type: 'MILESTONE_COMPLETED',
                        entityId: updated.projectId,
                        entityType: 'project'
                    }
                });
            }
        } catch (notifError) {
            console.error('[CompleteMilestone] Failed to send notification:', notifError);
        }

        res.json({ success: true, milestone: updated });

    } catch (error) {
        console.error('[CompleteMilestone] Error:', error);
        res.status(500).json({ message: 'Error completing milestone' });
    }
};

// GET /api/disputes/:id
// Get dispute details (accessible by client, vendor, or admin)
export const getDispute = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = req.user;

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const dispute = await prisma.dispute.findUnique({
            where: { id }
        });

        if (!dispute) {
            return res.status(404).json({ message: 'Dispute not found' });
        }

        // Get project separately with full includes to avoid TypeScript issues
        const project = await prisma.project.findUnique({
            where: { id: dispute.projectId },
            include: {
                client: { include: { user: true } },
                vendor: { include: { user: true } }
            }
        });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Authorization: Only client, vendor, or admin can view
        const isClient = project.client?.userId === user.userId;
        const isVendor = project.vendor?.userId === user.userId;
        const isAdmin = user.role === 'ADMIN';

        if (!isClient && !isVendor && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized to view this dispute' });
        }

        // Return dispute with all evidence
        res.json({
            id: dispute.id,
            milestoneId: dispute.milestoneId, // Add milestoneId for frontend to use
            milestoneTitle: dispute.milestoneTitle,
            milestoneAmount: dispute.milestoneAmount.toNumber(),
            vendorComment: dispute.vendorComment,
            status: dispute.status,
            createdAt: dispute.createdAt,
            reviewHistory: dispute.reviewHistory,
            deliverableFolders: dispute.deliverableFolders,
            proposalData: dispute.proposalData,
            contractData: dispute.contractData
        });
    } catch (error) {
        console.error('[GetDispute] Error:', error);
        res.status(500).json({ message: 'Error fetching dispute details' });
    }
};

// POST /api/milestones/:milestoneId/disputes/:disputeId/cancel
// Vendor cancela su propia disputa (solo si está OPEN o IN_PROGRESS)
export const cancelDispute = async (req: Request, res: Response) => {
    try {
        const { disputeId } = req.params;
        const user = req.user;

        console.log(`[CancelDispute] Request received for dispute ID: ${disputeId} by user: ${user?.userId}`);

        // Verificar que es vendor
        if (!user || user.role !== 'VENDOR') {
            return res.status(403).json({ message: 'Only vendors can cancel disputes' });
        }

        // Obtener disputa con proyecto
        const dispute = await prisma.dispute.findUnique({
            where: { id: disputeId },
            include: {
                project: {
                    include: {
                        vendor: { include: { user: true } },
                        client: { include: { user: true } }
                    }
                }
            }
        });

        if (!dispute) {
            return res.status(404).json({ message: 'Dispute not found' });
        }

        // Verificar que es el vendor que abrió la disputa
        if (dispute.plaintiffId !== user.userId) {
            return res.status(403).json({ message: 'Only the vendor who opened the dispute can cancel it' });
        }

        // Validar que la disputa está en estado OPEN o IN_PROGRESS
        if (dispute.status !== 'OPEN' && dispute.status !== 'IN_PROGRESS') {
            return res.status(400).json({
                message: 'Dispute can only be cancelled when status is OPEN or IN_PROGRESS',
                currentStatus: dispute.status
            });
        }

        console.log(`[CancelDispute] Cancelling dispute ${disputeId}`);

        // Actualizar disputa a CANCELLED
        const updatedDispute = await prisma.dispute.update({
            where: { id: disputeId },
            data: {
                status: 'CANCELLED',
                resolutionNotes: 'Disputa cancelada por el vendor.'
            }
        });

        // Actualizar incidente relacionado
        await prisma.incident.updateMany({
            where: {
                projectId: dispute.projectId,
                resolution: { startsWith: `DISPUTE_ID:${disputeId}` }
            },
            data: {
                status: 'RESOLVED',
                resolution: `DISPUTE_ID:${disputeId} - Cancelada por vendor`
            }
        });

        // Si había un milestone asociado, regresarlo a CHANGES_REQUESTED
        if (dispute.milestoneId) {
            const milestone = await prisma.milestone.findUnique({
                where: { id: dispute.milestoneId }
            });

            if (milestone && milestone.status === 'IN_DISPUTE') {
                await prisma.milestone.update({
                    where: { id: dispute.milestoneId },
                    data: { status: 'CHANGES_REQUESTED' }
                });
            }
        }

        // Notificar al cliente
        try {
            if (dispute.project.client) {
                await prisma.notification.create({
                    data: {
                        userId: dispute.project.client.userId,
                        title: '⚖️ Disputa Cancelada',
                        message: `El vendor ha cancelado la disputa del hito "${dispute.milestoneTitle}".`,
                        type: 'DISPUTE_RESOLVED',
                        entityId: disputeId,
                        entityType: 'dispute',
                        actorId: user.userId
                    }
                });
            }
        } catch (notifError) {
            console.error('[CancelDispute] Failed to send client notification:', notifError);
        }

        // Notificar a admins
        try {
            const admins = await prisma.user.findMany({
                where: { role: 'ADMIN' }
            });

            const adminNotifications = admins.map(admin =>
                prisma.notification.create({
                    data: {
                        userId: admin.id,
                        title: '⚖️ Disputa Cancelada',
                        message: `El vendor ha cancelado la disputa del hito "${dispute.milestoneTitle}" del proyecto "${dispute.project.title}".`,
                        type: 'DISPUTE_RESOLVED',
                        entityId: disputeId,
                        entityType: 'dispute',
                        actorId: user.userId
                    }
                })
            );

            await Promise.all(adminNotifications);
        } catch (notifError) {
            console.error('[CancelDispute] Failed to send admin notifications:', notifError);
        }

        res.json({
            success: true,
            dispute: {
                id: updatedDispute.id,
                status: updatedDispute.status,
                resolutionNotes: updatedDispute.resolutionNotes
            },
            message: 'Dispute cancelled successfully'
        });
    } catch (error) {
        console.error('[CancelDispute] Error:', error);
        res.status(500).json({ message: 'Error cancelling dispute' });
    }
};
