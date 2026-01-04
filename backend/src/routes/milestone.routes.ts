import { Router } from 'express';
import {
    completeMilestone,
    requestPayment,
    getProjectPaymentRequests,
    approvePaymentRequest,
    rejectPaymentRequest
} from '../controllers/milestone.controller';
import { authenticateJWT as authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Milestone completion and payment requests
router.post('/:id/complete', authenticate, completeMilestone);
router.post('/:id/request-payment', authenticate, requestPayment);

// Payment requests (by project)
router.get('/payment-requests/project/:projectId', authenticate, getProjectPaymentRequests);
router.post('/payment-requests/:id/approve', authenticate, approvePaymentRequest);
router.post('/payment-requests/:id/reject', authenticate, rejectPaymentRequest);

export default router;
