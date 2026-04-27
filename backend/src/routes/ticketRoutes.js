import express from 'express';
import { getTickets, createTicket, updateTicketStatus, addComment } from '../controllers/ticketController.js';
import { authenticate, authorizeRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getTickets);
router.post('/', createTicket);
router.put('/:id/status', updateTicketStatus);
router.post('/:id/comments', addComment);

export default router;
