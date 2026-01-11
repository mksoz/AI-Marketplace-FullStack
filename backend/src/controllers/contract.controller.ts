
import { Request, Response } from 'express';
import { PrismaClient, ProjectStatus } from '@prisma/client';
import { notificationService } from '../services/notification.service';

const prisma = new PrismaClient();

// Get Contract
export const getContract = async (req: Request, res: Response) => {
    const { projectId } = req.params;
    try {
        const contract = await prisma.contract.findUnique({ where: { projectId } });
        res.json(contract); // Null if not exists
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching contract" });
    }
};

// Propose a new Contract Version
export const proposeVersion = async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const { content, changeMessage } = req.body;
    const user = req.user;

    if (!user) return res.status(403).json({ message: "Unauthorized" });

    try {
        let contract = await prisma.contract.findUnique({ where: { projectId } });

        // Lazy Creation: If contract doesn't exist, create it (if project exists and user is authorized)
        if (!contract) {
            const project = await prisma.project.findUnique({ where: { id: projectId } });
            if (!project) return res.status(404).json({ message: "Project not found" });

            // Only Vendor or Client involved in project can create the contract
            // (Assuming simplified check here, or reusing middleware)
            // For now, allow creation if they have access to the route (which is authenticated)
            // Ideally check project.vendorId or project.clientId matches user's profile

            contract = await prisma.contract.create({
                data: {
                    projectId,
                    status: 'NEGOTIATING',
                    content: content || '',
                    // activeVersionId will be set after version creation
                }
            });
        }

        // Get latest version number
        const lastVersion = await prisma.contractVersion.findFirst({
            where: { contractId: contract.id },
            orderBy: { versionNumber: 'desc' }
        });
        const nextVersionNumber = (lastVersion?.versionNumber || 0) + 1;

        const newVersion = await prisma.contractVersion.create({
            data: {
                contractId: contract.id,
                versionNumber: nextVersionNumber,
                content,
                changeMessage: changeMessage || (nextVersionNumber === 1 ? 'Creación inicial del contrato' : 'Actualización'),
                createdBy: user.userId,
                status: 'PROPOSED'
            }
        });

        // If it's the very first version, we might want to set it as active immediately OR keep it as proposed?
        // Usually, the first version proposed by Vendor is the "draft".
        // Let's set it as active so the viewer sees something, assuming Vendor "accepts" their own draft initially?
        // OR simpler: Just link it so it's not null.
        if (nextVersionNumber === 1) {
            await prisma.contract.update({
                where: { id: contract.id },
                data: {
                    activeVersionId: newVersion.id,
                    content: newVersion.content
                }
            });
            // Auto-accept the first version? NO, user might want to edit.
            // But for "lazy creation", it usually implies "Here is the first draft".
        }

        // Update contract status to NEGOTIATING if not already
        if (contract.status !== 'NEGOTIATING' && contract.status !== 'SIGNED') {
            await prisma.contract.update({
                where: { id: contract.id },
                data: { status: 'NEGOTIATING' }
            });
        }

        res.status(201).json(newVersion);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error proposing version" });
    }
};

// Accept a Version
export const acceptVersion = async (req: Request, res: Response) => {
    const { versionId } = req.params;
    const user = req.user;

    if (!user) return res.status(403).json({ message: "Unauthorized" });

    try {
        const version = await prisma.contractVersion.findUnique({ where: { id: versionId } });
        if (!version) return res.status(404).json({ message: "Version not found" });

        // Update version status
        const updatedVersion = await prisma.contractVersion.update({
            where: { id: versionId },
            data: { status: 'ACCEPTED' }
        });

        // Update Contract active version and main content mirror
        await prisma.contract.update({
            where: { id: version.contractId },
            data: {
                activeVersionId: version.id,
                content: version.content, // Mirror content
                status: 'NEGOTIATING' // Ensure it's active
            }
        });

        // Reject all other PROPOSED versions for this contract (optional cleanup)
        // await prisma.contractVersion.updateMany(...)

        res.json(updatedVersion);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error accepting version" });
    }
};

// Reject a Version
export const rejectVersion = async (req: Request, res: Response) => {
    const { versionId } = req.params;
    const { reason } = req.body;

    try {
        const version = await prisma.contractVersion.update({
            where: { id: versionId },
            data: { status: 'REJECTED' } // We could store rejection reason in a separate field or reuse changeMessage
        });
        res.json(version);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error rejecting version" });
    }
};

// Get History
export const getHistory = async (req: Request, res: Response) => {
    const { projectId } = req.params;
    try {
        const contract = await prisma.contract.findUnique({
            where: { projectId },
            include: {
                versions: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        });
        if (!contract) return res.status(404).json({ message: "Contract not found" });
        res.json(contract.versions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching history" });
    }
};

// Sign Contract (Modified to check for active version and update version fields)
export const signContract = async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const user = req.user;

    if (!user) return res.status(403).json({ message: "Unauthorized" });

    try {
        const contract = await prisma.contract.findUnique({
            where: { projectId },
            include: {
                project: { include: { client: true, vendor: true } },
                // Get the latest version (PROPOSED or ACCEPTED)
                versions: { orderBy: { versionNumber: 'desc' }, take: 1 }
            }
        });

        if (!contract) return res.status(404).json({ message: "Contract not found" });

        // Get the latest version (for signing)
        const latestVersion = contract.versions[0];

        if (!latestVersion) {
            return res.status(400).json({ message: "No contract version available to sign" });
        }

        // Auto-transition version to ACCEPTED if it was PROPOSED or DRAFT
        if (latestVersion.status === 'PROPOSED' || latestVersion.status === 'DRAFT') {
            await prisma.contractVersion.update({
                where: { id: latestVersion.id },
                data: { status: 'ACCEPTED' }
            });
        }

        const versionIdToSign = latestVersion.id;

        const updateData: any = {};
        const versionUpdateData: any = {};

        let notificationTargetUserId = "";
        let notificationTitle = "";
        let notificationMessage = "";

        // Determine who signed and prepare notification for the OTHER party
        if (user.role === 'CLIENT') {
            updateData.clientSigned = true;
            updateData.clientSignedAt = new Date();
            versionUpdateData.clientSignedAt = new Date();

            // Notify Vendor
            notificationTargetUserId = contract.project.vendor?.userId || "";
            notificationTitle = "Cliente ha firmado el contrato";
            notificationMessage = `El cliente ha firmado el contrato para el proyecto "${contract.project.title}". Esperando tu firma o finalización.`;
        } else if (user.role === 'VENDOR') {
            updateData.vendorSigned = true;
            updateData.vendorSignedAt = new Date();
            versionUpdateData.vendorSignedAt = new Date();

            // Notify Client
            notificationTargetUserId = contract.project.client.userId;
            notificationTitle = "Proveedor ha firmado el contrato";
            notificationMessage = `El proveedor ha firmado el contrato para el proyecto "${contract.project.title}". Por favor, firma para comenzar.`;
        } else {
            return res.status(403).json({ message: "Invalid role for signing" });
        }

        // 1. Update the Contract Model (Main Record)
        await prisma.contract.update({
            where: { id: contract.id },
            data: updateData
        });

        // 2. Update the Specific Version (Audit Trail)
        await prisma.contractVersion.update({
            where: { id: versionIdToSign },
            data: versionUpdateData
        });

        // 3. Re-fetch contract to get complete state after update
        const updatedContract = await prisma.contract.findUnique({
            where: { id: contract.id },
            include: { project: { include: { client: true, vendor: true } } }
        });

        if (!updatedContract) {
            return res.status(500).json({ message: "Error fetching updated contract" });
        }

        // Send Single Signature Notification using notificationService
        if (notificationTargetUserId && updatedContract.status !== 'SIGNED') {
            try {
                const signerName = user.role === 'CLIENT'
                    ? (updatedContract.project.client.companyName || 'Client')
                    : (updatedContract.project.vendor?.companyName || 'Vendor');

                await notificationService.notifyContractSigned(
                    notificationTargetUserId,
                    {
                        contractId: contract.id,
                        projectId: updatedContract.projectId,
                        projectTitle: updatedContract.project.title,
                        signerUserId: user.userId,
                        signerName,
                        signerRole: user.role
                    }
                );
            } catch (notifError) {
                console.error('Failed to send contract signature notification:', notifError);
            }
        }

        // Check if both signed -> Move Project to ACCEPTED
        if (updatedContract.clientSigned && updatedContract.vendorSigned) {
            console.log('[CONTRACT] Both parties have signed! Transitioning to ACCEPTED');

            await prisma.contract.update({
                where: { id: contract.id },
                data: { status: 'SIGNED' }
            });

            // Transition Project to PENDING_SETUP (awaiting vendor configuration)
            await prisma.project.update({
                where: { id: contract.projectId },
                data: { status: ProjectStatus.PENDING_SETUP }
            });

            // Notify BOTH of Success
            await prisma.notification.create({
                data: {
                    userId: contract.project.client.userId,
                    title: "¡Contrato Firmado!",
                    message: `Ambas partes han firmado el contrato de "${contract.project.title}". El vendor configurará el proyecto próximamente.`,
                    type: 'SYSTEM_SUCCESS'
                }
            });

            if (contract.project.vendor?.userId) {
                await prisma.notification.create({
                    data: {
                        userId: contract.project.vendor.userId,
                        title: "⚙️ Configura tu Proyecto",
                        message: `Has firmado el contrato de "${contract.project.title}". Por favor, configura los hitos y fechas del proyecto para comenzar.`,
                        type: 'ACTION_REQUIRED'
                    }
                });
            }

            // Return with SIGNED status indicator
            return res.json({ ...updatedContract, status: 'SIGNED' });
        }

        res.json(updatedContract);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error signing contract" });
    }
};
