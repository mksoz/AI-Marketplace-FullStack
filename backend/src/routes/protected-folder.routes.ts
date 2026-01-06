import express from 'express';
import { authenticateJWT } from '../middlewares/auth.middleware';
import {
    getProtectedFolders,
    createProtectedFolder,
    updateProtectedFolder,
    deleteProtectedFolder
} from '../controllers/protected-folder.controller';

const router = express.Router();

// All routes require authentication
router.use(authenticateJWT);

router.get('/', getProtectedFolders);
router.post('/', createProtectedFolder);
router.patch('/:folderId', updateProtectedFolder);
router.delete('/:folderId', deleteProtectedFolder);

export default router;
