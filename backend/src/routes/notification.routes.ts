import { Router } from 'express';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { getNotifications, markAllAsRead, markAsRead } from '../controllers/notification.controller';

const router = Router();

router.use(authenticateJWT);

router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);
router.patch('/read-all', markAllAsRead);

export default router;
