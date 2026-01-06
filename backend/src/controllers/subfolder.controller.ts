import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get subfolders for a deliverable folder
export const getSubfolders = async (req: Request, res: Response) => {
    try {
        const { folderId } = req.params;
        const userId = req.user!.userId;

        // Ver if user has access to the deliverable folder
        const folder = await prisma.deliverableFolder.findUnique({
            where: { id: folderId },
            include: {
                milestone: {
                    include: {
                        project: {
                            include: {
                                client: true,
                                vendor: true
                            }
                        }
                    }
                }
            }
        });

        if (!folder) {
            return res.status(404).json({ message: 'Folder not found' });
        }

        const isVendor = folder.milestone.project.vendor?.userId === userId;
        const isClient = folder.milestone.project.client.userId === userId;

        if (!isVendor && !isClient) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Get all subfolders for this folder
        const subfolders = await prisma.deliverableSubfolder.findMany({
            where: { folderId },
            orderBy: { createdAt: 'asc' }
        });

        res.json({ subfolders });
    } catch (error: any) {
        console.error('Error fetching subfolders:', error);
        res.status(500).json({ message: error.message || 'Failed to fetch subfolders' });
    }
};

// Create subfolder
export const createSubfolder = async (req: Request, res: Response) => {
    try {
        const { folderId } = req.params;
        const { name, parentId } = req.body;
        const userId = req.user!.userId;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'Folder name is required' });
        }

        // Verify vendor permission
        const folder = await prisma.deliverableFolder.findUnique({
            where: { id: folderId },
            include: {
                milestone: {
                    include: {
                        project: { include: { vendor: true } }
                    }
                }
            }
        });

        if (!folder) {
            return res.status(404).json({ message: 'Deliverable folder not found' });
        }

        if (!folder.milestone.project.vendor || folder.milestone.project.vendor.userId !== userId) {
            return res.status(403).json({ message: 'Only vendor can create subfolders' });
        }

        // If parentId provided, verify it exists and belongs to same folder
        if (parentId) {
            const parentFolder = await prisma.deliverableSubfolder.findUnique({
                where: { id: parentId }
            });

            if (!parentFolder || parentFolder.folderId !== folderId) {
                return res.status(400).json({ message: 'Invalid parent folder' });
            }
        }

        // Create subfolder
        const subfolder = await prisma.deliverableSubfolder.create({
            data: {
                name: name.trim(),
                folderId,
                parentId: parentId || null,
                createdBy: userId
            }
        });

        res.json({ subfolder });
    } catch (error: any) {
        console.error('Error creating subfolder:', error);
        res.status(500).json({ message: error.message || 'Failed to create subfolder' });
    }
};

// Rename subfolder
export const renameSubfolder = async (req: Request, res: Response) => {
    try {
        const { subfolderId } = req.params;
        const { name } = req.body;
        const userId = req.user!.userId;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'Folder name is required' });
        }

        // Get subfolder with permissions check
        const subfolder = await prisma.deliverableSubfolder.findUnique({
            where: { id: subfolderId },
            include: {
                folder: {
                    include: {
                        milestone: {
                            include: {
                                project: { include: { vendor: true } }
                            }
                        }
                    }
                }
            }
        });

        if (!subfolder) {
            return res.status(404).json({ message: 'Subfolder not found' });
        }

        if (!subfolder.folder.milestone.project.vendor || subfolder.folder.milestone.project.vendor.userId !== userId) {
            return res.status(403).json({ message: 'Only vendor can rename subfolders' });
        }

        // Update name
        const updated = await prisma.deliverableSubfolder.update({
            where: { id: subfolderId },
            data: { name: name.trim() }
        });

        res.json({ subfolder: updated });
    } catch (error: any) {
        console.error('Error renaming subfolder:', error);
        res.status(500).json({ message: error.message || 'Failed to rename subfolder' });
    }
};

// Delete subfolder (cascades to children)
export const deleteSubfolder = async (req: Request, res: Response) => {
    try {
        const { subfolderId } = req.params;
        const userId = req.user!.userId;

        // Get subfolder with permissions check
        const subfolder = await prisma.deliverableSubfolder.findUnique({
            where: { id: subfolderId },
            include: {
                folder: {
                    include: {
                        milestone: {
                            include: {
                                project: { include: { vendor: true } }
                            }
                        }
                    }
                }
            }
        });

        if (!subfolder) {
            return res.status(404).json({ message: 'Subfolder not found' });
        }

        if (!subfolder.folder.milestone.project.vendor || subfolder.folder.milestone.project.vendor.userId !== userId) {
            return res.status(403).json({ message: 'Only vendor can delete subfolders' });
        }

        // Delete subfolder (Prisma will cascade delete children due to onDelete: Cascade)
        await prisma.deliverableSubfolder.delete({
            where: { id: subfolderId }
        });

        res.json({ success: true, message: 'Subfolder deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting subfolder:', error);
        res.status(500).json({ message: error.message || 'Failed to delete subfolder' });
    }
};
