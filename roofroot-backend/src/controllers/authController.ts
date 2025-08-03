import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import User, { IUser } from '../models/User';
import { RegisterRequest, LoginRequest, AuthResponse, JWTPayload, AuthenticatedRequest } from '../types/user';
import { generateToken } from '../middlewares/authMiddleware';

// Validation rules for registration
export const validateRegistration = [
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
  body('role')
    .optional()
    .isIn(['customer'])
    .withMessage('Registration can only create customer accounts')
];

// Validation rules for login
export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Registration endpoint
export const register = async (req: Request, res: Response): Promise<void> => {
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

    const { name, email, password, phoneNumber, agencyName, agencyDescription }: RegisterRequest = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
      return;
    }

    // Create new user (role defaults to 'customer' as per schema)
    const user = new User({
      name,
      email,
      password,
      phoneNumber,
      agencyName,
      agencyDescription,
      role: 'customer' // Force customer role for registration
    });

    await user.save();

    // Generate JWT token
    const payload: JWTPayload = {
      userId: (user as any)._id.toString(),
      email: user.email,
      role: user.role
    };

    const token = generateToken(payload);

    // Return user data without password
    const userResponse = user.toObject();
    delete (userResponse as any).password;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration'
    });
  }
};

// Login endpoint
export const login = async (req: Request, res: Response): Promise<void> => {
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

    const { email, password }: LoginRequest = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Email not found. Please check your email address or register a new account.'
      });
      return;
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Incorrect password. Please check your password and try again.'
      });
      return;
    }

    // Generate JWT token
    const payload: JWTPayload = {
      userId: (user as any)._id.toString(),
      email: user.email,
      role: user.role
    };

    const token = generateToken(payload);

    // Return user data without password
    const userResponse = user.toObject();
    delete (userResponse as any).password;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
};

// Delete user endpoint
export const deleteUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const targetUserId = req.params.user_id;
    const authenticatedUser = req.user!;

    // Find the target user
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Additional validation for admin users
    if (authenticatedUser.role === 'admin') {
      // Admin cannot delete other admins
      if (targetUser.role === 'admin') {
        res.status(403).json({
          success: false,
          message: 'Admins cannot delete other admin accounts'
        });
        return;
      }
    }

    // Delete the user
    await User.findByIdAndDelete(targetUserId);

    res.status(200).json({
      success: true,
      message: 'User account deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while deleting user'
    });
  }
}; 