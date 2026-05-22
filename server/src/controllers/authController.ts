import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth';
import AuthService from '../services/authService';
import { sendSuccess, sendError } from '../utils/response';
import logger from '../config/logger';

/**
 * Register new user
 * POST /api/v1/auth/register
 */
export const register = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    const { name, email, phone, password, referralCode } = req.body;

    const user = await AuthService.register({
      name,
      email,
      phone,
      password,
      referralCode
    });

    return sendSuccess(res, user, 'User registered successfully', 201);
  } catch (error: any) {
    logger.error('Register error:', error);
    return sendError(res, 'REGISTRATION_ERROR', error.message, 400);
  }
};

/**
 * Login user
 * POST /api/v1/auth/login
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, phone, password } = req.body;

    const result = await AuthService.login({ email, phone, password });

    // Set refresh token in httpOnly cookie
    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    return sendSuccess(
      res,
      {
        user: result.user,
        accessToken: result.accessToken
      },
      'Login successful'
    );
  } catch (error: any) {
    logger.error('Login error:', error);
    return sendError(res, 'LOGIN_ERROR', error.message, 401);
  }
};

/**
 * Refresh access token
 * POST /api/v1/auth/refresh
 */
export const refresh = async (req: AuthRequest, res: Response) => {
  try {
    const refreshToken = req.cookies['refresh_token'] || req.body.refreshToken;

    if (!refreshToken) {
      return sendError(res, 'NO_REFRESH_TOKEN', 'Refresh token not provided', 401);
    }

    const tokens = await AuthService.refreshToken(refreshToken);

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    return sendSuccess(res, { accessToken: tokens.accessToken }, 'Token refreshed');
  } catch (error: any) {
    logger.error('Refresh error:', error);
    return sendError(res, 'REFRESH_ERROR', error.message, 401);
  }
};

/**
 * Get current user
 * GET /api/v1/auth/me
 */
export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'UNAUTHORIZED', 'User not found', 401);
    }

    const user = await AuthService.getUserById(req.user._id);
    return sendSuccess(res, user, 'User retrieved');
  } catch (error: any) {
    logger.error('Get current user error:', error);
    return sendError(res, 'GET_USER_ERROR', error.message, 400);
  }
};

/**
 * Logout
 * POST /api/v1/auth/logout
 */
export const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie('refresh_token');
    return sendSuccess(res, null, 'Logged out successfully');
  } catch (error: any) {
    logger.error('Logout error:', error);
    return sendError(res, 'LOGOUT_ERROR', error.message, 400);
  }
};

/**
 * Send OTP
 * POST /api/v1/auth/otp/send
 */
export const sendOTP = async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return sendError(res, 'PHONE_REQUIRED', 'Phone number is required', 400);
    }

    const otp = await AuthService.sendOTP(phone);

    return sendSuccess(res, { otp }, 'OTP sent successfully (dev only)');
  } catch (error: any) {
    logger.error('Send OTP error:', error);
    return sendError(res, 'OTP_SEND_ERROR', error.message, 400);
  }
};

/**
 * Verify OTP
 * POST /api/v1/auth/otp/verify
 */
export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return sendError(res, 'MISSING_FIELDS', 'Phone and OTP required', 400);
    }

    const result = await AuthService.verifyOTP(phone, otp);

    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    return sendSuccess(
      res,
      {
        user: result.user,
        accessToken: result.accessToken
      },
      'OTP verified successfully'
    );
  } catch (error: any) {
    logger.error('Verify OTP error:', error);
    return sendError(res, 'OTP_VERIFY_ERROR', error.message, 401);
  }
};

/**
 * Update address
 * POST /api/v1/auth/address
 */
export const updateAddress = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'UNAUTHORIZED', 'User not found', 401);
    }

    const { action, addressIndex, addressData } = req.body;

    let addresses;

    if (action === 'add') {
      addresses = await AuthService.addAddress(req.user._id, addressData);
    } else if (action === 'update') {
      addresses = await AuthService.updateAddress(req.user._id, addressIndex, addressData);
    } else if (action === 'delete') {
      addresses = await AuthService.deleteAddress(req.user._id, addressIndex);
    }

    return sendSuccess(res, { addresses }, 'Address updated');
  } catch (error: any) {
    logger.error('Update address error:', error);
    return sendError(res, 'ADDRESS_ERROR', error.message, 400);
  }
};

export default {
  register,
  login,
  refresh,
  getCurrentUser,
  logout,
  sendOTP,
  verifyOTP,
  updateAddress
};
