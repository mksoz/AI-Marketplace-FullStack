import { Router } from 'express';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { getDispute } from '../controllers/milestone.controller';

const router = Router();

// All routes require authentication
router.use(authenticateJWT);

// Get dispute details (client, vendor, or admin)
router.get('/:id', getDispute);

export default router;
