import express from 'express';
import { authenticate, authorizeRole } from '../middleware/authMiddleware.js';
import {
    getTicketsByStatus,
    getTicketsByType,
    getAvgResolutionTime
} from '../controllers/analyticsController.js';

const router = express.Router();

router.use(authenticate);
router.use(authorizeRole(['SUPER_ADMIN', 'IT_ADMIN']));

router.get('/tickets/status', getTicketsByStatus);
router.get('/tickets/type', getTicketsByType);
router.get('/tickets/avg-resolution-time', getAvgResolutionTime);

export default router;
