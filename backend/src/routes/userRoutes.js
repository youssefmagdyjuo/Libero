import express from 'express';
import {
    getUsers,
    createUser,
    toggleUserStatus,
    deleteUser,
    updateUser,
    updateMyAvatar
} from '../controllers/userController.js';
import { authenticate, authorizeRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Auth required for all user routes
router.use(authenticate);

// Profile (any logged in user)
router.put('/me/avatar', updateMyAvatar);

// Only SUPER_ADMIN can manage users
router.use(authorizeRole(['SUPER_ADMIN']));

router.get('/', getUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.patch('/:id/status', toggleUserStatus);
router.delete('/:id', deleteUser);

export default router;
