import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/Users';
import Agency from '../models/Agencies';
import Customer from '../models/Customers';
import Admin from '../models/Admins';
import { generateSlug, generateUniqueSlug } from '../utils/slugify';
import { IAuthenticatedRequest, IAuthResponse } from '../types/common';
import { ValidationError, ConflictError, AuthenticationError, UniformGatingError } from '../utils/errors';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const adminLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Check if user is admin
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      throw new AuthenticationError('Access denied. Admin privileges required.');
    }

    // Check admin status
    if (user.status === 'suspended') {
      throw new AuthenticationError('Your admin account is suspended');
    }

    // Update last active timestamp
    user.lastActiveAt = new Date();
    await user.save();

    // Generate JWT token
    const payload = {
      userId: (user._id as any).toString(),
      email: user.email,
      role: user.role
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });

    // Remove password from response
    const userResponse = user.toObject();
    delete (userResponse as any).password;

    const response: IAuthResponse = {
      success: true,
      message: 'Admin login successful',
      token,
      user: userResponse
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const agencyLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Check if user is agency
    if (user.role !== 'agency') {
      throw new AuthenticationError('Access denied. Agency account required.');
    }

    // UNIFORM GATING: Agency login requires BOTH active status AND verified verification
    if (user.status !== 'active') {
      throw new UniformGatingError('Your agency account is not yet activated');
    }

    const agency = await Agency.findOne({ userId: user._id });
    if (!agency) {
      throw new UniformGatingError('Agency profile not found');
    }

    if (agency.verificationStatus !== 'verified') {
      throw new UniformGatingError('Your agency account is not yet verified');
    }

    // Update last active timestamp
    user.lastActiveAt = new Date();
    await user.save();

    // Generate JWT token
    const payload = {
      userId: (user._id as any).toString(),
      email: user.email,
      role: user.role,
      agencyId: (agency as any)._id?.toString()
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });

    // Remove password from response
    const userResponse = user.toObject();
    delete (userResponse as any).password;

    const response: IAuthResponse = {
      success: true,
      message: 'Agency login successful',
      token,
      user: userResponse,
      agency: agency
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const customerLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Check if user is customer
    if (user.role !== 'customer') {
      throw new AuthenticationError('Access denied. Customer account required.');
    }

    // Check customer status
    if (user.status !== 'active') {
      throw new AuthenticationError('Your account is not active');
    }

    // Update last active timestamp
    user.lastActiveAt = new Date();
    await user.save();

    // Generate JWT token
    const payload = {
      userId: (user._id as any).toString(),
      email: user.email,
      role: user.role
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });

    // Remove password from response
    const userResponse = user.toObject();
    delete (userResponse as any).password;

    const response: IAuthResponse = {
      success: true,
      message: 'Customer login successful',
      token,
      user: userResponse
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const adminRegister = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password, phoneNumber } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Create admin user (always 'admin' role, never 'super_admin')
    const user = new User({
      name,
      email,
      password,
      phoneNumber,
      role: 'admin',
      status: 'active'
    });

    await user.save();

    // Create admin profile
    const admin = new Admin({
      userId: user._id,
      role: 'admin'
    });
    await admin.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete (userResponse as any).password;

    const response: IAuthResponse = {
      success: true,
      message: 'Admin registration successful',
      user: userResponse
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const agencyRegister = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Check if agency name already exists
    const existingAgency = await Agency.findOne({ name });
    if (existingAgency) {
      throw new ConflictError('Agency with this name already exists');
    }

    // Create user with pending status
    const user = new User({
      name,
      email,
      password,
      role: 'agency',
      status: 'pending'
    });

    await user.save();

    // Generate unique slug
    const baseSlug = generateSlug(name);
    const existingSlugs = await Agency.distinct('slug');
    const slug = generateUniqueSlug(baseSlug, existingSlugs);

    // Create basic agency profile with minimal data
    const agency = new Agency({
      userId: user._id,
      name,
      slug,
      verificationStatus: 'unverified'
    });

    await agency.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete (userResponse as any).password;

    const response: IAuthResponse = {
      success: true,
      message: 'Agency registration successful. Please wait for verification and activation.',
      user: userResponse
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const customerRegister = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password, phoneNumber } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Create customer user
    const user = new User({
      name,
      email,
      password,
      phoneNumber,
      role: 'customer',
      status: 'active'
    });

    await user.save();

    // Create customer profile
    const customer = new Customer({
      userId: user._id
    });
    await customer.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete (userResponse as any).password;

    const response: IAuthResponse = {
      success: true,
      message: 'Customer registration successful',
      user: userResponse
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: IAuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AuthenticationError('User not found');
    }

    // Get role-specific data
    let additionalData = {};

    if (req.user.role === 'agency') {
      const agency = await Agency.findOne({ userId: req.user._id });
      if (agency) {
        additionalData = { agency };
      }
    } else if (req.user.role === 'customer') {
      const customer = await Customer.findOne({ userId: req.user._id });
      if (customer) {
        additionalData = { customer };
      }
    } else if (req.user.role === 'admin' || req.user.role === 'super_admin') {
      const admin = await Admin.findOne({ userId: req.user._id });
      if (admin) {
        additionalData = { admin };
      }
    }

    const response = {
      success: true,
      message: 'User profile retrieved successfully',
      data: {
        user: req.user,
        ...additionalData
      }
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: IAuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AuthenticationError('User not found');
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw new ValidationError('Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    await user.save();

    const response = {
      success: true,
      message: 'Password changed successfully'
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}; 