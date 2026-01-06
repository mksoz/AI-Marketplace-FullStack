import { Router } from 'express';
import {
    getClientProfile,
    updateClientProfile,
    uploadLogo,
    getVendorProfile,
    updateVendorProfile,
    uploadVendorLogo
} from '../controllers/profile.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.get('/client-profile', authenticateJWT, getClientProfile);
router.patch('/client-profile', authenticateJWT, updateClientProfile);
router.post('/client-profile/logo', authenticateJWT, uploadLogo);

router.get('/vendor-profile', authenticateJWT, getVendorProfile);
router.patch('/vendor-profile', authenticateJWT, updateVendorProfile);
router.post('/vendor-profile/logo', authenticateJWT, uploadVendorLogo);

export default router;
