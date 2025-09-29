import { Router } from 'express';
import { 
  adminLogin,
  agencyLogin,
  customerLogin,
  createAdmin,
  agencyRegister,
  customerRegister,
  getAgencyOnboardingStatus,
  updateAgencyProfile,
  submitVerificationRequest,
  getPendingAgencyVerifications,
  approveAgencyVerification,
  rejectAgencyVerification,
  getMe, 
  changePassword 
} from '../controllers/authController';
import { 
  adminLoginSchema,
  agencyLoginSchema,
  customerLoginSchema,
  adminCreateSchema,
  agencyRegisterSchema,
  customerRegisterSchema,
  agencyProfileUpdateSchema,
  agencyVerificationRequestSchema,
  adminAgencyVerificationSchema,
  adminAgencyRejectionSchema,
  changePasswordSchema 
} from '../validation/auth';
import { validateBody } from '../middlewares/validate';
import { authenticateToken } from '../middlewares/auth';
import { superAdminOnly } from '../middlewares/auth';

const router = Router();

// Public routes - Role-specific only
router.post('/admin/login', validateBody(adminLoginSchema), adminLogin);
router.post('/agency/login', validateBody(agencyLoginSchema), agencyLogin);
router.post('/customer/login', validateBody(customerLoginSchema), customerLogin);

router.post('/agency/register', validateBody(agencyRegisterSchema), agencyRegister);
router.post('/customer/register', validateBody(customerRegisterSchema), customerRegister);

// Protected routes
router.get('/me', authenticateToken, getMe);
router.post('/change-password', authenticateToken, validateBody(changePasswordSchema), changePassword);

// Agency profile management routes
router.get('/agency/onboarding-status', authenticateToken, getAgencyOnboardingStatus);
router.put('/agency/profile', authenticateToken, validateBody(agencyProfileUpdateSchema), updateAgencyProfile);
router.post('/agency/verify-request', authenticateToken, validateBody(agencyVerificationRequestSchema), submitVerificationRequest);

// Super admin only routes
router.post('/admin/create', authenticateToken, superAdminOnly, validateBody(adminCreateSchema), createAdmin);

// Admin verification routes
router.get('/admin/agencies/pending', authenticateToken, getPendingAgencyVerifications);
router.post('/admin/agencies/:agencyId/verify', authenticateToken, validateBody(adminAgencyVerificationSchema), approveAgencyVerification);
router.post('/admin/agencies/:agencyId/reject', authenticateToken, validateBody(adminAgencyRejectionSchema), rejectAgencyVerification);

export default router; 