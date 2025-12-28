
import { Router } from 'express';
import { authenticateJWT, authorizeRole } from '../middlewares/auth.middleware';
import { getContract, signContract, proposeVersion, acceptVersion, rejectVersion, getHistory } from '../controllers/contract.controller';

const router = Router();

router.use(authenticateJWT);

// Both Vendor and Client can access contract
router.get('/:projectId', getContract);
router.post('/:projectId/sign', signContract);

// Negotiation & Versioning
router.get('/:projectId/history', getHistory);
router.post('/:projectId/propose', proposeVersion); // Body: { content, changeMessage }
router.post('/version/:versionId/accept', acceptVersion);
router.post('/version/:versionId/reject', rejectVersion); // Body: { reason }

export default router;
