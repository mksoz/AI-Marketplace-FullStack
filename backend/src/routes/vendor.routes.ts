import { Router } from 'express';
import { getVendors, getVendorById } from '../controllers/vendor.controller';

const router = Router();

router.get('/', getVendors);
router.get('/:id', getVendorById);

export default router;
