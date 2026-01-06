import { Router } from 'express';
import {
    register,
    login,
    getMe,
    updateMe,
    changePassword,
    getSessions,
    revokeSession
} from '../controllers/auth.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateJWT, getMe);
router.patch('/me', authenticateJWT, updateMe);
router.post('/me/password', authenticateJWT, changePassword);
router.get('/me/sessions', authenticateJWT, getSessions);
router.delete('/me/sessions/:sessionId', authenticateJWT, revokeSession);

export default router;
