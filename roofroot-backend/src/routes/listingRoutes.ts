import { Router } from 'express';
import {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  getLegacyListings
} from '../controllers/listingController';
import { authenticateToken, requireAgency } from '../middlewares/auth';

const router = Router();

// Public routes
router.get('/', getListings);
router.get('/:id', getListingById);

// Legacy v1 compatibility route (with deprecation warning)
router.get('/v1/legacy', getLegacyListings);

// Protected routes
router.use(authenticateToken);

// Agency-scoped operations
router.post('/', requireAgency, createListing);
router.patch('/:id', requireAgency, updateListing);
router.delete('/:id', requireAgency, deleteListing);

export default router; 