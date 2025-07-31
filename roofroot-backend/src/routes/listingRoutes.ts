import { Router } from 'express';
import {
  createListing,
  getAllListings,
  getListingById,
  updateListing,
  deleteListing,
  getMyListings,
  validateCreateListing,
  validateUpdateListing
} from '../controllers/listingController';
import { authenticateToken } from '../middlewares/authMiddleware';
import {
  requireAgencyRole,
  requireListingOwnership,
  requireDeletePermission
} from '../middlewares/listingMiddleware';

const router = Router();

// Public routes (no authentication required)
router.get('/', getAllListings); // Get all listings with filtering and pagination
router.get('/:id', getListingById); // Get single listing by ID

// Protected routes (authentication required)
router.use(authenticateToken); // Apply authentication to all routes below

// Agency-only routes
router.post('/', requireAgencyRole, validateCreateListing, createListing); // Create listing (agency only)
router.get('/my/listings', requireAgencyRole, getMyListings); // Get agency's own listings

// Routes with ownership checks
router.put('/:id', requireListingOwnership, validateUpdateListing, updateListing); // Update listing (creator only)
router.delete('/:id', requireDeletePermission, deleteListing); // Delete listing (creator or admin)

export default router; 