import { PrismaClient, NotificationType, Notification } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateNotificationDTO {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    actionUrl?: string;
    entityId?: string;
    entityType?: string;
    actorId?: string;
}

class NotificationService {
    // ========== CORE METHODS ==========

    async createNotification(data: CreateNotificationDTO): Promise<Notification> {
        return await prisma.notification.create({
            data: {
                userId: data.userId,
                type: data.type,
                title: data.title,
                message: data.message,
                actionUrl: data.actionUrl,
                entityId: data.entityId,
                entityType: data.entityType,
                actorId: data.actorId,
            },
            include: {
                actor: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                    },
                },
            },
        });
    }

    async createBulkNotifications(notifications: CreateNotificationDTO[]): Promise<number> {
        const result = await prisma.notification.createMany({
            data: notifications,
        });
        return result.count;
    }

    // ========== PROPUESTAS ==========

    async notifyProposalReceived(
        vendorId: string,
        proposalId: string,
        clientData: { userId: string; companyName: string; projectTitle: string }
    ) {
        return await this.createNotification({
            userId: vendorId,
            type: 'PROPOSAL_RECEIVED',
            title: `Nueva propuesta: ${clientData.projectTitle}`,
            message: `${clientData.companyName} está buscando un vendor para "${clientData.projectTitle}".`,
            actionUrl: `/vendor/proposals`,
            entityId: proposalId,
            entityType: 'proposal',
            actorId: clientData.userId,
        });
    }

    async notifyProposalAccepted(
        vendorId: string,
        proposalId: string,
        clientData: { userId: string; companyName: string; projectTitle: string }
    ) {
        return await this.createNotification({
            userId: vendorId,
            type: 'PROPOSAL_ACCEPTED',
            title: '¡Propuesta aceptada!',
            message: `${clientData.companyName} aceptó tu propuesta para "${clientData.projectTitle}".`,
            actionUrl: `/vendor/proposals`,
            entityId: proposalId,
            entityType: 'proposal',
            actorId: clientData.userId,
        });
    }

    async notifyProposalRejected(
        vendorId: string,
        proposalId: string,
        clientData: { userId: string; companyName: string; projectTitle: string }
    ) {
        return await this.createNotification({
            userId: vendorId,
            type: 'PROPOSAL_REJECTED',
            title: 'Propuesta rechazada',
            message: `${clientData.companyName} rechazó tu propuesta para "${clientData.projectTitle}".`,
            actionUrl: `/vendor/proposals`,
            entityId: proposalId,
            entityType: 'proposal',
            actorId: clientData.userId,
        });
    }

    // ========== PROYECTOS ==========

    async notifyProjectCreated(
        vendorId: string,
        projectId: string,
        clientData: { userId: string; companyName: string },
        projectTitle: string
    ) {
        return await this.createNotification({
            userId: vendorId,
            type: 'PROJECT_CREATED',
            title: `Nuevo proyecto: ${projectTitle}`,
            message: `${clientData.companyName} te asignó un nuevo proyecto.`,
            actionUrl: `/vendor/projects/${projectId}`,
            entityId: projectId,
            entityType: 'project',
            actorId: clientData.userId,
        });
    }

    async notifyProjectCompleted(
        clientId: string,
        projectId: string,
        vendorData: { userId: string; companyName: string },
        projectTitle: string
    ) {
        return await this.createNotification({
            userId: clientId,
            type: 'PROJECT_COMPLETED',
            title: `Proyecto completado: ${projectTitle}`,
            message: `${vendorData.companyName} marcó el proyecto como completado.`,
            actionUrl: `/client/projects/${projectId}`,
            entityId: projectId,
            entityType: 'project',
            actorId: vendorData.userId,
        });
    }

    // ========== CONTRACTS ==========

    async notifyContractGenerated(
        clientId: string,
        contractData: {
            contractId: string;
            projectId: string;
            projectTitle: string;
            vendorUserId: string;
            vendorName: string;
        }
    ) {
        return await this.createNotification({
            userId: clientId,
            type: 'CONTRACT_GENERATED',
            title: 'Contrato generado',
            message: `${contractData.vendorName} generó el contrato para "${contractData.projectTitle}".`,
            actionUrl: `/client/projects/${contractData.projectId}`,
            entityId: contractData.contractId,
            entityType: 'contract',
            actorId: contractData.vendorUserId,
        });
    }

    async notifyContractSigned(
        recipientId: string,
        contractData: {
            contractId: string;
            projectId: string;
            projectTitle: string;
            signerUserId: string;
            signerName: string;
            signerRole: string;
        }
    ) {
        return await this.createNotification({
            userId: recipientId,
            type: 'CONTRACT_SIGNED',
            title: 'Contrato firmado',
            message: `${contractData.signerName} (${contractData.signerRole}) firmó el contrato de "${contractData.projectTitle}".`,
            actionUrl: `/client/projects/${contractData.projectId}`,
            entityId: contractData.contractId,
            entityType: 'contract',
            actorId: contractData.signerUserId,
        });
    }

    async notifyContractVersionCreated(
        recipientId: string,
        versionData: {
            contractId: string;
            versionNumber: number;
            projectId: string;
            projectTitle: string;
            creatorUserId: string;
            creatorName: string;
            changeMessage: string;
        }
    ) {
        return await this.createNotification({
            userId: recipientId,
            type: 'CONTRACT_REMINDER',
            title: `Nueva versión de contrato (v${versionData.versionNumber})`,
            message: `${versionData.creatorName} creó una nueva versión del contrato: ${versionData.changeMessage}`,
            actionUrl: `/client/projects/${versionData.projectId}`,
            entityId: versionData.contractId,
            entityType: 'contract',
            actorId: versionData.creatorUserId,
        });
    }

    // ========== HITOS & ENTREGAS ==========

    async notifyMilestoneCompleted(
        clientId: string,
        milestoneId: string,
        projectData: {
            projectId: string;
            projectTitle: string;
            milestoneName: string;
            vendorUserId: string;
            vendorName: string;
        }
    ) {
        return await this.createNotification({
            userId: clientId,
            type: 'MILESTONE_COMPLETED',
            title: `Hito completado: ${projectData.milestoneName}`,
            message: `${projectData.vendorName} completó "${projectData.milestoneName}" en "${projectData.projectTitle}".`,
            actionUrl: `/client/projects/${projectData.projectId}`,
            entityId: milestoneId,
            entityType: 'milestone',
            actorId: projectData.vendorUserId,
        });
    }

    async notifyMilestoneApproved(
        vendorId: string,
        milestoneId: string,
        projectData: {
            projectId: string;
            projectTitle: string;
            milestoneName: string;
            clientUserId: string;
            clientName: string;
        }
    ) {
        return await this.createNotification({
            userId: vendorId,
            type: 'MILESTONE_APPROVED',
            title: `Hito aprobado: ${projectData.milestoneName}`,
            message: `${projectData.clientName} aprobó el hito "${projectData.milestoneName}".`,
            actionUrl: `/vendor/projects/${projectData.projectId}`,
            entityId: milestoneId,
            entityType: 'milestone',
            actorId: projectData.clientUserId,
        });
    }

    async notifyMilestoneRejected(
        vendorId: string,
        milestoneId: string,
        projectData: {
            projectId: string;
            milestoneName: string;
            clientUserId: string;
            clientName: string;
            reason?: string;
        }
    ) {
        const reasonText = projectData.reason ? ` Motivo: "${projectData.reason}"` : '';
        return await this.createNotification({
            userId: vendorId,
            type: 'MILESTONE_REJECTED',
            title: `Hito rechazado: ${projectData.milestoneName}`,
            message: `${projectData.clientName} rechazó el hito "${projectData.milestoneName}".${reasonText}`,
            actionUrl: `/vendor/projects/${projectData.projectId}`,
            entityId: milestoneId,
            entityType: 'milestone',
            actorId: projectData.clientUserId,
        });
    }

    async notifyDeliverableUploaded(
        clientId: string,
        deliverableId: string,
        projectData: {
            projectId: string;
            projectTitle: string;
            fileName: string;
            vendorUserId: string;
            vendorName: string;
        }
    ) {
        return await this.createNotification({
            userId: clientId,
            type: 'DELIVERABLE_UPLOADED',
            title: `Nuevo archivo: ${projectData.fileName}`,
            message: `${projectData.vendorName} subió un archivo en "${projectData.projectTitle}".`,
            actionUrl: `/client/projects/${projectData.projectId}/deliverables`,
            entityId: deliverableId,
            entityType: 'file',
            actorId: projectData.vendorUserId,
        });
    }

    async notifyDeadlineReminder(
        userId: string,
        milestoneId: string,
        projectData: {
            projectId: string;
            milestoneName: string;
            userRole: string;
            daysLeft: number;
        }
    ) {
        return await this.createNotification({
            userId,
            type: 'DEADLINE_REMINDER',
            title: `⚠️ Entrega próxima: ${projectData.milestoneName}`,
            message: `El hito "${projectData.milestoneName}" vence en ${projectData.daysLeft} ${projectData.daysLeft === 1 ? 'día' : 'días'}.`,
            actionUrl: `/${projectData.userRole}/projects/${projectData.projectId}/milestones`,
            entityId: milestoneId,
            entityType: 'milestone',
        });
    }

    // ========== FINANZAS ==========

    async notifyPaymentRequested(
        clientId: string,
        requestId: string,
        paymentData: {
            projectId: string;
            milestoneName: string;
            amount: number;
            vendorUserId: string;
            vendorName: string;
        }
    ) {
        return await this.createNotification({
            userId: clientId,
            type: 'PAYMENT_REQUESTED',
            title: `Solicitud de pago: ${paymentData.milestoneName}`,
            message: `${paymentData.vendorName} solicita el pago de $${paymentData.amount} para "${paymentData.milestoneName}".`,
            actionUrl: `/client/projects/${paymentData.projectId}`,
            entityId: requestId,
            entityType: 'payment',
            actorId: paymentData.vendorUserId,
        });
    }

    async notifyPaymentApproved(
        vendorId: string,
        requestId: string,
        paymentData: {
            projectId: string;
            milestoneName: string;
            amount: number;
            clientUserId: string;
        }
    ) {
        return await this.createNotification({
            userId: vendorId,
            type: 'PAYMENT_APPROVED',
            title: `Pago aprobado: ${paymentData.milestoneName}`,
            message: `El cliente aprobó tu solicitud de pago de $${paymentData.amount}.`,
            actionUrl: `/vendor/projects/${paymentData.projectId}`,
            entityId: requestId,
            entityType: 'payment',
            actorId: paymentData.clientUserId,
        });
    }

    async notifyPaymentCompleted(
        vendorId: string,
        requestId: string,
        paymentData: {
            projectId: string;
            milestoneName: string;
            amount: number;
            clientUserId: string;
        }
    ) {
        return await this.createNotification({
            userId: vendorId,
            type: 'PAYMENT_COMPLETED',
            title: `💰 Pago liberado: ${paymentData.milestoneName}`,
            message: `El cliente aprobó el entregable y los fondos ($${paymentData.amount}) están disponibles.`,
            actionUrl: `/vendor/projects/${paymentData.projectId}`,
            entityId: requestId,
            entityType: 'payment',
            actorId: paymentData.clientUserId,
        });
    }

    async notifyPaymentRejected(
        vendorId: string,
        requestId: string,
        paymentData: {
            projectId: string;
            milestoneName: string;
            clientUserId: string;
            reason?: string;
        }
    ) {
        const reasonText = paymentData.reason ? ` Motivo: "${paymentData.reason}"` : '';
        return await this.createNotification({
            userId: vendorId,
            type: 'PAYMENT_REJECTED',
            title: `Pago rechazado: ${paymentData.milestoneName}`,
            message: `El cliente rechazó tu solicitud de pago.${reasonText}`,
            actionUrl: `/vendor/projects/${paymentData.projectId}`,
            entityId: requestId,
            entityType: 'payment',
            actorId: paymentData.clientUserId,
        });
    }

    // ========== DELIVERABLE APPROVAL WORKFLOW ==========

    async notifyDeliverablesSubmitted(
        clientId: string,
        milestoneId: string,
        deliverableData: {
            projectId: string;
            projectTitle: string;
            milestoneName: string;
            vendorUserId: string;
            vendorName: string;
        }
    ) {
        return await this.createNotification({
            userId: clientId,
            type: 'DELIVERABLE_UPLOADED',
            title: `📦 Entregables listos: ${deliverableData.milestoneName}`,
            message: `${deliverableData.vendorName} envió los entregables del hito "${deliverableData.milestoneName}" para tu revisión.`,
            actionUrl: `/client/projects/${deliverableData.projectId}?tab=dashboard`,
            entityId: milestoneId,
            entityType: 'milestone',
            actorId: deliverableData.vendorUserId,
        });
    }

    async notifyDeliverablesApproved(
        vendorId: string,
        milestoneId: string,
        deliverableData: {
            projectId: string;
            milestoneName: string;
            amount: number;
            clientUserId: string;
            clientName: string;
        }
    ) {
        return await this.createNotification({
            userId: vendorId,
            type: 'PAYMENT_COMPLETED',
            title: `✅ Entregable aprobado: ${deliverableData.milestoneName}`,
            message: `${deliverableData.clientName} aprobó tu entregable y liberó los fondos ($${deliverableData.amount}).`,
            actionUrl: `/vendor/projects/${deliverableData.projectId}?tab=financials`,
            entityId: milestoneId,
            entityType: 'milestone',
            actorId: deliverableData.clientUserId,
        });
    }

    async notifyDeliverablesRejected(
        vendorId: string,
        milestoneId: string,
        deliverableData: {
            projectId: string;
            milestoneName: string;
            clientUserId: string;
            clientName: string;
            comment: string;
        }
    ) {
        return await this.createNotification({
            userId: vendorId,
            type: 'MILESTONE_REJECTED',
            title: `🔧 Cambios solicitados: ${deliverableData.milestoneName}`,
            message: `${deliverableData.clientName} solicita cambios en tu entregable: "${deliverableData.comment}"`,
            actionUrl: `/vendor/projects/${deliverableData.projectId}?tab=files`,
            entityId: milestoneId,
            entityType: 'milestone',
            actorId: deliverableData.clientUserId,
        });
    }

    // ========== MENSAJES ==========

    async notifyMessageReceived(
        recipientId: string,
        messageData: {
            messageId: string;
            conversationId: string;
            senderId: string;
            senderName: string;
            recipientRole: string;
            preview: string;
        }
    ) {
        return await this.createNotification({
            userId: recipientId,
            type: 'MESSAGE_RECEIVED',
            title: `Mensaje de ${messageData.senderName}`,
            message: messageData.preview.substring(0, 100) + (messageData.preview.length > 100 ? '...' : ''),
            actionUrl: `/${messageData.recipientRole}/messages`,
            entityId: messageData.messageId,
            entityType: 'message',
            actorId: messageData.senderId,
        });
    }

    // ========== CALENDAR ==========

    async notifyEventInvitation(
        attendeeId: string,
        eventData: {
            eventId: string;
            title: string;
            creatorId: string;
            creatorName: string;
            dateFormatted: string;
            userRole: string;
        }
    ) {
        return await this.createNotification({
            userId: attendeeId,
            type: 'EVENT_INVITATION',
            title: `Invitación: ${eventData.title}`,
            message: `${eventData.creatorName} te invitó a "${eventData.title}" el ${eventData.dateFormatted}.`,
            actionUrl: `/${eventData.userRole}/calendar`,
            entityId: eventData.eventId,
            entityType: 'event',
            actorId: eventData.creatorId,
        });
    }

    async notifyEventAccepted(
        creatorId: string,
        eventData: {
            eventId: string;
            title: string;
            attendeeId: string;
            attendeeName: string;
            userRole: string;
        }
    ) {
        return await this.createNotification({
            userId: creatorId,
            type: 'EVENT_ACCEPTED',
            title: `Evento aceptado: ${eventData.title}`,
            message: `${eventData.attendeeName} aceptó tu invitación para "${eventData.title}".`,
            actionUrl: `/${eventData.userRole}/calendar`,
            entityId: eventData.eventId,
            entityType: 'event',
            actorId: eventData.attendeeId,
        });
    }

    async notifyEventRejected(
        creatorId: string,
        eventData: {
            eventId: string;
            title: string;
            attendeeId: string;
            attendeeName: string;
            userRole: string;
            reason?: string;
        }
    ) {
        const reasonText = eventData.reason ? ` Motivo: "${eventData.reason}"` : '';
        return await this.createNotification({
            userId: creatorId,
            type: 'EVENT_REJECTED',
            title: `Evento rechazado: ${eventData.title}`,
            message: `${eventData.attendeeName} rechazó tu invitación para "${eventData.title}".${reasonText}`,
            actionUrl: `/${eventData.userRole}/calendar`,
            entityId: eventData.eventId,
            entityType: 'event',
            actorId: eventData.attendeeId,
        });
    }

    async notifyEventProposed(
        creatorId: string,
        eventData: {
            eventId: string;
            title: string;
            proposerId: string;
            proposerName: string;
            proposedDate: string;
            userRole: string;
        }
    ) {
        return await this.createNotification({
            userId: creatorId,
            type: 'EVENT_PROPOSED',
            title: `Propuesta de nueva fecha`,
            message: `${eventData.proposerName} propone ${eventData.proposedDate} para "${eventData.title}".`,
            actionUrl: `/${eventData.userRole}/calendar`,
            entityId: eventData.eventId,
            entityType: 'event',
            actorId: eventData.proposerId,
        });
    }

    async notifyEventReminder(
        userId: string,
        eventData: {
            eventId: string;
            title: string;
            dateFormatted: string;
            userRole: string;
            hoursUntil: number;
        }
    ) {
        const timeText = eventData.hoursUntil < 1 ? 'menos de 1 hora' : `${eventData.hoursUntil} ${eventData.hoursUntil === 1 ? 'hora' : 'horas'}`;
        return await this.createNotification({
            userId,
            type: 'EVENT_REMINDER',
            title: `📅 Recordatorio: ${eventData.title}`,
            message: `Tu evento "${eventData.title}" comienza en ${timeText}.`,
            actionUrl: `/${eventData.userRole}/calendar`,
            entityId: eventData.eventId,
            entityType: 'event',
        });
    }

    // ========== INCIDENCIAS ==========

    async notifyIncidentCreated(
        assigneeId: string,
        incidentData: {
            incidentId: string;
            projectId: string;
            projectTitle: string;
            title: string;
            priority: string;
            reporterId: string;
            reporterName: string;
            userRole: string;
        }
    ) {
        const icon = incidentData.priority === 'CRITICAL' ? '🚨 ' : '';
        return await this.createNotification({
            userId: assigneeId,
            type: incidentData.priority === 'CRITICAL' ? 'INCIDENT_CRITICAL' : 'INCIDENT_CREATED',
            title: `${icon}Nueva incidencia: ${incidentData.title}`,
            message: `${incidentData.reporterName} reportó "${incidentData.title}" en "${incidentData.projectTitle}".`,
            actionUrl: `/${incidentData.userRole}/projects/${incidentData.projectId}`,
            entityId: incidentData.incidentId,
            entityType: 'incident',
            actorId: incidentData.reporterId,
        });
    }

    async notifyIncidentResolved(
        reporterId: string,
        incidentData: {
            incidentId: string;
            projectId: string;
            title: string;
            resolverUserId: string;
            resolverName: string;
            userRole: string;
        }
    ) {
        return await this.createNotification({
            userId: reporterId,
            type: 'INCIDENT_RESOLVED',
            title: `Incidencia resuelta: ${incidentData.title}`,
            message: `${incidentData.resolverName} resolvió la incidencia "${incidentData.title}".`,
            actionUrl: `/${incidentData.userRole}/projects/${incidentData.projectId}`,
            entityId: incidentData.incidentId,
            entityType: 'incident',
            actorId: incidentData.resolverUserId,
        });
    }

    // ========== REVIEWS ==========

    async notifyReviewReceived(
        vendorId: string,
        reviewData: {
            reviewId: string;
            projectId: string;
            projectTitle: string;
            rating: number;
            clientUserId: string;
            clientName: string;
        }
    ) {
        const stars = '⭐'.repeat(reviewData.rating);
        return await this.createNotification({
            userId: vendorId,
            type: 'REVIEW_RECEIVED',
            title: `Nueva review: ${reviewData.projectTitle}`,
            message: `${reviewData.clientName} dejó una review de ${stars} para "${reviewData.projectTitle}".`,
            actionUrl: `/vendor/projects/${reviewData.projectId}`,
            entityId: reviewData.reviewId,
            entityType: 'review',
            actorId: reviewData.clientUserId,
        });
    }

    // ========== FILES & FOLDERS ==========

    async notifyFileUploaded(
        recipientId: string,
        fileData: {
            projectId: string;
            fileName: string;
            folderId?: string;
            folderName?: string;
            uploaderUserId: string;
            uploaderName: string;
        }
    ) {
        const location = fileData.folderName ? ` en "${fileData.folderName}"` : '';
        return await this.createNotification({
            userId: recipientId,
            type: 'FILE_UPLOADED',
            title: `Nuevo archivo subido${location}`,
            message: `${fileData.uploaderName} subió "${fileData.fileName}"${location}.`,
            actionUrl: `/client/projects/${fileData.projectId}`,
            entityId: fileData.folderId || fileData.projectId,
            entityType: 'file',
            actorId: fileData.uploaderUserId,
        });
    }

    async notifyFolderCreated(
        recipientId: string,
        folderData: {
            projectId: string;
            folderName: string;
            creatorUserId: string;
            creatorName: string;
        }
    ) {
        return await this.createNotification({
            userId: recipientId,
            type: 'FOLDER_CREATED',
            title: `Nueva carpeta creada: ${folderData.folderName}`,
            message: `${folderData.creatorName} creó la carpeta "${folderData.folderName}".`,
            actionUrl: `/client/projects/${folderData.projectId}`,
            entityId: folderData.projectId,
            entityType: 'folder',
            actorId: folderData.creatorUserId,
        });
    }

    async notifyFolderUnlocked(
        recipientId: string,
        folderData: {
            projectId: string;
            folderName: string;
            milestoneName: string;
            vendorUserId: string;
        }
    ) {
        return await this.createNotification({
            userId: recipientId,
            type: 'FOLDER_ACCESS',
            title: `Carpeta desbloqueada: ${folderData.folderName}`,
            message: `La carpeta "${folderData.folderName}" del hito "${folderData.milestoneName}" ha sido desbloqueada.`,
            actionUrl: `/client/projects/${folderData.projectId}`,
            entityId: folderData.projectId,
            entityType: 'folder',
            actorId: folderData.vendorUserId,
        });
    }

    async notifyProjectUpdated(
        clientId: string,
        projectData: {
            projectId: string;
            projectTitle: string;
            updateType: string;
            vendorUserId: string;
            vendorName: string;
        }
    ) {
        return await this.createNotification({
            userId: clientId,
            type: 'SYSTEM_REMINDER',
            title: `Proyecto actualizado: ${projectData.updateType}`,
            message: `${projectData.vendorName} actualizó "${projectData.projectTitle}": ${projectData.updateType}.`,
            actionUrl: `/client/projects/${projectData.projectId}`,
            entityId: projectData.projectId,
            entityType: 'project',
            actorId: projectData.vendorUserId,
        });
    }

    // ========== GITHUB ==========

    async notifyGitHubCommit(
        clientId: string,
        commitData: {
            projectId: string;
            projectTitle: string;
            commitHash: string;
            commitMessage: string;
            vendorUserId: string;
        }
    ) {
        return await this.createNotification({
            userId: clientId,
            type: 'GITHUB_COMMIT',
            title: `Nuevo commit en ${commitData.projectTitle}`,
            message: `${commitData.commitMessage.substring(0, 100)}`,
            actionUrl: `/client/projects/${commitData.projectId}`,
            entityId: commitData.commitHash,
            entityType: 'github',
            actorId: commitData.vendorUserId,
        });
    }

    // ========== READ/UNREAD ==========

    async getUserNotifications(
        userId: string,
        options: {
            limit?: number;
            offset?: number;
            isRead?: boolean;
            types?: NotificationType[];
        } = {}
    ) {
        const where: any = { userId };

        if (options.isRead !== undefined) {
            where.isRead = options.isRead;
        }

        if (options.types && options.types.length > 0) {
            where.type = { in: options.types };
        }

        return await prisma.notification.findMany({
            where,
            include: {
                actor: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: options.limit || 20,
            skip: options.offset || 0,
        });
    }

    async getUnreadCount(userId: string): Promise<number> {
        return await prisma.notification.count({
            where: {
                userId,
                isRead: false,
            },
        });
    }

    async markAsRead(notificationId: string, userId: string): Promise<Notification> {
        return await prisma.notification.update({
            where: { id: notificationId, userId },
            data: { isRead: true, readAt: new Date() },
        });
    }

    async markAllAsRead(userId: string): Promise<number> {
        const result = await prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true, readAt: new Date() },
        });
        return result.count;
    }

    async deleteNotification(notificationId: string, userId: string): Promise<void> {
        await prisma.notification.delete({
            where: { id: notificationId, userId },
        });
    }

    async deleteAllRead(userId: string): Promise<number> {
        const result = await prisma.notification.deleteMany({
            where: { userId, isRead: true },
        });
        return result.count;
    }
}

const notificationService = new NotificationService();
export { notificationService };
export default notificationService;
