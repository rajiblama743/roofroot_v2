import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'RoofRoot API is running',
    status: 'success',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authRoutes); // Authentication routes (public)
app.use('/api/users', userRoutes); // User management routes (protected)

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    message: 'Route not found',
    status: 'error'
  });
});

export default app; 