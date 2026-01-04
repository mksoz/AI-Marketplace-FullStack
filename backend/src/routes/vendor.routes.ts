import { Router } from 'express';
import { getVendors, getVendorById, toggleSaveVendor, getMyVendors, getMyClients } from '../controllers/vendor.controller';
import { authenticateJWT as authenticate, extractUser } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', extractUser, getVendors);
router.get('/my-vendors', authenticate, getMyVendors); // Must be before /:id
router.get('/my-clients', authenticate, getMyClients); // NEW: Get vendor's clients
router.get('/:id', getVendorById);
router.post('/:id/save', authenticate, toggleSaveVendor);

export default router;
