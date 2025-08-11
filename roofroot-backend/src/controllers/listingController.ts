import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import Listing, { IListing } from '../models/Listing';
import { CreateListingRequest, UpdateListingRequest, AuthenticatedListingRequest } from '../types/listing';

// Validation rules for creating listings
export const validateCreateListing = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 20, max: 2000 })
    .withMessage('Description must be between 20 and 2000 characters'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('location')
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Location must be between 5 and 500 characters'),
  body('type')
    .isIn(['sale', 'lease'])
    .withMessage('Type must be either sale or lease'),
  body('bedrooms')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Bedrooms must be a non-negative integer'),
  body('bathrooms')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Bathrooms must be a non-negative integer'),
  body('carBay')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Car Bay must be a non-negative integer'),
  body('area')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Area must be a positive number'),
  body('images')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Images must be an array with maximum 10 items'),
  body('images.*')
    .optional()
    .isURL()
    .withMessage('Each image must be a valid URL')
];

// Validation rules for updating listings
export const validateUpdateListing = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 20, max: 2000 })
    .withMessage('Description must be between 20 and 2000 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('location')
    .optional()
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Location must be between 5 and 500 characters'),
  body('type')
    .optional()
    .isIn(['sale', 'lease'])
    .withMessage('Type must be either sale or lease'),
  body('images')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Images must be an array with maximum 10 items'),
  body('images.*')
    .optional()
    .isURL()
    .withMessage('Each image must be a valid URL')
];

// Create listing (agency only)
export const createListing = async (req: AuthenticatedListingRequest, res: Response): Promise<void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(err => `${err.type === 'field' ? err.path : 'unknown'}: ${err.msg}`)
      });
      return;
    }

    const { 
      title, 
      description, 
      price, 
      location, 
      type, 
      images = [],
      bedrooms,
      bathrooms,
      carBay,
      area
    }: CreateListingRequest = req.body;
    const userId = req.user!._id.toString();

    // Create new listing with all fields
    const listing = new Listing({
      title,
      description,
      price,
      location,
      type,
      images,
      bedrooms: bedrooms || undefined,
      bathrooms: bathrooms || undefined,
      carBay: carBay || undefined,
      area: area || undefined,
      createdBy: userId
    });

    await listing.save();

    // Populate creator info (excluding sensitive data)
    await listing.populate('createdBy', 'name email agencyName');

    res.status(201).json({
      success: true,
      message: 'Listing created successfully',
      listing
    });
  } catch (error) {
    console.error('Create listing error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while creating listing'
    });
  }
};

// Get all listings (public)
export const getAllListings = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate and sanitize pagination parameters
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const type = req.query.type as string;
    const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined;
    const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined;
    const search = req.query.search as string;

    // Build query
    const query: any = {};
    
    if (type && ['sale', 'lease'].includes(type)) {
      query.type = type;
    }
    
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined && !isNaN(minPrice)) query.price.$gte = minPrice;
      if (maxPrice !== undefined && !isNaN(maxPrice)) query.price.$lte = maxPrice;
    }
    
    if (search) {
      query.$text = { $search: search };
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Execute query with pagination and performance optimizations
    const listings = await Listing.find(query)
      .populate('createdBy', 'name email agencyName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Listing.countDocuments(query);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;

    res.status(200).json({
      success: true,
      message: 'Listings retrieved successfully',
      items: listings, // Consistent with pagination contract
      listings, // Keep for backward compatibility
      total,
      page,
      limit,
      totalPages,
      hasMore
    });
  } catch (error) {
    console.error('Get all listings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving listings'
    });
  }
};

// Get listing by ID (public)
export const getListingById = async (req: Request, res: Response): Promise<void> => {
  try {
    const listingId = req.params.id;

    const listing = await Listing.findById(listingId)
      .populate('createdBy', 'name email agencyName');

    if (!listing) {
      res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Listing retrieved successfully',
      listing
    });
  } catch (error) {
    console.error('Get listing by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving listing'
    });
  }
};

// Update listing (only creator can update)
export const updateListing = async (req: AuthenticatedListingRequest, res: Response): Promise<void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(err => err.msg)
      });
      return;
    }

    const listingId = req.params.id;
    const updateData: UpdateListingRequest = req.body;
    const userId = req.user!._id.toString();

    // Check if listing exists
    const existingListing = await Listing.findById(listingId);
    if (!existingListing) {
      res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
      return;
    }

    // Check if user is the creator (only creator can update)
    if (existingListing.createdBy.toString() !== userId) {
      res.status(403).json({
        success: false,
        message: 'You can only update your own listings'
      });
      return;
    }

    // Update listing
    const updatedListing = await Listing.findByIdAndUpdate(
      listingId,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email agencyName');

    if (!updatedListing) {
      res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Listing updated successfully',
      listing: updatedListing
    });
  } catch (error) {
    console.error('Update listing error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while updating listing'
    });
  }
};

// Delete listing (creator or admin only)
export const deleteListing = async (req: AuthenticatedListingRequest, res: Response): Promise<void> => {
  try {
    const listingId = req.params.id;
    const userId = req.user!._id.toString();
    const userRole = req.user!.role;

    // Check if listing exists
    const existingListing = await Listing.findById(listingId);
    if (!existingListing) {
      res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
      return;
    }

    // Check if user is the creator or admin
    const isCreator = existingListing.createdBy.toString() === userId;
    const isAdmin = userRole === 'admin';

    if (!isCreator && !isAdmin) {
      res.status(403).json({
        success: false,
        message: 'You can only delete your own listings or must be an admin'
      });
      return;
    }

    // Delete listing
    await Listing.findByIdAndDelete(listingId);

    res.status(200).json({
      success: true,
      message: 'Listing deleted successfully'
    });
  } catch (error) {
    console.error('Delete listing error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while deleting listing'
    });
  }
};

// Get listings by creator (for agency dashboard)
export const getMyListings = async (req: AuthenticatedListingRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id.toString();
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));

    const skip = (page - 1) * limit;

    const listings = await Listing.find({ createdBy: userId })
      .populate('createdBy', 'name email agencyName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(); // Use lean() for better performance

    const total = await Listing.countDocuments({ createdBy: userId });
    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;

    res.status(200).json({
      success: true,
      message: 'Your listings retrieved successfully',
      items: listings, // Consistent with pagination contract
      listings, // Keep for backward compatibility
      total,
      page,
      limit,
      totalPages,
      hasMore
    });
  } catch (error) {
    console.error('Get my listings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving your listings'
    });
  }
}; 

// Get listings by agency name (public)
export const getListingsByAgency = async (req: Request, res: Response): Promise<void> => {
  try {
    const agencyName = decodeURIComponent(req.params.agencyName);
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 12));

    const skip = (page - 1) * limit;

    // First, find users that match the agency name
    const User = require('../models/User').default;
    
    const matchingUsers = await User.find({
      $or: [
        { agencyName: { $regex: agencyName, $options: 'i' } },
        { name: { $regex: agencyName, $options: 'i' } }
      ]
    }).select('_id name agencyName email phoneNumber agencyDescription address');

    if (matchingUsers.length === 0) {
      // No users found with this agency name
      res.status(200).json({
        success: true,
        message: 'Agency listings retrieved successfully',
        items: [], // Consistent with pagination contract
        listings: [], // Keep for backward compatibility
        agencyInfo: null,
        total: 0,
        page,
        limit,
        totalPages: 0,
        hasMore: false
      });
      return;
    }

    // Get user IDs that match
    const userIds = matchingUsers.map((user: any) => user._id);

    // Find listings created by these users
    const query = { createdBy: { $in: userIds } };

    // Execute query with pagination
    const listings = await Listing.find(query)
      .populate('createdBy', 'name email agencyName phoneNumber agencyDescription address')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(); // Use lean() for better performance

    // Get total count for pagination
    const total = await Listing.countDocuments(query);
    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;

    // Get agency info from the first matching user (even if no listings)
    let agencyInfo = null;
    if (matchingUsers.length > 0) {
      const user = matchingUsers[0];
      agencyInfo = {
        name: user.name,
        agencyName: user.agencyName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        agencyDescription: user.agencyDescription,
        address: user.address
      };
    }

    res.status(200).json({
      success: true,
      message: 'Agency listings retrieved successfully',
      items: listings, // Consistent with pagination contract
      listings, // Keep for backward compatibility
      agencyInfo,
      total,
      page,
      limit,
      totalPages,
      hasMore
    });
  } catch (error) {
    console.error('Get listings by agency error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving agency listings'
    });
  }
}; 