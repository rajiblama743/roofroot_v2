import { Router } from 'express';
import {
  getAgencies,
  getAgencyBySlug,
  createAgency,
  updateAgency,
  deleteAgency,
  verifyAgency
} from '../controllers/agencyController';
import { authenticateToken, requireAdmin, requireAgency } from '../middlewares/auth';
import { z } from 'zod';

const router = Router();

// Public routes (with uniform gating)
router.get('/', getAgencies);
router.get('/:slug', getAgencyBySlug);

// Protected routes
router.use(authenticateToken);

// Agency management (admin only)
router.post('/', requireAdmin, createAgency);
router.patch('/:id', requireAgency, updateAgency);
router.delete('/:id', requireAgency, deleteAgency);

// Admin verification
router.patch('/:id/verify', requireAdmin, verifyAgency);

export default router;
