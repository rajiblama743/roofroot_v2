import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User, { IUser } from '../models/User';
import { AuthenticatedRequest, JWTPayload } from '../types/user';

// Enhanced JWT configuration
let JWT_SECRET: string | undefined = process.env.JWT_SECRET;
let JWT_REFRESH_SECRET: string | undefined = process.env.JWT_REFRESH_SECRET;

// Validate JWT secrets are set
export const validateJWTSecrets = () => {
  // Update from process.env in case it was loaded after module initialization
  JWT_SECRET = process.env.JWT_SECRET;
  JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
  
  if (!JWT_SECRET || JWT_SECRET === 'your-secret-key') {
    throw new Error('JWT_SECRET environment variable must be set to a secure random string');
  }

  if (!JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET environment variable must be set');
  }
};

// JWT configuration
const JWT_CONFIG = {
  accessToken: {
    expiresIn: '15m', // Short-lived access tokens
    algorithm: 'HS256' as const
  },
  refreshToken: {
    expiresIn: '7d', // Longer-lived refresh tokens
    algorithm: 'HS256' as const
  }
};

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Try to get token from Authorization header first (recommended)
    let token = req.headers.authorization?.split(' ')[1]; // Bearer TOKEN
    
    // Fallback: try to get token from request body (not recommended)
    if (!token && req.body && req.body.token) {
      token = req.body.token;
      console.warn('⚠️ Token provided in request body - this is not recommended for security reasons');
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access token is required. Provide token in Authorization header or request body'
      });
      return;
    }

    // Verify JWT token with enhanced security
    if (!JWT_SECRET) {
      res.status(500).json({
        success: false,
        message: 'JWT_SECRET is not configured'
      });
      return;
    }
    
    const decoded = jwt.verify(token, JWT_SECRET as string, {
      algorithms: [JWT_CONFIG.accessToken.algorithm]
    }) as unknown as JWTPayload;
    
    // Find user in database
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid token - user not found'
      });
      return;
    }

    // Check if user is still active (skip for now as 'inactive' role doesn't exist)
    // if (user.role === 'inactive') {
    //   res.status(401).json({
    //     success: false,
    //     message: 'Account is deactivated'
    //   });
    //   return;
    // }

    // Attach user to request object
    req.user = user as IUser & { _id: string };
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    } else if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Authentication error'
      });
    }
  }
};

// Helper function to generate access token
export const generateAccessToken = (payload: JWTPayload): string => {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.sign(payload, JWT_SECRET as string, { expiresIn: '15m' });
};

// Helper function to generate refresh token
export const generateRefreshToken = (payload: JWTPayload): string => {
  if (!JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET is not configured');
  }
  return jwt.sign(payload, JWT_REFRESH_SECRET as string, { expiresIn: '7d' });
};

// Helper function to verify refresh token
export const verifyRefreshToken = (token: string): JWTPayload => {
  if (!JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET is not configured');
  }
  return jwt.verify(token, JWT_REFRESH_SECRET as string, {
    algorithms: [JWT_CONFIG.refreshToken.algorithm]
  }) as unknown as JWTPayload;
};

// Generate secure random token for CSRF protection
export const generateCSRFToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
}; 