import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /protected-folders?projectId=xxx
export const getProtectedFolders = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.query;
        const userId = req.user!.userId;

        if (!projectId) {
            return res.status(400).json({ message: 'projectId is required' });
        }

        // Get project to verify access
        const project = await prisma.project.findUnique({
            where: { id: projectId as string },
            include: {
                client: true,
                vendor: true
            }
        });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const isVendor = project.vendor?.userId === userId;
        const isClient = project.client.userId === userId;

        if (!isVendor && !isClient) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Get all protected folders for this project's milestones
        const folders = await prisma.deliverableFolder.findMany({
            where: {
                milestone: {
                    projectId: projectId as string
                }
            },
            include: {
                milestone: {
                    select: {
                        id: true,
                        title: true,
                        order: true,
                        status: true
                    }
                },
                _count: {
                    select: {
                        files: true,
                        subfolders: true
                    }
                }
            },
            orderBy: [
                { milestone: { order: 'asc' } },
                { createdAt: 'asc' }
            ]
        });

        // Filter for clients: NOW clients can see all folders (locked and unlocked)
        // But they can only download from unlocked ones (handled in frontend/download controller)
        const visibleFolders = folders;

        // Format response
        const formatted = visibleFolders.map(f => ({
            ...f,
            totalSize: Number(f.totalSize),
            fileCount: f._count.files,
            subfolderCount: f._count.subfolders
        }));

        res.json(sanitizeResponse({ folders: formatted, isVendor }));
    } catch (error: any) {
        console.error('Error fetching protected folders:', error);
        res.status(500).json({ message: error.message || 'Failed to fetch folders' });
    }
};

// Helper to handle BigInt serialization
const sanitizeResponse = (data: any) => {
    return JSON.parse(JSON.stringify(data, (key, value) =>
        typeof value === 'bigint'
            ? Number(value)
            : value
    ));
};

// POST /protected-folders
export const createProtectedFolder = async (req: Request, res: Response) => {
    try {
        const { milestoneId, name, projectId } = req.body;
        const userId = req.user!.userId;

        if (!milestoneId || !name || !projectId) {
            return res.status(400).json({ message: 'milestoneId, name, and projectId are required' });
        }

        // Verify milestone exists and belongs to project
        const milestone = await prisma.milestone.findUnique({
            where: { id: milestoneId },
            include: {
                project: {
                    include: {
                        vendor: true
                    }
                }
            }
        });

        if (!milestone) {
            return res.status(404).json({ message: 'Milestone not found' });
        }

        if (milestone.projectId !== projectId) {
            return res.status(400).json({ message: 'Milestone does not belong to this project' });
        }

        // Verify vendor owns this project
        if (milestone.project.vendor?.userId !== userId) {
            return res.status(403).json({ message: 'Only vendor can create folders' });
        }

        // Determine initial status based on milestone
        const initialStatus = (milestone.status === 'COMPLETED' || milestone.status === 'PAID')
            ? 'UNLOCKED'
            : 'PENDING';

        // Create folder
        const folder = await prisma.deliverableFolder.create({
            data: {
                milestoneId,
                name: name.trim(),
                status: initialStatus
            },
            include: {
                milestone: {
                    select: {
                        id: true,
                        title: true,
                        order: true,
                        status: true
                    }
                }
            }
        });

        res.status(201).json(sanitizeResponse({ folder }));
    } catch (error: any) {
        console.error('Error creating protected folder:', error);
        res.status(500).json({ message: error.message || 'Failed to create folder' });
    }
};

// PATCH /protected-folders/:folderId
export const updateProtectedFolder = async (req: Request, res: Response) => {
    try {
        const { folderId } = req.params;
        const { name } = req.body;
        const userId = req.user!.userId;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'name is required' });
        }

        // Get folder with project info
        const folder = await prisma.deliverableFolder.findUnique({
            where: { id: folderId },
            include: {
                milestone: {
                    include: {
                        project: {
                            include: {
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

        // Verify vendor owns this project
        if (folder.milestone.project.vendor?.userId !== userId) {
            return res.status(403).json({ message: 'Only vendor can update folders' });
        }

        // Update folder
        const updated = await prisma.deliverableFolder.update({
            where: { id: folderId },
            data: {
                name: name.trim()
            }
        });

        res.json(sanitizeResponse({ folder: updated }));
    } catch (error: any) {
        console.error('Error updating protected folder:', error);
        res.status(500).json({ message: error.message || 'Failed to update folder' });
    }
};

// DELETE /protected-folders/:folderId
export const deleteProtectedFolder = async (req: Request, res: Response) => {
    try {
        const { folderId } = req.params;
        const userId = req.user!.userId;

        // Get folder with project info
        const folder = await prisma.deliverableFolder.findUnique({
            where: { id: folderId },
            include: {
                milestone: {
                    include: {
                        project: {
                            include: {
                                vendor: true
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        files: true,
                        subfolders: true
                    }
                }
            }
        });

        if (!folder) {
            return res.status(404).json({ message: 'Folder not found' });
        }

        // Verify vendor owns this project
        if (folder.milestone.project.vendor?.userId !== userId) {
            return res.status(403).json({ message: 'Only vendor can delete folders' });
        }

        // Delete folder (cascade will handle files and subfolders)
        await prisma.deliverableFolder.delete({
            where: { id: folderId }
        });

        res.json({ message: 'Folder deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting protected folder:', error);
        res.status(500).json({ message: error.message || 'Failed to delete folder' });
    }
};
