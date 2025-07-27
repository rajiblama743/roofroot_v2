import app from './app';
import connectDB from './config/database';

const port = process.env.PORT || 5000;

const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB Atlas
    await connectDB();
    
    // Start the server
    app.listen(port, () => {
      console.log(`✅ Server running on port ${port}`);
      console.log(`🌐 API available at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('❌ Server startup error:', error);
    process.exit(1);
  }
};

startServer(); 