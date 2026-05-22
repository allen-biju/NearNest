import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { sendError } from '../utils/response';

/**
 * Validation error handler middleware
 */
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err: any) => ({
      field: err.param,
      message: err.msg
    }));
    return sendError(
      res,
      'VALIDATION_ERROR',
      'Validation failed',
      422,
      formattedErrors
    );
  }
  next();
};

/**
 * Centralized error handler
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('❌ Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e: any) => ({
      field: e.path,
      message: e.message
    }));
    return sendError(res, 'VALIDATION_ERROR', 'Database validation failed', 422, errors);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return sendError(
      res,
      'DUPLICATE_ERROR',
      `${field} already exists`,
      400,
      { field }
    );
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 'INVALID_TOKEN', 'Invalid token', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, 'TOKEN_EXPIRED', 'Token expired', 401);
  }

  // Default error
  return sendError(
    res,
    err.code || 'SERVER_ERROR',
    err.message || 'Internal server error',
    err.status || 500
  );
};

/**
 * 404 handler
 */
export const notFoundHandler = (req: Request, res: Response) => {
  sendError(res, 'NOT_FOUND', `Route ${req.path} not found`, 404);
};
