import { Router } from 'express';
import { 
  adminLogin,
  agencyLogin,
  customerLogin,
  adminRegister,
  agencyRegister,
  customerRegister,
  getMe, 
  changePassword 
} from '../controllers/authController';
import { 
  adminLoginSchema,
  agencyLoginSchema,
  customerLoginSchema,
  adminRegisterSchema,
  agencyRegisterSchema,
  customerRegisterSchema,
  changePasswordSchema 
} from '../validation/auth';
import { validateBody } from '../middlewares/validate';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

// Public routes - Role-specific only
router.post('/admin/login', validateBody(adminLoginSchema), adminLogin);
router.post('/agency/login', validateBody(agencyLoginSchema), agencyLogin);
router.post('/customer/login', validateBody(customerLoginSchema), customerLogin);

router.post('/admin/register', validateBody(adminRegisterSchema), adminRegister);
router.post('/agency/register', validateBody(agencyRegisterSchema), agencyRegister);
router.post('/customer/register', validateBody(customerRegisterSchema), customerRegister);

// Protected routes
router.get('/me', authenticateToken, getMe);
router.post('/change-password', authenticateToken, validateBody(changePasswordSchema), changePassword);

export default router; 