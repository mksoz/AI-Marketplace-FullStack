import { Router } from 'express';
import { authenticateJWT, authorizeRole } from '../middlewares/auth.middleware';
import { createProject, getMyProjects, requestProject, getVendorRequests, updateRequestStatus, setupProject, getProjectTracking } from '../controllers/project.controller';
import { syncRepository, getRepositoryInfo, refreshCommits, unlinkRepository } from '../controllers/github.controller';
import { UserRole } from '@prisma/client';

const router = Router();

// Apply Auth Middleware to all routes here
router.use(authenticateJWT);

// Shared Routes
router.get('/:id/tracking', getProjectTracking);

// Client Routes
router.post('/', authorizeRole([UserRole.CLIENT]), createProject);
router.post('/request', authorizeRole([UserRole.CLIENT]), requestProject);
router.get('/my-projects', authorizeRole([UserRole.CLIENT, UserRole.VENDOR]), getMyProjects);

// Vendor Routes
router.get('/vendor/requests', authorizeRole([UserRole.VENDOR]), getVendorRequests);
router.patch('/:id/status', authorizeRole([UserRole.VENDOR]), updateRequestStatus);
router.post('/:id/setup', authorizeRole([UserRole.VENDOR]), setupProject);

// Incidents & Reviews
import { createIncident, updateIncident, createReview } from '../controllers/project.controller';
router.post('/incidents', createIncident);
router.put('/incidents/:id', updateIncident);
router.post('/reviews', createReview);

// GitHub Repository Routes
router.post('/:projectId/github/sync', syncRepository);
router.get('/:projectId/github', getRepositoryInfo);
router.post('/:projectId/github/refresh', refreshCommits);
router.delete('/:projectId/github', unlinkRepository);

export default router;
