import { Request, Response, NextFunction } from 'express';
import Listing from '../models/Listing';

// Middleware to check if user is agency (for creating listings)
export const requireAgencyRole = (req: any, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
    return;
  }

  if (req.user.role !== 'agency') {
    res.status(403).json({
      success: false,
      message: 'Only agencies can perform this action'
    });
    return;
  }

  next();
};

// Middleware to check if user owns the listing (for updates)
export const requireListingOwnership = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const listingId = req.params.id;
    const userId = req.user._id.toString();

    const listing = await Listing.findById(listingId);
    if (!listing) {
      res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
      return;
    }

    // Check if user is the creator
    if (listing.createdBy.toString() !== userId) {
      res.status(403).json({
        success: false,
        message: 'You can only modify your own listings'
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Listing ownership check error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while checking listing ownership'
    });
  }
};

// Middleware to check if user can delete listing (creator or admin)
export const requireDeletePermission = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const listingId = req.params.id;
    const userId = req.user._id.toString();
    const userRole = req.user.role;

    const listing = await Listing.findById(listingId);
    if (!listing) {
      res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
      return;
    }

    // Check if user is the creator or admin
    const isCreator = listing.createdBy.toString() === userId;
    const isAdmin = userRole === 'admin';

    if (!isCreator && !isAdmin) {
      res.status(403).json({
        success: false,
        message: 'You can only delete your own listings or must be an admin'
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Delete permission check error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while checking delete permissions'
    });
  }
};

// Middleware to check if listing exists
export const checkListingExists = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const listingId = req.params.id;

    const listing = await Listing.findById(listingId);
    if (!listing) {
      res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
      return;
    }

    // Attach listing to request for use in subsequent middleware/controllers
    (req as any).listing = listing;
    next();
  } catch (error) {
    console.error('Listing existence check error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while checking listing'
    });
  }
}; 