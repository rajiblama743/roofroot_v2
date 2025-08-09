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
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip rate limiting for health checks
    skip: (req: any) => req.path === '/api/health'
  },

  // CORS configuration
  cors: {
    origin: (origin: string, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (like mobile apps or Postman)
      if (!origin) {
        console.log('✅ CORS: Allowing request with no origin');
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
      
      console.log(`🌐 CORS: Request from origin: ${origin}`);
      console.log(`🌐 CORS: Allowed origins:`, allowedOrigins);
      
      // More permissive CORS for production - allow any Vercel domain
      if (origin.includes('vercel.app') || origin.includes('vercel.com')) {
        console.log('✅ CORS: Allowing Vercel domain');
        return callback(null, true);
      }
      
      if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        console.log('✅ CORS: Origin allowed');
        callback(null, true);
      } else {
        console.warn(`❌ CORS: Origin blocked: ${origin}`);
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
  console.log('✅ Security configuration validated');
};
