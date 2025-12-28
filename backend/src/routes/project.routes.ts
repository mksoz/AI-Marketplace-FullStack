import { Router } from 'express';
import { authenticateJWT, authorizeRole } from '../middlewares/auth.middleware';
import { createProject, getMyProjects, requestProject, getVendorRequests, updateRequestStatus } from '../controllers/project.controller';
import { UserRole } from '@prisma/client';

const router = Router();

// Apply Auth Middleware to all routes here
router.use(authenticateJWT);

// Client Routes
router.post('/', authorizeRole([UserRole.CLIENT]), createProject);
router.post('/request', authorizeRole([UserRole.CLIENT]), requestProject);
router.get('/my-projects', authorizeRole([UserRole.CLIENT]), getMyProjects);

// Vendor Routes
router.get('/vendor/requests', authorizeRole([UserRole.VENDOR]), getVendorRequests);
router.patch('/:id/status', authorizeRole([UserRole.VENDOR]), updateRequestStatus);

export default router;
