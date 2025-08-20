import { Request, Response, NextFunction } from 'express';
import Property from '../models/Properties';
import Agency from '../models/Agencies';
import { IAuthenticatedRequest, IPaginationResponse } from '../types/common';
import { IPropertyFilters, IPropertyCreate, IPropertyUpdate } from '../types/property';
import { NotFoundError, AuthorizationError } from '../utils/errors';
import { parsePaginationQuery, createPaginationResponse, ensureValidPagination } from '../utils/pagination';
import { syncPropertyTitleDenorm } from '../utils/denormSync';

// Public endpoint - Get properties with search and filters
export const getProperties = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit } = ensureValidPagination(
      parseInt(req.query.page as string),
      parseInt(req.query.limit as string)
    );
    const { q, propertyType, status, minPrice, maxPrice, location, amenities } = req.query as IPropertyFilters;

    const query: any = {};

    // Add search filters
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { 'physicalDetails.address': { $regex: q, $options: 'i' } }
      ];
    }

    if (propertyType) {
      query.propertyType = propertyType;
    }

    if (status) {
      query.status = status;
    }

    if (minPrice || maxPrice) {
      query['marketInfo.marketValue'] = {};
      if (minPrice) query['marketInfo.marketValue'].$gte = Number(minPrice);
      if (maxPrice) query['marketInfo.marketValue'].$lte = Number(maxPrice);
    }

    if (location?.near) {
      query['physicalDetails.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: location.near.coordinates
          },
          $maxDistance: location.maxDistance || 10000 // Default 10km
        }
      };
    }

    if (amenities && Array.isArray(amenities)) {
      query['features.amenities'] = { $in: amenities };
    }

    // Get total count
    const total = await Property.countDocuments(query);

    // Get properties with pagination
    const properties = await Property.find(query)
      .populate('agencyId', 'name slug')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const response: IPaginationResponse<any> = createPaginationResponse(
      properties,
      page,
      limit,
      total
    );

    res.status(200).json({
      success: true,
      message: 'Properties retrieved successfully',
      data: response
    });
  } catch (error) {
    next(error);
  }
};

// Public endpoint - Get property by ID
export const getPropertyById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const property = await Property.findById(id)
      .populate('agencyId', 'name slug description');

    if (!property) {
      throw new NotFoundError('Property not found');
    }

    res.status(200).json({
      success: true,
      message: 'Property retrieved successfully',
      data: property
    });
  } catch (error) {
    next(error);
  }
};

// Agency-scoped endpoint - Create property
export const createProperty = async (req: IAuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AuthorizationError('Authentication required');
    }

    if (req.user.role !== 'agency') {
      throw new AuthorizationError('Agency access required');
    }

    const propertyData: IPropertyCreate = {
      ...req.body,
      agencyId: req.user.agencyId!
    };

    const property = new Property(propertyData);
    await property.save();

    res.status(201).json({
      success: true,
      message: 'Property created successfully',
      data: property
    });
  } catch (error) {
    next(error);
  }
};

// Agency-scoped endpoint - Update property
export const updateProperty = async (req: IAuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AuthorizationError('Authentication required');
    }

    const { id } = req.params;
    const updateData: IPropertyUpdate = req.body;

    const property = await Property.findById(id);
    if (!property) {
      throw new NotFoundError('Property not found');
    }

    // Check ownership: agency owner or admin
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      if (req.user.role !== 'agency' || property.agencyId.toString() !== req.user.agencyId) {
        throw new AuthorizationError('Access denied');
      }
    }

    const updatedProperty = await Property.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    // Sync denorm data if title changed
    if (updateData.title && updateData.title !== property.title) {
      await syncPropertyTitleDenorm(id, updateData.title);
    }

    res.status(200).json({
      success: true,
      message: 'Property updated successfully',
      data: updatedProperty
    });
  } catch (error) {
    next(error);
  }
};

// Agency-scoped endpoint - Delete property
export const deleteProperty = async (req: IAuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AuthorizationError('Authentication required');
    }

    const { id } = req.params;

    const property = await Property.findById(id);
    if (!property) {
      throw new NotFoundError('Property not found');
    }

    // Check ownership: agency owner or admin
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      if (req.user.role !== 'agency' || property.agencyId.toString() !== req.user.agencyId) {
        throw new AuthorizationError('Access denied');
      }
    }

    await Property.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Property deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
