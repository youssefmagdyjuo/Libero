import express from 'express';
import { authenticate, authorizeRole } from '../middleware/authMiddleware.js';
import { getMonthlyPdfReport } from '../controllers/reportController.js';

const router = express.Router();

router.use(authenticate);
router.use(authorizeRole(['SUPER_ADMIN', 'IT_ADMIN']));

router.get('/monthly', getMonthlyPdfReport);

export default router;
