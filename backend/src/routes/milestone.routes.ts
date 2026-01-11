import { Router } from 'express';
import { authenticateJWT } from '../middlewares/auth.middleware';
import {
    startMilestone,
    requestPayment,
    approveMilestone,
    rejectMilestone,
    openDispute
} from '../controllers/milestone.controller';

const router = Router();
console.log('[Routes] Milestone routes loaded');

// All routes require authentication
router.use(authenticateJWT);

// Vendor: Start milestone
router.post('/:id/start', startMilestone);

// Vendor: Request payment approval
router.post('/:id/request-payment', requestPayment);

// Client: Approve deliverables
router.post('/:id/approve', approveMilestone);

// Client: Reject deliverables
router.post('/:id/reject', rejectMilestone);

// Vendor: Open dispute (after 3+ rejections)
router.post('/:id/open-dispute', openDispute);

export default router;
