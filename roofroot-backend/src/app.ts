import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/authRoutes';
import agencyRoutes from './routes/agencyRoutes';
import propertyRoutes from './routes/propertyRoutes';
import listingRoutes from './routes/listingRoutes';
import { securityConfig, initializeSecurity } from './config/security';

const app = express();

// Initialize security configuration (after environment variables are loaded)
// initializeSecurity();

// Security middleware with enhanced configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS configuration with enhanced security
app.use(cors(securityConfig.cors));

// Rate limiting - use endpoint-specific limits for development
if (process.env.NODE_ENV === 'development' && securityConfig.endpointRateLimits) {
  // Development: Use endpoint-specific rate limits
  
  // General rate limit (fallback)
  app.use(rateLimit({
    ...securityConfig.rateLimit,
    max: 500 // Lower general limit since we have specific ones
  }));
  
  // Endpoint-specific rate limits
  app.use('/api/listings', rateLimit(securityConfig.endpointRateLimits.listings));
  app.use('/api/agencies', rateLimit(securityConfig.endpointRateLimits.agencies));
  app.use('/api/auth', rateLimit(securityConfig.endpointRateLimits.auth));
} else {
  // Production: Use general rate limiting
  app.use(rateLimit(securityConfig.rateLimit));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  const healthData: any = {
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '2.0.0',
    architecture: '7-Collection Architecture'
  };

  res.status(200).json(healthData);
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'RoofRoot API is running',
    version: '2.0.0',
    architecture: '7-Collection Architecture',
    timestamp: new Date().toISOString()
  });
});

// API routes
// Authentication, registration, profile management, and admin verification
app.use('/api/auth', authRoutes);

// Public agency viewing (verified agencies only)
app.use('/api/agencies', agencyRoutes);

// Property management (public viewing, agency-scoped CRUD)
app.use('/api/properties', propertyRoutes);

// Listing management (public viewing, agency-scoped CRUD)
app.use('/api/listings', listingRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', error);
  
  // Handle specific error types
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: Object.values(error.errors).map((err: any) => err.message)
    });
  }
  
  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }
  
  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Duplicate field value'
    });
  }
  
  // Handle custom AppError types
  if (error.statusCode) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      code: error.code
    });
  }
  
  // Default error response
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message
  });
});

export default app; 