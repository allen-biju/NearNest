import { Request, Response, NextFunction } from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import { User } from '../models/Schemas';
import { getEnv } from '../config/env';
import { sendError } from '../utils/response';
import { getRedis } from '../config/redis';
import logger from '../config/logger';

const env = getEnv();

export interface AuthRequest extends Request {
  user?: any;
  token?: string;
}

export type IAuthRequest = AuthRequest;

/**
 * Verify JWT token
 */
export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token =
      req.headers.authorization?.split(' ')[1] ||
      req.cookies['access_token'];

    if (!token) {
      return sendError(res, 'UNAUTHORIZED', 'No token provided', 401);
    }

    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as any;
    req.user = decoded;
    req.token = token;
    next();
  } catch (error: any) {
    logger.error('Auth middleware error:', error);

    if (error.name === 'TokenExpiredError') {
      return sendError(res, 'TOKEN_EXPIRED', 'Access token expired', 401);
    }

    if (error.name === 'JsonWebTokenError') {
      return sendError(res, 'INVALID_TOKEN', 'Invalid token', 401);
    }

    return sendError(res, 'UNAUTHORIZED', 'Authentication failed', 401);
  }
};

/**
 * Require seller role
 */
export const requireSeller = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user?.role.includes('seller')) {
    return sendError(res, 'FORBIDDEN', 'Seller access required', 403);
  }
  next();
};

/**
 * Require admin role
 */
export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  const adminRoles = ['admin', 'superadmin', 'moderator'];
  if (!req.user?.role.some((r: string) => adminRoles.includes(r))) {
    return sendError(res, 'FORBIDDEN', 'Admin access required', 403);
  }
  next();
};

/**
 * Require superadmin role
 */
export const requireSuperAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user?.role.includes('superadmin')) {
    return sendError(res, 'FORBIDDEN', 'Superadmin access required', 403);
  }
  next();
};

/**
 * Generate JWT tokens
 */
export const generateTokens = (userId: string, email: string, roles: string[]) => {
  const payload = { _id: userId, email, role: roles };

  const accessSecret = env.JWT_ACCESS_SECRET as unknown as jwt.Secret;
  const refreshSecret = env.JWT_REFRESH_SECRET as unknown as jwt.Secret;

  const accessToken = jwt.sign(payload, accessSecret, {
    expiresIn: env.JWT_ACCESS_EXPIRY as string
  } as jwt.SignOptions);

  const refreshToken = jwt.sign(payload, refreshSecret, {
    expiresIn: env.JWT_REFRESH_EXPIRY as string
  } as jwt.SignOptions);

  return { accessToken, refreshToken };
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): any => {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * Optional auth (doesn't fail if no token)
 */
export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token =
      req.headers.authorization?.split(' ')[1] ||
      req.cookies['access_token'];

    if (token) {
      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as any;
      req.user = decoded;
    }
  } catch (error) {
    // Silent fail
  }

  next();
};
