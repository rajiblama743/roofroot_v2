import { Request, Response, NextFunction } from 'express';
import Listing from '../models/Listings';
import Property from '../models/Properties';
import Agency from '../models/Agencies';
import { IAuthenticatedRequest, IPaginationResponse } from '../types/common';
import { IListingFilters, IListingCreate, IListingUpdate, ILegacyListingResponse } from '../types/listing';
import { NotFoundError, AuthorizationError } from '../utils/errors';
import { parsePaginationQuery, createPaginationResponse, ensureValidPagination } from '../utils/pagination';
import { syncListingDenorm } from '../utils/denormSync';

// Public endpoint - Get listings with search and filters
export const getListings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit } = ensureValidPagination(
      parseInt(req.query.page as string),
      parseInt(req.query.limit as string)
    );
    const { q, status, saleOrLease, featured, agencyId, propertyType, minPrice, maxPrice } = req.query as IListingFilters;

    const query: any = {};

    // Default to active listings for public view
    if (!status) {
      query.status = 'active';
    } else {
      query.status = status;
    }

    // Add search filters
    if (q) {
      query.$or = [
        { 'listingDetails.title': { $regex: q, $options: 'i' } },
        { 'listingDetails.description': { $regex: q, $options: 'i' } },
        { 'denorm.agencyName': { $regex: q, $options: 'i' } },
        { 'denorm.propertyTitle': { $regex: q, $options: 'i' } }
      ];
    }

    if (saleOrLease) {
      query.saleOrLease = saleOrLease;
    }

    if (featured !== undefined) {
      // Handle both string and boolean values
      if (typeof featured === 'string') {
        query['marketing.featured'] = featured === 'true';
      } else {
        query['marketing.featured'] = featured;
      }
    }

    if (agencyId) {
      query.agencyId = agencyId;
    }

    if (propertyType) {
      // This requires a join with Properties collection
      const properties = await Property.find({ propertyType }).distinct('_id');
      query.propertyId = { $in: properties };
    }

    if (minPrice || maxPrice) {
      // This requires a join with Properties collection for market value
      const priceQuery: any = {};
      if (minPrice) priceQuery['marketInfo.marketValue'] = { $gte: Number(minPrice) };
      if (maxPrice) priceQuery['marketInfo.marketValue'] = { $lte: Number(maxPrice) };
      
      const properties = await Property.find(priceQuery).distinct('_id');
      query.propertyId = { $in: properties };
    }

    // Get total count
    const total = await Listing.countDocuments(query);

    // Get listings with pagination
    const listings = await Listing.find(query)
      .populate('propertyId', 'title description propertyType status physicalDetails features media marketInfo')
      .populate('agencyId', 'name slug')
      .populate('agentId', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const response: IPaginationResponse<any> = createPaginationResponse(
      listings,
      page,
      limit,
      total
    );

    res.status(200).json({
      success: true,
      message: 'Listings retrieved successfully',
      data: response
    });
  } catch (error) {
    next(error);
  }
};

// Public endpoint - Get listing by ID
export const getListingById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const listing = await Listing.findById(id)
      .populate('propertyId', 'title description propertyType status physicalDetails features media marketInfo')
      .populate('agencyId', 'name slug description')
      .populate('agentId', 'name email phoneNumber');

    if (!listing) {
      throw new NotFoundError('Listing not found');
    }

    res.status(200).json({
      success: true,
      message: 'Listing retrieved successfully',
      data: listing
    });
  } catch (error) {
    next(error);
  }
};

// Agency-scoped endpoint - Create listing
export const createListing = async (req: IAuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AuthorizationError('Authentication required');
    }

    if (req.user.role !== 'agency') {
      throw new AuthorizationError('Agency access required');
    }

    const listingData: IListingCreate = {
      ...req.body,
      agencyId: req.user.agencyId!
    };

    // Verify property ownership
    const property = await Property.findById(listingData.propertyId);
    if (!property) {
      throw new NotFoundError('Property not found');
    }

    if (property.agencyId.toString() !== req.user.agencyId) {
      throw new AuthorizationError('Property does not belong to your agency');
    }

    const listing = new Listing(listingData);
    await listing.save();

    // Sync denorm data
    await syncListingDenorm((listing._id as any).toString());

    res.status(201).json({
      success: true,
      message: 'Listing created successfully',
      data: listing
    });
  } catch (error) {
    next(error);
  }
};

// Agency-scoped endpoint - Update listing
export const updateListing = async (req: IAuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AuthorizationError('Authentication required');
    }

    const { id } = req.params;
    const updateData: IListingUpdate = req.body;

    const listing = await Listing.findById(id);
    if (!listing) {
      throw new NotFoundError('Listing not found');
    }

    // Check ownership: agency owner or admin
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      if (req.user.role !== 'agency' || listing.agencyId.toString() !== req.user.agencyId) {
        throw new AuthorizationError('Access denied');
      }
    }

    const updatedListing = await Listing.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    // Sync denorm data
    await syncListingDenorm(id);

    res.status(200).json({
      success: true,
      message: 'Listing updated successfully',
      data: updatedListing
    });
  } catch (error) {
    next(error);
  }
};

// Agency-scoped endpoint - Delete listing
export const deleteListing = async (req: IAuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AuthorizationError('Authentication required');
    }

    const { id } = req.params;

    const listing = await Listing.findById(id);
    if (!listing) {
      throw new NotFoundError('Listing not found');
    }

    // Check ownership: agency owner or admin
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      if (req.user.role !== 'agency' || listing.agencyId.toString() !== req.user.agencyId) {
        throw new AuthorizationError('Access denied');
      }
    }

    await Listing.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Listing deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Legacy v1 compatibility endpoint
export const getLegacyListings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Add deprecation header
    res.set('X-Deprecated', 'v1-listings');
    
    // Console warning for developers
    console.warn('DEPRECATED: Using legacy v1 listings endpoint. Please migrate to v2 architecture.');

    const { page, limit } = ensureValidPagination(
      parseInt(req.query.page as string),
      parseInt(req.query.limit as string)
    );
    const { type, q } = req.query;

    const query: any = { status: 'active' };

    if (type) {
      query.saleOrLease = type;
    }

    if (q) {
      query.$or = [
        { 'listingDetails.title': { $regex: q, $options: 'i' } },
        { 'listingDetails.description': { $regex: q, $options: 'i' } }
      ];
    }

    // Get total count
    const total = await Listing.countDocuments(query);

    // Get listings with pagination
    const listings = await Listing.find(query)
      .populate('propertyId', 'title description physicalDetails features media marketInfo')
      .populate('agencyId', 'name')
      .populate('agentId', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Transform to legacy v1 format
    const legacyListings: ILegacyListingResponse[] = listings.map(listing => {
      const property = listing.propertyId as any;
      const agency = listing.agencyId as any;
      const agent = listing.agentId as any;

      return {
        id: (listing._id as any).toString(),
        title: listing.listingDetails.title,
        description: listing.listingDetails.description,
        price: property?.marketInfo?.marketValue || 0,
        location: property?.physicalDetails?.address || '',
        type: listing.saleOrLease,
        images: property?.media?.photos || [],
        bedrooms: property?.features?.bedrooms,
        bathrooms: property?.features?.bathrooms,
        carBay: property?.features?.carBay,
        area: property?.features?.buildingSize,
        createdBy: (agent?._id as any)?.toString() || '',
        createdAt: listing.createdAt,
        updatedAt: listing.updatedAt
      };
    });

    const response = {
      success: true,
      message: 'Legacy v1 listings retrieved successfully',
      data: legacyListings,
      total,
      page,
      limit
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}; 