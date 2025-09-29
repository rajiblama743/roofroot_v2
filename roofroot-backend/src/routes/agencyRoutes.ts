import { Router } from 'express';
import {
  getAgencies,
  getAgencyBySlug
} from '../controllers/agencyController';

const router = Router();

// Public routes - View verified agencies only
router.get('/', getAgencies);
router.get('/:slug', getAgencyBySlug);

export default router;
