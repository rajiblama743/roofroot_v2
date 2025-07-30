import { Router } from 'express';
import { register, login, validateRegistration, validateLogin, deleteUser } from '../controllers/authController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { requireDeleteUserPermission } from '../middlewares/roleMiddleware';

const router = Router();

// Public registration endpoint (customers only)
router.post('/register', validateRegistration, register);

// Public login endpoint
router.post('/login', validateLogin, login);

// Delete user endpoint (requires authentication and authorization)
router.delete('/delete/:user_id', authenticateToken, requireDeleteUserPermission, deleteUser);

export default router; 