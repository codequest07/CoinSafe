import express from 'express';
import { getTransactions } from '../controllers/BaseController';

const router = express.Router();

router.get('/transactions', getTransactions);

export default router;
