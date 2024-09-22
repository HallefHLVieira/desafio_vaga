import multer from "multer";
import { Router } from 'express';
import {CreateTransaction, FetchTransactions} from './controllers/transactions';

const transactionsRoutes = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

transactionsRoutes.post('/upload', upload.single('transacoes'), CreateTransaction.handle);

transactionsRoutes.get('/transactions', FetchTransactions.handle);

export {transactionsRoutes};