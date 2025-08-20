import { Request, Response, NextFunction } from 'express';
import Agency from '../models/Agencies';
import User from '../models/Users';
import { IAuthenticatedRequest, IPaginationResponse } from '../types/common';
import { IAgencyFilters, IAgencyCreate, IAgencyUpdate } from '../types/agency';
import { NotFoundError, AuthorizationError } from '../utils/errors';
import { parsePaginationQuery, createPaginationResponse, ensureValidPagination } from '../utils/pagination';
import { generateSlug, generateUniqueSlug } from '../utils/slugify';
import { syncAgencyNameDenorm } from '../utils/denormSync';

// Public endpoint - Get agencies with uniform gating
export const getAgencies = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit } = ensureValidPagination(
      parseInt(req.query.page as string),
      parseInt(req.query.limit as string)
    );
    const { q, serviceAreas, propertyTypes, priceRanges } = req.query as IAgencyFilters;

    // Build query with uniform gating: ONLY agencies where Users.status==='active' AND Agencies.verificationStatus==='verified'
    const query: any = {
      verificationStatus: 'verified'
    };

    // Add search filters
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tagline: { $regex: q, $options: 'i' } }
      ];
    }

    if (serviceAreas && Array.isArray(serviceAreas)) {
      query['locations.serviceAreas'] = { $in: serviceAreas };
    }

    if (propertyTypes && Array.isArray(propertyTypes)) {
      query['expertise.propertyTypes'] = { $in: propertyTypes };
    }

    if (priceRanges && Array.isArray(priceRanges)) {
      query['expertise.priceRanges'] = { $in: priceRanges };
    }

    // Get agencies with pagination and populate user data
    const agencies = await Agency.find(query)
      .populate('userId', 'name email phoneNumber status')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Filter out agencies where user status is not 'active'
    const activeAgencies = agencies.filter(agency => {
      const user = agency.userId as any;
      return user && user.status === 'active';
    });

    // Get total count of verified agencies with active users
    const total = await Agency.aggregate([
      { $match: { verificationStatus: 'verified' } },
      { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
      { $match: { 'user.status': 'active' } },
      { $count: 'total' }
    ]);

    const activeTotal = total.length > 0 ? total[0].total : 0;

    const response: IPaginationResponse<any> = createPaginationResponse(
      activeAgencies,
      page,
      limit,
      activeTotal
    );

    res.status(200).json({
      success: true,
      message: 'Agencies retrieved successfully',
      data: response
    });
  } catch (error) {
    next(error);
  }
};

// Public endpoint - Get agency by slug with uniform gating
export const getAgencyBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { slug } = req.params;

    const agency = await Agency.findOne({ slug })
      .populate('userId', 'name email phoneNumber status');

    if (!agency) {
      throw new NotFoundError('Agency not found');
    }

    // UNIFORM GATING: Check if user is active AND agency is verified
    const user = agency.userId as any;
    if (!user || user.status !== 'active' || agency.verificationStatus !== 'verified') {
      throw new NotFoundError('Agency not found');
    }

    res.status(200).json({
      success: true,
      message: 'Agency retrieved successfully',
      data: agency
    });
  } catch (error) {
    next(error);
  }
};

// Agency-scoped endpoint - Create agency (admin only)
export const createAgency = async (req: IAuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AuthorizationError('Authentication required');
    }

    if (!['admin', 'super_admin'].includes(req.user.role)) {
      throw new AuthorizationError('Admin access required');
    }

    const agencyData: IAgencyCreate = req.body;

    // Check if agency name already exists
    const existingAgency = await Agency.findOne({ name: agencyData.name });
    if (existingAgency) {
      throw new Error('Agency with this name already exists');
    }

    // Generate unique slug
    const baseSlug = generateSlug(agencyData.name);
    const existingSlugs = await Agency.distinct('slug');
    const slug = generateUniqueSlug(baseSlug, existingSlugs);

    const agency = new Agency({
      ...agencyData,
      slug,
      verificationStatus: 'unverified'
    });

    await agency.save();

    res.status(201).json({
      success: true,
      message: 'Agency created successfully',
      data: agency
    });
  } catch (error) {
    next(error);
  }
};

// Agency-scoped endpoint - Update agency
export const updateAgency = async (req: IAuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AuthorizationError('Authentication required');
    }

    const { id } = req.params;
    const updateData: IAgencyUpdate = req.body;

    const agency = await Agency.findById(id);
    if (!agency) {
      throw new NotFoundError('Agency not found');
    }

    // Check permissions: agency owner or admin
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      if (req.user.role !== 'agency' || agency.userId.toString() !== req.user._id) {
        throw new AuthorizationError('Access denied');
      }
    }

    // If name is being updated, check for conflicts and update slug
    if (updateData.name && updateData.name !== agency.name) {
      const existingAgency = await Agency.findOne({ name: updateData.name, _id: { $ne: id } });
      if (existingAgency) {
        throw new Error('Agency with this name already exists');
      }

      const baseSlug = generateSlug(updateData.name);
      const existingSlugs = await Agency.distinct('slug');
      const newSlug = generateUniqueSlug(baseSlug, existingSlugs);
      
      // Update the slug in the updateData
      (updateData as any).slug = newSlug;
    }

    const updatedAgency = await Agency.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    // Sync denorm data if name changed
    if (updateData.name && updateData.name !== agency.name) {
      await syncAgencyNameDenorm(id, updateData.name);
    }

    res.status(200).json({
      success: true,
      message: 'Agency updated successfully',
      data: updatedAgency
    });
  } catch (error) {
    next(error);
  }
};

// Agency-scoped endpoint - Delete agency
export const deleteAgency = async (req: IAuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AuthorizationError('Authentication required');
    }

    const { id } = req.params;

    const agency = await Agency.findById(id);
    if (!agency) {
      throw new NotFoundError('Agency not found');
    }

    // Check permissions: agency owner or admin
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      if (req.user.role !== 'agency' || agency.userId.toString() !== req.user._id) {
        throw new AuthorizationError('Access denied');
      }
    }

    await Agency.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Agency deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Admin endpoint - Verify agency
export const verifyAgency = async (req: IAuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AuthorizationError('Authentication required');
    }

    if (!['admin', 'super_admin'].includes(req.user.role)) {
      throw new AuthorizationError('Admin access required');
    }

    const { id } = req.params;
    const { verificationStatus, approvedBy } = req.body;

    const agency = await Agency.findById(id);
    if (!agency) {
      throw new NotFoundError('Agency not found');
    }

    // Update verification status
    agency.verificationStatus = verificationStatus;
    if (verificationStatus === 'verified') {
      agency.approvalDate = new Date();
      agency.approvedBy = approvedBy || req.user._id;
    }

    await agency.save();

    // If verified, activate the user
    if (verificationStatus === 'verified') {
      await User.findByIdAndUpdate(agency.userId, { status: 'active' });
    }

    res.status(200).json({
      success: true,
      message: `Agency ${verificationStatus} successfully`,
      data: agency
    });
  } catch (error) {
    next(error);
  }
};
