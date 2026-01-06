import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';
import { v4 as uuid } from 'uuid';

const UPLOAD_DIR = path.join(__dirname, '../../uploads');
const THUMBNAIL_DIR = path.join(UPLOAD_DIR, 'thumbnails');

// Ensure directories exist on server start
export const initializeStorage = async () => {
    try {
        await fs.mkdir(UPLOAD_DIR, { recursive: true });
        await fs.mkdir(THUMBNAIL_DIR, { recursive: true });
        console.log('✓ Storage directories initialized');
    } catch (error) {
        console.error('Failed to initialize storage:', error);
    }
};

// Multer storage configuration
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        try {
            // Get milestoneId from URL params
            const milestoneId = (req.params as any).milestoneId;

            if (!milestoneId) {
                return cb(new Error('milestoneId is required in route params'), '');
            }

            // Simple structure: uploads/milestones/{milestoneId}
            const dir = path.join(UPLOAD_DIR, 'milestones', milestoneId);
            await fs.mkdir(dir, { recursive: true });
            cb(null, dir);
        } catch (error: any) {
            cb(error, '');
        }
    },
    filename: (req, file, cb) => {
        const fileId = uuid();
        const ext = path.extname(file.originalname);
        cb(null, `${fileId}${ext}`);
    }
});

// File filter for security
const fileFilter = (req: any, file: any, cb: any) => {
    const allowedTypes = [
        // Images
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
        // Documents
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        // Archives
        'application/zip',
        'application/x-zip-compressed',
        'application/x-rar-compressed',
        'application/x-7z-compressed',
        // Text
        'text/plain',
        'text/csv',
        'text/html',
        'text/css',
        'application/json',
        // Code
        'application/javascript',
        'application/typescript',
        'text/x-python'
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}`), false);
    }
};

// Multer upload middleware
export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit for MVP
    }
});

// Generate thumbnail for images
export const generateThumbnail = async (filePath: string, outputPath: string): Promise<boolean> => {
    try {
        await sharp(filePath)
            .resize(300, 300, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .jpeg({ quality: 80 })
            .toFile(outputPath);

        return true;
    } catch (error) {
        console.error('Thumbnail generation failed:', error);
        return false;
    }
};

// Helper: Get file URL for download
export const getFileUrl = (storagePath: string): string => {
    // Encode slashes to double underscores for URL safety
    const encoded = storagePath.replace(/\//g, '__');
    return `/api/deliverables/files/download/${encoded}`;
};

// Helper: Get thumbnail URL
export const getThumbnailUrl = (thumbnailPath: string): string => {
    const encoded = thumbnailPath.replace(/\//g, '__');
    return `/api/deliverables/files/thumbnail/${encoded}`;
};

// Helper: Format file size
export const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

// Helper: Check if mime type is image
export const isImageMimeType = (mimeType: string): boolean => {
    return mimeType.startsWith('image/');
};

// Delete file from storage
export const deleteFile = async (storagePath: string): Promise<void> => {
    try {
        const filePath = path.join(UPLOAD_DIR, storagePath);
        await fs.unlink(filePath);
    } catch (error) {
        console.error('Failed to delete file:', error);
    }
};

// Delete thumbnail
export const deleteThumbnail = async (thumbnailPath: string): Promise<void> => {
    try {
        const filePath = path.join(UPLOAD_DIR, thumbnailPath);
        await fs.unlink(filePath);
    } catch (error) {
        console.error('Failed to delete thumbnail:', error);
    }
};
