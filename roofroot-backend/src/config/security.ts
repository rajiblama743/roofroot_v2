import crypto from 'crypto';

// Security configuration
export const securityConfig = {
  // JWT Configuration
  jwt: {
    accessToken: {
      expiresIn: '15m', // Short-lived for security
      algorithm: 'HS256'
    },
    refreshToken: {
      expiresIn: '7d', // Longer-lived for convenience
      algorithm: 'HS256'
    },
    // Secrets must be at least 32 characters long
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET
  },

  // Password configuration
  password: {
    saltRounds: 12, // High cost for security
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true
  },

  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'development' ? 5000 : 100, // 5000 for dev, 100 for production
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip rate limiting for health checks
    skip: (req: any) => req.path === '/api/health',
    // Development-friendly options
    ...(process.env.NODE_ENV === 'development' && {
      // More lenient for development
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      // Add delay instead of blocking for development
      delayMs: 0,
      // Allow burst requests in development
      maxDelayMs: 1000,
      // Better error messages for development
      message: {
        success: false,
        message: 'Rate limit exceeded (development: 5000 req/15min). This is very generous for local development.',
        retryAfter: '15 minutes',
        currentLimit: 5000,
        windowMs: '15 minutes'
      }
    })
  },

  // Specific rate limiting for different endpoints (development only)
  endpointRateLimits: process.env.NODE_ENV === 'development' ? {
    // Very generous for development
    listings: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 10000, // 10000 requests per 15 minutes for listings
      message: {
        success: false,
        message: 'Too many listing requests (dev: 10000 req/15min). This is very generous for local development.',
        retryAfter: '15 minutes',
        currentLimit: 10000,
        windowMs: '15 minutes'
      },
      standardHeaders: true,
      legacyHeaders: false
    },
    agencies: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 10000, // 10000 requests per 15 minutes for agencies
      message: {
        success: false,
        message: 'Too many agency requests (dev: 10000 req/15min). This is very generous for local development.',
        retryAfter: '15 minutes',
        currentLimit: 10000,
        windowMs: '15 minutes'
      },
      standardHeaders: true,
      legacyHeaders: false
    },
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // 1000 auth requests per 15 minutes (more restrictive for security)
      message: {
        success: false,
        message: 'Too many authentication requests (dev: 1000 req/15min). This is more restrictive for security.',
        retryAfter: '15 minutes',
        currentLimit: 1000,
        windowMs: '15 minutes'
      },
      standardHeaders: true,
      legacyHeaders: false
    }
  } : undefined,

  // CORS configuration
  cors: {
    origin: (origin: string, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (like mobile apps or Postman)
      if (!origin) {
        return callback(null, true);
      }
      
      // Get allowed origins from environment variable or use defaults
      const frontendUrls = process.env.FRONTEND_URLS 
        ? process.env.FRONTEND_URLS.split(',').map(url => url.trim())
        : [];
      
      const allowedOrigins = [
        // Local development (always allowed)
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3007', // Admin app
        // Production domains from environment
        ...frontendUrls,
        // Common deployment domains
        'https://roofroot-web.vercel.app',
        'https://roofroot-v2.vercel.app',
        'https://roofroot-web.netlify.app',
        'https://roofroot-web.onrender.com',
        'https://roofroot-web.railway.app',
        // Custom domains
        'https://roofchains.com',
        'https://www.roofchains.com',
        // Vercel preview deployments
        'https://roofroot-v2.vercel.app',
        'https://roofroot-web-git-main-rajiblama.vercel.app',
        'https://roofroot-web-rajiblama.vercel.app',
        // Wildcard for development (remove in production)
        ...(process.env.NODE_ENV === 'development' ? ['*'] : [])
      ].filter(Boolean); // Remove undefined values
      
      // More permissive CORS for production - allow any Vercel domain
      if (origin.includes('vercel.app') || origin.includes('vercel.com')) {
        return callback(null, true);
      }
      
      if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
    exposedHeaders: ['X-CSRF-Token']
  },

  // Session configuration
  session: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  },

  // CSRF configuration
  csrf: {
    tokenLength: 32,
    cookieName: 'csrf-token',
    headerName: 'X-CSRF-Token'
  },

  // Input validation
  validation: {
    maxStringLength: 1000,
    maxArrayLength: 100,
    allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif'],
    maxFileSize: 5 * 1024 * 1024 // 5MB
  }
};

// Security validation functions
export const securityUtils = {
  // Validate JWT secrets
  validateJWTSecrets: () => {
    // Get fresh values from process.env
    const jwtSecret = process.env.JWT_SECRET;
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
    
    if (!jwtSecret || jwtSecret === 'your-secret-key') {
      throw new Error('JWT_SECRET environment variable must be set to a secure random string (min 32 chars)');
    }
    if (!jwtRefreshSecret) {
      throw new Error('JWT_REFRESH_SECRET environment variable must be set');
    }
    if (jwtSecret.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters long');
    }
    if (jwtRefreshSecret.length < 32) {
      throw new Error('JWT_REFRESH_SECRET must be at least 32 characters long');
    }
  },

  // Generate secure random string
  generateSecureString: (length: number = 32): string => {
    return crypto.randomBytes(length).toString('hex');
  },

  // Validate password strength
  validatePassword: (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (password.length < securityConfig.password.minLength) {
      errors.push(`Password must be at least ${securityConfig.password.minLength} characters long`);
    }
    
    if (securityConfig.password.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (securityConfig.password.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (securityConfig.password.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (securityConfig.password.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Sanitize user input
  sanitizeInput: (input: string): string => {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .substring(0, securityConfig.validation.maxStringLength);
  },

  // Validate file upload
  validateFile: (file: any): { isValid: boolean; error?: string } => {
    if (!file) {
      return { isValid: false, error: 'No file provided' };
    }
    
    if (file.size > securityConfig.validation.maxFileSize) {
      return { isValid: false, error: 'File size too large' };
    }
    
    if (!securityConfig.validation.allowedFileTypes.includes(file.mimetype)) {
      return { isValid: false, error: 'File type not allowed' };
    }
    
    return { isValid: true };
  }
};

// Initialize security configuration
export const initializeSecurity = () => {
  securityUtils.validateJWTSecrets();
};
