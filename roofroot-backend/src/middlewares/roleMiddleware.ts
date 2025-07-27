import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/user';
import { UserRole } from '../models/User';

// Middleware to check if user has admin role
export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
    return;
  }

  next();
};

// Middleware to check if user has specific role
export const requireRole = (roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${roles.join(', ')}`
      });
      return;
    }

    next();
  };
};

// Middleware to check if user can access their own resource or is admin
export const requireOwnershipOrAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
    return;
  }

  const userId = req.params.id;
  
  // Admin can access any user's resource
  if (req.user.role === 'admin') {
    next();
    return;
  }

  // Users can only access their own resource
  if (req.user._id.toString() === userId) {
    next();
    return;
  }

  res.status(403).json({
    success: false,
    message: 'Access denied. You can only access your own resources'
  });
};

// Middleware to check if user can modify their own profile or is admin
export const requireOwnershipOrAdminForUpdate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
    return;
  }

  const userId = req.params.id;
  
  // Admin can modify any user
  if (req.user.role === 'admin') {
    next();
    return;
  }

  // Users can only modify their own profile
  if (req.user._id.toString() === userId) {
    // Prevent customers from changing their role
    if (req.user.role === 'customer' && req.body.role && req.body.role !== 'customer') {
      res.status(403).json({
        success: false,
        message: 'Customers cannot change their role'
      });
      return;
    }
    next();
    return;
  }

  res.status(403).json({
    success: false,
    message: 'Access denied. You can only modify your own profile'
  });
}; 