import { Request, Response, NextFunction } from 'express';
import Agency from '../models/Agencies';
import User from '../models/Users';
import { IPaginationResponse } from '../types/common';
import { IAgencyFilters } from '../types/agency';
import { NotFoundError } from '../utils/errors';
import { ensureValidPagination, createPaginationResponse } from '../utils/pagination';

// Public endpoint - Get verified agencies with uniform gating
export const getAgencies = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit } = ensureValidPagination(
      parseInt(req.query.page as string),
      parseInt(req.query.limit as string)
    );
    const { q, serviceAreas, propertyTypes, priceRanges } = req.query as IAgencyFilters;

    // Build query with uniform gating: ONLY agencies where Users.status==='active' AND Agencies.verificationWorkflow.verificationStatus==='verified'
    const query: any = {
      'verificationWorkflow.verificationStatus': 'verified'
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
      { $match: { 'verificationWorkflow.verificationStatus': 'verified' } },
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
    if (!user || user.status !== 'active' || agency.verificationWorkflow.verificationStatus !== 'verified') {
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
