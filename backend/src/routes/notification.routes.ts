import { Router } from 'express';
import {
    getNotificationPreferences,
    updateNotificationPreferences
} from '../controllers/notification.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.get('/preferences', authenticateJWT, getNotificationPreferences);
router.patch('/preferences', authenticateJWT, updateNotificationPreferences);

export default router;
