import { Router } from 'express';
import {
    getMilestoneDeliverables,
    uploadDeliverable,
    downloadFile,
    downloadThumbnail,
    deleteDeliverable,
    downloadAll
} from '../controllers/deliverable.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { upload } from '../services/file-upload.service';

const router = Router();

// Get deliverables for a milestone
router.get('/milestones/:milestoneId/deliverables', authenticateJWT, getMilestoneDeliverables);

// Download all files (ZIP)
router.get('/milestones/:milestoneId/download-all', authenticateJWT, downloadAll);

// Upload deliverable file
router.post(
    '/milestones/:milestoneId/deliverables',
    authenticateJWT,
    (req, res, next) => {
        // Add projectId from milestone to req.body for multer
        upload.single('file')(req, res, (err) => {
            if (err) {
                return res.status(400).json({ message: err.message });
            }
            next();
        });
    },
    uploadDeliverable
);

// Download file (protected)
router.get('/files/download/:encodedPath', authenticateJWT, downloadFile);

// Download thumbnail (allowed for preview)
router.get('/files/thumbnail/:encodedPath', authenticateJWT, downloadThumbnail);

// Delete deliverable
router.delete('/files/:fileId', authenticateJWT, deleteDeliverable);

export default router;
