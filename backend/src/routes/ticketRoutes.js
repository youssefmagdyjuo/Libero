import express from 'express';
import { getTickets, createTicket, updateTicketStatus, addComment, updateTicket, deleteTicket, getTicketById } from '../controllers/ticketController.js';
import { authenticate, authorizeRole } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getTickets);
router.get('/:id', getTicketById);
router.post('/', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'voice', maxCount: 1 }]), createTicket);
router.put('/:id', updateTicket);
router.delete('/:id', deleteTicket);
router.put('/:id/status', updateTicketStatus);
router.post('/:id/comments', addComment);

export default router;
