import { Router } from 'express';
import { getVendors, getVendorById, toggleSaveVendor, getMyVendors } from '../controllers/vendor.controller';
import { authenticateJWT as authenticate, extractUser } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', extractUser, getVendors);
router.get('/my-vendors', authenticate, getMyVendors); // Must be before /:id
router.get('/:id', getVendorById);
router.post('/:id/save', authenticate, toggleSaveVendor);

export default router;
