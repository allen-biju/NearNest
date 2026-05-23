import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import apiRoutes from './routes/apiRoutes';

const app = express();

// Security and utility middleware
app.use(helmet({
  crossOriginResourcePolicy: false // Allows loading local asset resources
}));
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control']
}));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(morgan('dev'));

// Direct mapping of API routes
app.use('/api/v1', apiRoutes);

// Fallback for not-found API endpoints
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: `API Endpoint ${req.method} ${req.url} does not exist` }
  });
});

// Centralized error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('💥 Unhandled server error:', err);
  res.status(500).json({
    success: false,
    error: { code: 'SERVER_ERROR', message: err.message || 'An unexpected server error occurred' }
  });
});

export default app;
