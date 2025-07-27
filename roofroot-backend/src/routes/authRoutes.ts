import { Router } from 'express';
import { register, login, validateRegistration, validateLogin } from '../controllers/authController';

const router = Router();

// Public registration endpoint (customers only)
router.post('/register', validateRegistration, register);

// Public login endpoint
router.post('/login', validateLogin, login);

export default router; 