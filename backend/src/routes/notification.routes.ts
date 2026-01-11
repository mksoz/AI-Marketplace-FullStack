import { Router } from 'express';
import { authenticateJWT } from '../middlewares/auth.middleware';
import {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
} from '../controllers/notification.controller';

const router = Router();

router.use(authenticateJWT);

// GET
router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);

// PATCH
router.patch('/:id/read', markAsRead);
router.patch('/mark-all-read', markAllAsRead);

// DELETE
router.delete('/:id', deleteNotification);
router.delete('/clear-read', deleteAllRead);

export default router;
