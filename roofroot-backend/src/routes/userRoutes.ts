import { Router } from 'express';
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  searchAgencies,
  updateUserStatus,
  validateCreateUser,
  validateUpdateUser
} from '../controllers/userController';
import { authenticateToken } from '../middlewares/authMiddleware';
import {
  requireAdmin,
  requireOwnershipOrAdmin,
  requireOwnershipOrAdminForUpdate,
  requireDeleteUserPermissionById
} from '../middlewares/roleMiddleware';

const router = Router();

// Public routes (no authentication required)
router.get('/search/agencies', searchAgencies); // Search agencies (public)

// All other user routes require authentication
router.use(authenticateToken);

// Admin-only routes
router.post('/', requireAdmin, validateCreateUser, createUser); // Create any user (admin only)
router.get('/', requireAdmin, getAllUsers); // Get all users (admin only)
router.delete('/:id', requireDeleteUserPermissionById, deleteUser); // Delete user (admin or own account)
router.patch('/:id/status', requireAdmin, updateUserStatus); // Update user status (admin only)

// Routes with ownership checks
router.get('/:id', requireOwnershipOrAdmin, getUserById); // Get user (own profile or admin)
router.put('/:id', requireOwnershipOrAdminForUpdate, validateUpdateUser, updateUser); // Update user (own profile or admin)

export default router; 