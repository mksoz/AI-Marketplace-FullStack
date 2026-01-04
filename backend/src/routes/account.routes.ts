import { Router } from 'express';
import {
    getAccountBalance,
    depositMoney,
    getTransactionHistory
} from '../controllers/account.controller';
import { authenticateJWT as authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get('/balance', authenticate, getAccountBalance);
router.post('/deposit', authenticate, depositMoney);
router.get('/transactions', authenticate, getTransactionHistory);

export default router;
