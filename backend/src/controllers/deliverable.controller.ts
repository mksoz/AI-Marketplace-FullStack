import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import {
    generateThumbnail,
    getFileUrl,
    getThumbnailUrl,
    isImageMimeType,
    deleteFile,
    deleteThumbnail
} from '../services/file-upload.service';

const prisma = new PrismaClient();
const UPLOAD_DIR = path.join(__dirname, '../../uploads');

// Get deliverable folder for milestone
export const getMilestoneDeliverables = async (req: Request, res: Response) => {
    try {
        const { milestoneId } = req.params;
        const userId = req.user!.userId;

        const milestone = await prisma.milestone.findUnique({
            where: { id: milestoneId },
            include: {
                project: {
                    include: {
                        client: true,
                        vendor: true
                    }
                },
                deliverableFolders: {
                    include: {
                        files: {
                            where: { isLatest: true },
                            orderBy: { uploadedAt: 'desc' }
                        },
                        subfolders: {
                            orderBy: { createdAt: 'asc' }
                        }
                    }
                }
            }
        });

        if (!milestone) {
            return res.status(404).json({ message: 'Milestone not found' });
        }

        const isVendor = milestone.project.vendor?.userId === userId;
        const isClient = milestone.project.client.userId === userId;

        if (!isVendor && !isClient) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Get specific folder if requested
        const folderId = req.query.folderId as string;
        let folder;

        if (folderId) {
            folder = await prisma.deliverableFolder.findUnique({
                where: { id: folderId },
                include: {
                    files: {
                        where: { isLatest: true },
                        orderBy: { uploadedAt: 'desc' }
                    },
                    subfolders: {
                        orderBy: { createdAt: 'asc' }
                    }
                }
            });

            // Verify folder belongs to milestone
            if (folder && folder.milestoneId !== milestoneId) {
                return res.status(400).json({ message: 'Folder does not belong to this milestone' });
            }
        } else {
            // Default to primary folder
            folder = await prisma.deliverableFolder.findFirst({
                where: { milestoneId },
                include: {
                    files: {
                        where: { isLatest: true },
                        orderBy: { uploadedAt: 'desc' }
                    },
                    subfolders: {
                        orderBy: { createdAt: 'asc' }
                    }
                }
            });
        }

        // Create primary folder if doesn't exist and no specific folder requested
        if (!folder && !folderId) {
            folder = await prisma.deliverableFolder.create({
                data: { milestoneId, name: "Carpeta Principal", status: "PENDING" },
                include: {
                    files: true,
                    subfolders: true
                }
            });
        }

        if (!folder) {
            return res.status(404).json({ message: 'Folder not found' });
        }

        // Vendor always has full access
        if (isVendor) {
            const filesWithUrls = folder.files.map((f: any) => ({
                ...f,
                fileSize: Number(f.fileSize),
                downloadUrl: getFileUrl(f.storagePath),
                thumbnailUrl: f.thumbnailPath ? getThumbnailUrl(f.thumbnailPath) : null
            }));

            return res.json({
                folder: {
                    ...folder,
                    totalSize: Number(folder.totalSize),
                    files: filesWithUrls,
                    subfolders: folder.subfolders || []
                },
                fullAccess: true
            });
        }

        // Client: access based on status
        if (folder.status === 'UNLOCKED') {
            const filesWithUrls = folder.files.map((f: any) => ({
                ...f,
                fileSize: Number(f.fileSize),
                downloadUrl: getFileUrl(f.storagePath),
                thumbnailUrl: f.thumbnailPath ? getThumbnailUrl(f.thumbnailPath) : null
            }));

            return res.json({
                folder: {
                    ...folder,
                    totalSize: Number(folder.totalSize),
                    files: filesWithUrls,
                    subfolders: folder.subfolders || []
                },
                fullAccess: true
            });
        } else {
            // Limited view: metadata + thumbnails only
            const limitedFiles = folder.files.map((f: any) => ({
                id: f.id,
                filename: f.filename,
                originalName: f.originalName,
                fileSize: Number(f.fileSize),
                mimeType: f.mimeType,
                uploadedAt: f.uploadedAt,
                thumbnailUrl: f.thumbnailPath ? getThumbnailUrl(f.thumbnailPath) : null,
                previewAvailable: f.previewAvailable
            }));

            return res.json({
                folder: {
                    id: folder.id,
                    status: folder.status,
                    totalFiles: folder.totalFiles,
                    totalSize: Number(folder.totalSize),
                    files: limitedFiles,
                    subfolders: folder.subfolders || []
                },
                fullAccess: false,
                message: 'Files will be unlocked after payment approval'
            });
        }
    } catch (error: any) {
        console.error('Error fetching deliverables:', error);
        res.status(500).json({ message: error.message || 'Failed to fetch deliverables' });
    }
};

// Upload file to deliverable folder
export const uploadDeliverable = async (req: Request, res: Response) => {
    try {
        const { milestoneId } = req.params;
        const userId = req.user!.userId;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: 'No file provided' });
        }

        // Verify vendor permission
        const milestone = await prisma.milestone.findUnique({
            where: { id: milestoneId },
            include: {
                project: { include: { vendor: true, client: true } }
            }
        });

        if (!milestone) {
            return res.status(404).json({ message: 'Milestone not found' });
        }

        if ((!milestone.project.vendor || milestone.project.vendor.userId !== userId) && milestone.project.client.userId !== userId) {
            return res.status(403).json({ message: 'Unauthorized: Only vendor or client can upload deliverables' });
        }

        // Get folderId from body if provided (for specific protected folders)
        const folderId = req.body.folderId;
        let folder;

        if (folderId) {
            folder = await prisma.deliverableFolder.findUnique({
                where: { id: folderId }
            });

            // Should also verify folder belongs to milestone if needed, but for now we trust the folder lookup
            if (folder && folder.milestoneId !== milestoneId) {
                return res.status(400).json({ message: 'Folder does not belong to this milestone' });
            }
        } else {
            // Get or create primary folder (fallback for backward compatibility)
            folder = await prisma.deliverableFolder.findFirst({
                where: { milestoneId }
            });
        }

        if (!folder) {
            if (folderId) {
                return res.status(404).json({ message: 'Folder not found' });
            }
            // Only create default if looking by milestoneId
            folder = await prisma.deliverableFolder.create({
                data: { milestoneId, name: "Carpeta Principal", status: 'IN_PROGRESS' }
            });
        } else if (folder.status === 'PENDING') {
            await prisma.deliverableFolder.update({
                where: { id: folder.id },
                data: { status: 'IN_PROGRESS' }
            });
        }

        // Calculate storage path relative to uploads directory
        const storagePath = path.relative(UPLOAD_DIR, file.path).replace(/\\/g, '/');

        // Generate thumbnail if image
        const isImage = isImageMimeType(file.mimetype);
        let thumbnailPath = null;

        if (isImage) {
            const thumbFilename = `thumb_${path.basename(file.filename)}`;
            const thumbPath = path.join(path.dirname(file.path), thumbFilename);
            const success = await generateThumbnail(file.path, thumbPath);

            if (success) {
                thumbnailPath = path.relative(UPLOAD_DIR, thumbPath).replace(/\\/g, '/');
            }
        }

        // Get subfolderId if provided
        const subfolderId = req.body.subfolderId || null;

        // Save to database
        const deliverableFile = await prisma.deliverableFile.create({
            data: {
                folderId: folder.id,
                subfolderId,
                filename: file.filename,
                originalName: file.originalname,
                fileSize: file.size,
                mimeType: file.mimetype,
                storagePath,
                thumbnailPath,
                previewAvailable: isImage,
                uploadedBy: userId
            }
        });

        // Update folder metadata
        await prisma.deliverableFolder.update({
            where: { id: folder.id },
            data: {
                totalFiles: { increment: 1 },
                totalSize: { increment: file.size }
            }
        });

        res.json({
            success: true,
            file: {
                ...deliverableFile,
                fileSize: Number(deliverableFile.fileSize),
                downloadUrl: getFileUrl(storagePath),
                thumbnailUrl: thumbnailPath ? getThumbnailUrl(thumbnailPath) : null
            }
        });
    } catch (error: any) {
        console.error('Error uploading deliverable:', error);
        res.status(500).json({ message: error.message || 'Failed to upload file' });
    }
};

// Download file (with permission check)
export const downloadFile = async (req: Request, res: Response) => {
    try {
        const { encodedPath } = req.params;
        const userId = req.user!.userId;

        const storagePath = encodedPath.replace(/__/g, '/');

        // Find file
        const file = await prisma.deliverableFile.findFirst({
            where: { storagePath },
            include: {
                folder: {
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
                }
            }
        });

        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        const project = file.folder.milestone.project;
        const isVendor = project.vendor?.userId === userId;
        const isClient = project.client.userId === userId;
        const isUnlocked = file.folder.status === 'UNLOCKED';

        // Check permissions
        if (!isVendor && !(isClient && isUnlocked)) {
            return res.status(403).json({ message: 'File locked until payment approval' });
        }

        // Serve file
        const filePath = path.join(UPLOAD_DIR, storagePath);
        res.download(filePath, file.originalName);
    } catch (error: any) {
        console.error('Error downloading file:', error);
        res.status(500).json({ message: error.message || 'Failed to download file' });
    }
};

// Download thumbnail (always allowed for preview)
export const downloadThumbnail = async (req: Request, res: Response) => {
    try {
        const { encodedPath } = req.params;
        const thumbnailPath = encodedPath.replace(/__/g, '/');

        const filePath = path.join(UPLOAD_DIR, thumbnailPath);
        res.sendFile(filePath);
    } catch (error: any) {
        console.error('Error serving thumbnail:', error);
        res.status(404).json({ message: 'Thumbnail not found' });
    }
};

// Delete deliverable file
export const deleteDeliverable = async (req: Request, res: Response) => {
    try {
        const { fileId } = req.params;
        const userId = req.user!.userId;

        const file = await prisma.deliverableFile.findUnique({
            where: { id: fileId },
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

        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Only vendor can delete
        if (file.folder.milestone.project.vendor?.userId !== userId) {
            return res.status(403).json({ message: 'Only vendor can delete files' });
        }

        // Delete from filesystem
        await deleteFile(file.storagePath);
        if (file.thumbnailPath) {
            await deleteThumbnail(file.thumbnailPath);
        }

        // Update folder metadata
        await prisma.deliverableFolder.update({
            where: { id: file.folderId },
            data: {
                totalFiles: { decrement: 1 },
                totalSize: { decrement: Number(file.fileSize) }
            }
        });

        // Delete from database
        await prisma.deliverableFile.delete({
            where: { id: fileId }
        });

        res.json({ success: true, message: 'File deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting file:', error);
        res.status(500).json({ message: error.message || 'Failed to delete file' });
    }
};


// Download all files in a folder (or root) as ZIP
export const downloadAll = async (req: Request, res: Response) => {
    try {
        const { milestoneId } = req.params;
        const { folderId } = req.query;
        const userId = req.user!.userId;

        // Verify milestone and access
        const milestone = await prisma.milestone.findUnique({
            where: { id: milestoneId },
            include: {
                project: {
                    include: {
                        client: true,
                        vendor: true
                    }
                }
            }
        });

        if (!milestone) return res.status(404).json({ message: 'Milestone not found' });

        const isVendor = milestone.project.vendor?.userId === userId;
        const isClient = milestone.project.client.userId === userId;

        if (!isVendor && !isClient) return res.status(403).json({ message: 'Unauthorized' });

        // Identify target folders (DeliverableFolder)
        let targetFolders: any[] = [];

        if (folderId) {
            const folder = await prisma.deliverableFolder.findUnique({
                where: { id: folderId as string }
            });

            if (!folder) return res.status(404).json({ message: 'Folder not found' });
            if (folder.milestoneId !== milestoneId) return res.status(400).json({ message: 'Folder mismatch' });

            if (isClient && folder.status !== 'UNLOCKED') {
                return res.status(403).json({ message: 'Folder is locked' });
            }
            targetFolders = [folder];
        } else {
            // All folders in milestone
            const allFolders = await prisma.deliverableFolder.findMany({
                where: { milestoneId }
            });

            targetFolders = isClient
                ? allFolders.filter(f => f.status === 'UNLOCKED')
                : allFolders;
        }

        if (targetFolders.length === 0) {
            return res.status(404).json({ message: 'No accessible files found' });
        }

        // Initialize Archiver
        const archiver = require('archiver');
        const archive = archiver('zip', { zlib: { level: 9 } });

        const zipName = folderId
            ? `${targetFolders[0].name.replace(/[^a-z0-9]/gi, '_')}.zip`
            : `Entregables_Hito_${milestone.order}.zip`;

        res.attachment(zipName);
        archive.pipe(res);

        // Process each root folder
        for (const folder of targetFolders) {
            const rootFolderName = folder.name;

            // Fetch all subfolders for path construction
            const subfolders = await prisma.deliverableSubfolder.findMany({
                where: { folderId: folder.id }
            });

            const subfolderMap = new Map(subfolders.map(s => [s.id, s]));

            // Helper to get relative path for a subfolder
            const getSubfolderPath = (subId: string | null): string => {
                if (!subId) return '';
                const sub = subfolderMap.get(subId);
                if (!sub) return '';

                const parentPath = sub.parentId ? getSubfolderPath(sub.parentId) : '';
                return path.join(parentPath, sub.name);
            };

            // Fetch all files in this folder (including those in subfolders)
            const files = await prisma.deliverableFile.findMany({
                where: {
                    folderId: folder.id,
                    isLatest: true
                }
            });

            for (const file of files) {
                const subfolderPath = file.subfolderId ? getSubfolderPath(file.subfolderId) : '';

                const zipPath = path.join(rootFolderName, subfolderPath, file.originalName);
                const fsPath = path.join(UPLOAD_DIR, file.storagePath);

                try {
                    archive.file(fsPath, { name: zipPath });
                } catch (e) {
                    // Ignore missing files
                }
            }
        }

        await archive.finalize();

    } catch (error: any) {
        console.error('Download all error:', error);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Download failed' });
        }
    }
};
