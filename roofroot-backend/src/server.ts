import dotenv from 'dotenv';
import app from './app';
import connectDB from './config/database';

// Load environment variables from .env file
dotenv.config();

// Force development mode for local development
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}

// Import and validate JWT secrets after dotenv is loaded
import { validateJWTSecrets } from './middlewares/authMiddleware';
import { initializeSecurity } from './config/security';

// Validate JWT secrets after environment variables are loaded
validateJWTSecrets();
initializeSecurity();

// Get port from environment variable, with fallbacks
const port = process.env.PORT || process.env.RENDER_PORT || 3001;

const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB Atlas
    await connectDB();
    
    // Start the server
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(`API available at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Server startup error:', error);
    // Only exit if it's a critical error (not just DB connection)
    if (error instanceof Error && error.message.includes('MONGO_URI')) {
      console.log('Server will start without database connection');
      // Start server anyway
      app.listen(port, () => {
        console.log(`Server running on port ${port} (without database)`);
        console.log(`API available at http://localhost:${port}`);
      });
    } else {
      process.exit(1);
    }
  }
};

startServer(); 