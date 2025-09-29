import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/Users';
import Agency from '../models/Agencies';
import { IAuthenticatedRequest, IJWTPayload } from '../types/common';
import { AuthenticationError, UniformGatingError } from '../utils/errors';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const authenticateToken = async (
  req: IAuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      throw new AuthenticationError('Access token required');
    }

    const decoded = jwt.verify(token, JWT_SECRET) as IJWTPayload;
    
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      throw new AuthenticationError('Invalid token - user not found');
    }

    // Check if user is suspended
    if (user.status === 'suspended') {
      throw new AuthenticationError('Account is suspended');
    }

    // For agency users, enforce uniform gating
    if (user.role === 'agency') {
      const agency = await Agency.findOne({ userId: user._id });
      if (!agency) {
        throw new UniformGatingError('Agency profile not found');
      }

      if (user.status !== 'active' || agency.verificationStatus !== 'verified') {
        throw new UniformGatingError('Your agency account is not yet verified or activated');
      }

      // Add agencyId to user object for convenience
      req.user = { 
        ...user.toObject(), 
        _id: (user._id as any).toString(),
        agencyId: (agency._id as any).toString() 
      } as any;
    } else {
      req.user = { 
        ...user.toObject(), 
        _id: (user._id as any).toString() 
      } as any;
    }

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AuthenticationError('Invalid token'));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new AuthenticationError('Token expired'));
    } else {
      next(error);
    }
  }
};

export const requireRole = (roles: string[]) => {
  return (req: IAuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AuthenticationError('Authentication required'));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new AuthenticationError('Insufficient permissions'));
      return;
    }

    next();
  };
};

export const requireAgency = (req: IAuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    next(new AuthenticationError('Authentication required'));
    return;
  }

  if (req.user.role !== 'agency') {
    next(new AuthenticationError('Agency access required'));
    return;
  }

  if (!req.user.agencyId) {
    next(new AuthenticationError('Agency profile not found'));
    return;
  }

  next();
};

export const requireAdmin = (req: IAuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    next(new AuthenticationError('Authentication required'));
    return;
  }

  if (!['admin', 'super_admin'].includes(req.user.role)) {
    next(new AuthenticationError('Admin access required'));
    return;
  }

  next();
};

export const requireSuperAdmin = (req: IAuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    next(new AuthenticationError('Authentication required'));
    return;
  }

  if (req.user.role !== 'super_admin') {
    next(new AuthenticationError('Super admin access required'));
    return;
  }

  next();
};

// Alias for superAdminOnly
export const superAdminOnly = requireSuperAdmin;
