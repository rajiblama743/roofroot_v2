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

// Middleware to check if user can delete the specified user account
export const requireDeleteUserPermission = (
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

  const targetUserId = req.params.user_id;
  const authenticatedUserId = req.user._id.toString();

  // Agency users cannot delete any user account (including their own)
  if (req.user.role === 'agency') {
    res.status(403).json({
      success: false,
      message: 'Agency users cannot delete user accounts'
    });
    return;
  }

  // Admin users can delete customer and agency users, but not themselves or other admins
  if (req.user.role === 'admin') {
    // Admin cannot delete themselves
    if (authenticatedUserId === targetUserId) {
      res.status(403).json({
        success: false,
        message: 'Admins cannot delete their own account via this API'
      });
      return;
    }
    next();
    return;
  }

  // Customer users can only delete their own account
  if (req.user.role === 'customer') {
    if (authenticatedUserId === targetUserId) {
      next();
      return;
    } else {
      res.status(403).json({
        success: false,
        message: 'You can only delete your own account'
      });
      return;
    }
  }

  // Default case - should not reach here
  res.status(403).json({
    success: false,
    message: 'Access denied'
  });
}; 

// Middleware to check if user can delete the specified user account (using :id parameter)
export const requireDeleteUserPermissionById = (
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

  const targetUserId = req.params.id;
  const authenticatedUserId = req.user._id.toString();

  // Prevent admin and agency users from deleting their own accounts
  if ((req.user.role === 'admin' || req.user.role === 'agency') && authenticatedUserId === targetUserId) {
    res.status(403).json({
      success: false,
      message: 'Admin and agency users cannot delete their own accounts'
    });
    return;
  }

  // Agency users cannot delete any user account
  if (req.user.role === 'agency') {
    res.status(403).json({
      success: false,
      message: 'Agency users cannot delete user accounts'
    });
    return;
  }

  // Admin users can delete other user accounts (but not their own)
  if (req.user.role === 'admin') {
    next();
    return;
  }

  // Customer users can only delete their own account
  if (req.user.role === 'customer') {
    if (authenticatedUserId === targetUserId) {
      next();
      return;
    } else {
      res.status(403).json({
        success: false,
        message: 'You can only delete your own account'
      });
      return;
    }
  }

  // Default case - should not reach here
  res.status(403).json({
    success: false,
    message: 'Access denied'
  });
}; 