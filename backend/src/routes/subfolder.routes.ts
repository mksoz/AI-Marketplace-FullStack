import express from 'express';
import { authenticateJWT } from '../middlewares/auth.middleware';
import {
    getSubfolders,
    createSubfolder,
    renameSubfolder,
    deleteSubfolder
} from '../controllers/subfolder.controller';

const router = express.Router();

// All routes require authentication
router.use(authenticateJWT);

// Get subfolders for a deliverable folder
router.get('/folders/:folderId/subfolders', getSubfolders);

// Create subfolder
router.post('/folders/:folderId/subfolders', createSubfolder);

// Rename subfolder
router.patch('/subfolders/:subfolderId', renameSubfolder);

// Delete subfolder
router.delete('/subfolders/:subfolderId', deleteSubfolder);

export default router;
