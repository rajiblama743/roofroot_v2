import { Router } from 'express';
import {
  register,
  login,
  deleteUser,
  requestAgency,
  validateRegistration,
  validateLogin
} from '../controllers/authController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { requireOwnershipOrAdmin } from '../middlewares/roleMiddleware';

const router = Router();

// Public routes (no authentication required)
router.post('/register', validateRegistration, register); // Register new customer
router.post('/login', validateLogin, login); // Login
router.post('/request-agency', validateRegistration, requestAgency); // Agency request

// Protected routes (authentication required)
router.use(authenticateToken);

// Routes with ownership checks
router.delete('/users/:user_id', requireOwnershipOrAdmin, deleteUser); // Delete user (own account or admin)

export default router; 