import express from 'express';
import { getUsers, createUser, toggleUserStatus, deleteUser, updateUser } from '../controllers/userController.js';
import { authenticate, authorizeRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Only SUPER_ADMIN can manage users
router.use(authenticate, authorizeRole(['SUPER_ADMIN']));

router.get('/', getUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.patch('/:id/status', toggleUserStatus);
router.delete('/:id', deleteUser);

export default router;
