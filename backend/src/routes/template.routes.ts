import { Router } from 'express';
import { authenticateJWT, authorizeRole } from '../middlewares/auth.middleware';
import { createTemplate, getMyTemplates, updateTemplate, deleteTemplate } from '../controllers/template.controller';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticateJWT);

router.post('/', authorizeRole([UserRole.VENDOR]), createTemplate);
router.get('/', authorizeRole([UserRole.VENDOR]), getMyTemplates);
router.put('/:id', authorizeRole([UserRole.VENDOR]), updateTemplate);
router.delete('/:id', authorizeRole([UserRole.VENDOR]), deleteTemplate);

export default router;
