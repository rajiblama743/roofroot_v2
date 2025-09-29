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

    // Allow login for both pending and active users
    if (user.status !== 'pending' && user.status !== 'active') {
      throw new AuthenticationError('Your agency account is suspended or inactive');
    }

    const agency = await Agency.findOne({ userId: user._id });
    if (!agency) {
      throw new UniformGatingError('Agency profile not found');
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

    // Smart response based on profile and verification status
    const { verificationWorkflow } = agency;
    let response: IAuthResponse;

    if (!verificationWorkflow.profileComplete) {
      // Profile incomplete - redirect to completion
      response = {
        success: true,
        message: 'Login successful. Please complete your profile.',
        token,
        user: userResponse,
        agency: agency,
        nextStep: 'complete_profile',
        redirectTo: '/agency/complete-profile',
        profileCompletion: verificationWorkflow.completionPercentage
      };
    } else if (verificationWorkflow.verificationStatus === 'pending_verification') {
      // Profile complete, waiting for verification
      response = {
        success: true,
        message: 'Login successful. Verification in progress.',
        token,
        user: userResponse,
        agency: agency,
        nextStep: 'verification_pending',
        redirectTo: '/agency/dashboard',
        estimatedReviewTime: '2-3 business days'
      };
    } else if (verificationWorkflow.verificationStatus === 'rejected') {
      // Profile rejected, needs updates
      response = {
        success: true,
        message: 'Login successful. Please update your rejected profile.',
        token,
        user: userResponse,
        agency: agency,
        nextStep: 'update_rejected_profile',
        redirectTo: '/agency/update-profile',
        rejectionReason: verificationWorkflow.rejectionReason
      };
    } else if (verificationWorkflow.verificationStatus === 'verified' && user.status === 'active') {
      // Fully verified and active
      response = {
        success: true,
        message: 'Agency login successful',
        token,
        user: userResponse,
        agency: agency,
        nextStep: 'full_access',
        redirectTo: '/agency/dashboard'
      };
    } else {
      // Edge case: verified but user not active
      response = {
        success: true,
        message: 'Login successful. Account activation pending.',
        token,
        user: userResponse,
        agency: agency,
        nextStep: 'activation_pending',
        redirectTo: '/agency/dashboard'
      };
    }

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

export const createAdmin = async (req: IAuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password, phoneNumber, adminRole } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Create admin user (role specified by super_admin)
    const user = new User({
      name,
      email,
      password,
      phoneNumber,
      role: adminRole,
      status: 'active'
    });

    await user.save();

    // Create admin profile
    const admin = new Admin({
      userId: user._id,
      role: adminRole
    });
    await admin.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete (userResponse as any).password;

    const response: IAuthResponse = {
      success: true,
      message: 'Admin user created successfully',
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

    // Create basic agency profile with verification workflow
    const agency = new Agency({
      userId: user._id,
      name,
      slug,
      verificationWorkflow: {
        verificationStatus: 'unverified',
        profileComplete: false,
        completionPercentage: 0,
        lastProfileUpdate: new Date()
      }
    });

    await agency.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete (userResponse as any).password;

    const response: IAuthResponse = {
      success: true,
      message: 'Agency registration successful. Please complete your profile.',
      user: userResponse,
      nextStep: 'complete_profile',
      redirectTo: '/agency/complete-profile'
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

// Agency Profile Management Functions
export const getAgencyOnboardingStatus = async (req: IAuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AuthenticationError('User not found');
    }

    if (req.user.role !== 'agency') {
      throw new AuthenticationError('Agency access required');
    }

    const agency = await Agency.findOne({ userId: req.user._id });
    if (!agency) {
      throw new AuthenticationError('Agency profile not found');
    }

    // Calculate completion percentage using helper function
    const { completionPercentage, profileComplete } = calculateProfileCompletion(agency);

    // Update completion status
    agency.verificationWorkflow.completionPercentage = completionPercentage;
    agency.verificationWorkflow.profileComplete = profileComplete;
    await agency.save();

    const response = {
      success: true,
      data: {
        verificationStatus: agency.verificationWorkflow.verificationStatus,
        profileComplete,
        completionPercentage,
        requiredAction: getRequiredAction(agency.verificationWorkflow.verificationStatus, profileComplete),
        message: getStatusMessage(agency.verificationWorkflow.verificationStatus, profileComplete),
        profile: {
          name: agency.name,
          description: agency.description,
          businessInfo: agency.businessInfo,
          licensing: agency.licensing,
          locations: agency.locations,
          expertise: agency.expertise
        }
      }
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const updateAgencyProfile = async (req: IAuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AuthenticationError('User not found');
    }

    if (req.user.role !== 'agency') {
      throw new AuthenticationError('Agency access required');
    }

    const agency = await Agency.findOne({ userId: req.user._id });
    if (!agency) {
      throw new AuthenticationError('Agency profile not found');
    }

    // Only allow updates for unverified agencies
    if (agency.verificationWorkflow.verificationStatus !== 'unverified') {
      throw new AuthenticationError('Profile cannot be updated after verification request');
    }

    const updateData = req.body;

    // Update agency profile
    Object.assign(agency, updateData);
    agency.verificationWorkflow.lastProfileUpdate = new Date();

    // Recalculate completion percentage using helper function
    const { completionPercentage, profileComplete } = calculateProfileCompletion(agency);

    agency.verificationWorkflow.completionPercentage = completionPercentage;
    agency.verificationWorkflow.profileComplete = profileComplete;

    await agency.save();

    const response = {
      success: true,
      message: 'Agency profile updated successfully',
      data: {
        verificationStatus: agency.verificationWorkflow.verificationStatus,
        profileComplete,
        completionPercentage,
        nextStep: profileComplete ? 'submit_verification' : 'continue_profile'
      }
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const submitVerificationRequest = async (req: IAuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AuthenticationError('User not found');
    }

    if (req.user.role !== 'agency') {
      throw new AuthenticationError('Agency access required');
    }

    const agency = await Agency.findOne({ userId: req.user._id });
    if (!agency) {
      throw new AuthenticationError('Agency profile not found');
    }

    // Check if profile is complete
    if (!agency.verificationWorkflow.profileComplete) {
      throw new ValidationError('Profile must be complete before submitting verification request');
    }

    // Check if already submitted
    if (agency.verificationWorkflow.verificationStatus === 'pending_verification') {
      throw new ValidationError('Verification request already submitted');
    }

    // Submit verification request
    agency.verificationWorkflow.verificationStatus = 'pending_verification';
    agency.verificationWorkflow.verificationRequestedAt = new Date();
    agency.verificationWorkflow.verificationRequestedBy = req.user._id as any;

    await agency.save();

    const response = {
      success: true,
      message: 'Verification request submitted successfully',
      data: {
        verificationStatus: agency.verificationWorkflow.verificationStatus,
        verificationRequestedAt: agency.verificationWorkflow.verificationRequestedAt,
        message: 'Your request is under review. You will be notified once verified.'
      }
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// Helper functions
const getRequiredAction = (status: string, profileComplete: boolean): string => {
  if (status === 'verified') return 'none';
  if (status === 'pending_verification') return 'wait_for_verification';
  if (status === 'rejected') return 'update_profile_and_resubmit';
  if (!profileComplete) return 'complete_profile';
  return 'submit_verification';
};

const getStatusMessage = (status: string, profileComplete: boolean): string => {
  if (status === 'verified') return 'Your agency is fully verified and active';
  if (status === 'pending_verification') return 'Your verification request is under review';
  if (status === 'rejected') return 'Your verification was rejected. Please update your profile and resubmit';
  if (!profileComplete) return 'Please complete your agency profile to request verification';
  return 'Profile complete. Ready to submit verification request';
};

// Calculate profile completion percentage
const calculateProfileCompletion = (agency: any): { completionPercentage: number; profileComplete: boolean } => {
  const requiredFields = ['description', 'businessInfo', 'licensing', 'locations', 'expertise'];
  const completedFields = requiredFields.filter(field => {
    const fieldData = agency[field as keyof typeof agency];
    return fieldData && Object.keys(fieldData).length > 0;
  });
  
  const completionPercentage = Math.round((completedFields.length / requiredFields.length) * 100);
  const profileComplete = completionPercentage === 100;
  
  return { completionPercentage, profileComplete };
};

// Admin Verification Functions
export const getPendingAgencyVerifications = async (req: IAuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AuthenticationError('User not found');
    }

    if (!['admin', 'super_admin'].includes(req.user.role)) {
      throw new AuthenticationError('Admin access required');
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Get agencies pending verification
    const agencies = await Agency.find({
      'verificationWorkflow.verificationStatus': 'pending_verification'
    })
    .populate('userId', 'name email')
    .skip(skip)
    .limit(limit)
    .sort({ 'verificationWorkflow.verificationRequestedAt': 1 });

    const total = await Agency.countDocuments({
      'verificationWorkflow.verificationStatus': 'pending_verification'
    });

    const response = {
      success: true,
      data: {
        agencies: agencies.map(agency => ({
          _id: agency._id,
          name: agency.name,
          email: (agency.userId as any).email,
          verificationRequestedAt: agency.verificationWorkflow.verificationRequestedAt,
          completionPercentage: agency.verificationWorkflow.completionPercentage,
          profile: {
            description: agency.description,
            businessInfo: agency.businessInfo,
            licensing: agency.licensing,
            locations: agency.locations,
            expertise: agency.expertise
          }
        })),
        pagination: {
          page,
          limit,
          total,
          hasMore: skip + agencies.length < total
        }
      }
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const approveAgencyVerification = async (req: IAuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AuthenticationError('User not found');
    }

    if (!['admin', 'super_admin'].includes(req.user.role)) {
      throw new AuthenticationError('Admin access required');
    }

    const { agencyId } = req.params;
    const { notes } = req.body;

    const agency = await Agency.findById(agencyId);
    if (!agency) {
      throw new AuthenticationError('Agency not found');
    }

    if (agency.verificationWorkflow.verificationStatus !== 'pending_verification') {
      throw new ValidationError('Agency is not pending verification');
    }

    // Approve agency
    agency.verificationWorkflow.verificationStatus = 'verified';
    agency.verificationWorkflow.verifiedAt = new Date();
    agency.verificationWorkflow.verifiedBy = req.user._id as any;

    // Update user status to active
    await User.findByIdAndUpdate(agency.userId, { status: 'active' });

    await agency.save();

    const response = {
      success: true,
      message: 'Agency verified successfully',
      data: {
        agencyId: agency._id,
        verificationStatus: agency.verificationWorkflow.verificationStatus,
        verifiedAt: agency.verificationWorkflow.verifiedAt,
        verifiedBy: req.user._id
      }
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const rejectAgencyVerification = async (req: IAuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AuthenticationError('User not found');
    }

    if (!['admin', 'super_admin'].includes(req.user.role)) {
      throw new AuthenticationError('Admin access required');
    }

    const { agencyId } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      throw new ValidationError('Rejection reason is required');
    }

    const agency = await Agency.findById(agencyId);
    if (!agency) {
      throw new AuthenticationError('Agency not found');
    }

    if (agency.verificationWorkflow.verificationStatus !== 'pending_verification') {
      throw new ValidationError('Agency is not pending verification');
    }

    // Reject agency
    agency.verificationWorkflow.verificationStatus = 'rejected';
    agency.verificationWorkflow.rejectionReason = rejectionReason;
    agency.verificationWorkflow.rejectedAt = new Date();
    agency.verificationWorkflow.rejectedBy = req.user._id as any;

    await agency.save();

    const response = {
      success: true,
      message: 'Agency verification rejected',
      data: {
        agencyId: agency._id,
        verificationStatus: agency.verificationWorkflow.verificationStatus,
        rejectionReason: agency.verificationWorkflow.rejectionReason,
        rejectedAt: agency.verificationWorkflow.rejectedAt,
        rejectedBy: req.user._id
      }
    };

    res.status(200).json(response);
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