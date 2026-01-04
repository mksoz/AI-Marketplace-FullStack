import { Router } from 'express';
import vendorRoutes from './vendor.routes';
import authRoutes from './auth.routes';
import projectRoutes from './project.routes';

import templateRoutes from './template.routes';
import chatRoutes from './chat.routes';
import contractRoutes from './contract.routes';

import notificationRoutes from './notification.routes';
import milestoneRoutes from './milestone.routes';
import accountRoutes from './account.routes';

const router = Router();

router.use('/vendors', vendorRoutes);
router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/templates', templateRoutes);
router.use('/chats', chatRoutes);
router.use('/contracts', contractRoutes);
router.use('/notifications', notificationRoutes);
router.use('/milestones', milestoneRoutes);
router.use('/accounts', accountRoutes);

export default router;
