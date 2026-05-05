import express from 'express';
import {
    getTickets,
    createTicket,
    exportTickets,
    updateTicketStatus,
    addComment,
    updateTicketComment,
    deleteTicketComment,
    updateTicket,
    deleteTicket,
    getTicketById,
    getTicketComments
} from '../controllers/ticketController.js';
import { authenticate, authorizeRole } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getTickets);
router.get('/export', authorizeRole(['SUPER_ADMIN', 'IT_ADMIN']), exportTickets);
router.get('/:id/ticket-comments', getTicketComments);
router.get('/:id', getTicketById);
router.post('/', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'voice', maxCount: 1 }]), createTicket);
router.put('/:id', updateTicket);
router.delete('/:id', deleteTicket);
router.put('/:id/status', authorizeRole(['SUPER_ADMIN', 'IT_ADMIN']), updateTicketStatus);
router.post('/:id/comments', addComment);
router.patch('/:id/comments/:commentId', updateTicketComment);
router.delete('/:id/comments/:commentId', deleteTicketComment);

export default router;
