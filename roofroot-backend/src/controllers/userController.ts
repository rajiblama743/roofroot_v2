import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import User, { IUser, UserRole } from '../models/User';
import { CreateUserRequest, UpdateUserRequest, UserResponse, AuthenticatedRequest } from '../types/user';

// Validation rules for creating users (admin only)
export const validateCreateUser = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .isIn(['admin', 'agency', 'customer'])
    .withMessage('Role must be admin, agency, or customer'),
  body('phoneNumber')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('agencyName')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Agency name cannot exceed 200 characters'),
  body('agencyDescription')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Agency description cannot exceed 1000 characters'),
  body('license')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('License cannot exceed 200 characters'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Address cannot exceed 500 characters')
];

// Validation rules for updating users
export const validateUpdateUser = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('role')
    .optional()
    .isIn(['admin', 'agency', 'customer'])
    .withMessage('Role must be admin, agency, or customer'),
  body('phoneNumber')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('agencyName')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Agency name cannot exceed 200 characters'),
  body('agencyDescription')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Agency description cannot exceed 1000 characters'),
  body('license')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('License cannot exceed 200 characters'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Address cannot exceed 500 characters')
];

// Create user (admin only)
export const createUser = async (req: Request, res: Response): Promise<void> => {
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

    const { name, email, password, role, phoneNumber, agencyName, agencyDescription, license, address }: CreateUserRequest = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
      return;
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      role,
      phoneNumber,
      agencyName,
      agencyDescription,
      license,
      address
    });

    await user.save();

    // Return user data without password
    const userResponse = user.toObject();
    delete (userResponse as any).password;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while creating user'
    });
  }
};

// Get all users (admin only)
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find({}).select('-password');
    
    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      users
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving users'
    });
  }
};

// Get user by ID
export const getUserById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId).select('-password');
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      user
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving user'
    });
  }
};

// Update user
export const updateUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    const userId = req.params.id;
    const updateData: UpdateUserRequest = req.body;

    // Check if user exists
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // If email is being updated, check for uniqueness
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailExists = await User.findOne({ email: updateData.email });
      if (emailExists) {
        res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
        return;
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while updating user'
    });
  }
};

// Update user status (admin only)
export const updateUserStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;
    const { status }: { status: 'active' | 'pending' } = req.body;

    // Check if user exists
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Prevent changing status for admins
    if (existingUser.role === 'admin') {
      res.status(403).json({
        success: false,
        message: 'Cannot change status for admin accounts'
      });
      return;
    }

    // Update user status
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { status },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'User status updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while updating user status'
    });
  }
};

// Delete user (admin only)
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;

    // Check if user exists
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Delete user
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while deleting user'
    });
  }
};

// Search agencies by location (updated to filter by status)
export const searchAgencies = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const search = req.query.search as string;
    const status = req.query.status as string || 'active'; // Default to active

    // Build query for agencies only with status filter
    const query: any = { 
      role: 'agency',
      status: status // Filter by status
    };
    
    if (search) {
      // Search in agencyName, address, and agencyDescription
      query.$or = [
        { agencyName: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { agencyDescription: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Execute query with pagination and performance optimizations
    const agencies = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(); // Use lean() for better performance

    // Get total count for pagination
    const total = await User.countDocuments(query);
    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;

    res.status(200).json({
      success: true,
      message: 'Agencies retrieved successfully',
      items: agencies, // Consistent with pagination contract
      agencies, // Keep for backward compatibility
      total,
      page,
      limit,
      totalPages,
      hasMore
    });
  } catch (error) {
    console.error('Search agencies error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while searching agencies'
    });
  }
}; 