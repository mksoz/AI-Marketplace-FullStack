import { Router } from 'express';
import { register, login, getMe, updateMe } from '../controllers/auth.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateJWT, getMe);
router.patch('/me', authenticateJWT, updateMe);

export default router;
