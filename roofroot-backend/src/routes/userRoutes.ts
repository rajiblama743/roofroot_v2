import { Router } from 'express';
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
} from '../controllers/userController';

const router = Router();

// User routes
router.post('/', createUser);           // Create a new user
router.get('/', getAllUsers);           // Get all users
router.get('/:id', getUserById);        // Get user by ID
router.put('/:id', updateUser);        // Update user by ID
router.delete('/:id', deleteUser);     // Delete user by ID

export default router; 