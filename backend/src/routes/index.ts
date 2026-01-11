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
import profileRoutes from './profile.routes';
import deliverableRoutes from './deliverable.routes';
import subfolderRoutes from './subfolder.routes';
import protectedFolderRoutes from './protected-folder.routes';
import calendarRoutes from './calendar.routes';
import adminRoutes from './admin.routes';
// import escrowRoutes from './escrow.routes'; // Removed

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
router.use('/profile', profileRoutes);
router.use('/deliverables', deliverableRoutes);
router.use('/deliverables', subfolderRoutes);
router.use('/protected-folders', protectedFolderRoutes);
router.use('/calendar', calendarRoutes);
router.use('/admin', adminRoutes);
// router.use('/escrow', escrowRoutes); // Removed - not needed for Phase 1

export default router;
