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
                reviewDeadline
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
        const { reason } = req.body;
        const user = req.user;

        // Verificar que es vendor
        if (!user || user.role !== 'VENDOR') {
            return res.status(403).json({ message: 'Only vendors can open disputes' });
        }

        const milestone = await prisma.milestone.findUnique({
            where: { id },
            include: {
                project: {
                    include: {
                        vendor: true
                    }
                },
                reviews: {
                    where: { status: 'REJECTED' },
                    orderBy: { createdAt: 'desc' }
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

        // Validar que hay al menos 3 rechazos
        if (milestone.reviews.length < 3) {
            return res.status(400).json({ message: 'Dispute can only be opened after 3+ rejections' });
        }

        // Crear review de disputa
        await prisma.deliverableReview.create({
            data: {
                milestoneId: id,
                reviewerId: user.userId,
                status: 'DISPUTED',
                comment: reason || 'Vendor opened dispute',
                reviewNumber: milestone.reviews.length + 1
            }
        });

        // Actualizar milestone
        const updated = await prisma.milestone.update({
            where: { id },
            data: {
                status: 'IN_DISPUTE'
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

        // Notificar al cliente y crear ticket admin
        try {
            if ((updated as any).project.client) {
                await prisma.notification.create({
                    data: {
                        userId: (updated as any).project.client.userId,
                        title: '⚖️ Disputa abierta',
                        message: `El vendor ha abierto una disputa para el hito "${updated.title}" del proyecto "${(updated as any).project.title}". El equipo de soporte revisará el caso.`,
                        type: 'DISPUTE_OPENED',
                        entityId: updated.projectId,
                        entityType: 'project'
                    }
                });
            }

            // TODO: Crear ticket de soporte para admin
            // await createAdminTicket(...);
        } catch (notifError) {
            console.error('[OpenDispute] Failed to send notification:', notifError);
        }

        res.json({
            success: true,
            milestone: updated
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
