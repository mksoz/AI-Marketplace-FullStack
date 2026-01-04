import { Router } from 'express';
import {
    getAccountBalance,
    depositMoney,
    getTransactionHistory,
    getVendorFinanceSummary
} from '../controllers/account.controller';
import { authenticateJWT as authenticate } from '../middlewares/auth.middleware';
import * as accountController from '../controllers/account.controller';
import { authenticateJWT as authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.get('/balance', authMiddleware, accountController.getAccountBalance);
router.post('/deposit', authMiddleware, accountController.depositMoney);
router.get('/transactions', authMiddleware, accountController.getTransactionHistory);
router.get('/vendor-summary', authMiddleware, accountController.getVendorFinanceSummary);
router.get('/client-summary', authMiddleware, accountController.getClientFundsSummary);

export default router;
