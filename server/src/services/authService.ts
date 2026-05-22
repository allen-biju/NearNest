import { User } from '../models/Schemas';
import { hashPassword, comparePassword, generateOTP } from '../utils/crypto';
import { generateTokens, verifyRefreshToken } from '../middleware/auth';
import { generateReferralCode, generateSlug } from '../utils/generators';
import logger from '../config/logger';

export class AuthService {
  /**
   * Register new user
   */
  static async register(userData: {
    name: string;
    email?: string;
    phone?: string;
    password: string;
    referralCode?: string;
  }) {
    try {
      // Validate input
      if (!userData.email && !userData.phone) {
        throw new Error('Email or phone required');
      }

      // Check if user exists
      if (userData.email) {
        const existingEmail = await User.findOne({ email: userData.email });
        if (existingEmail) throw new Error('Email already registered');
      }

      if (userData.phone) {
        const existingPhone = await User.findOne({ phone: userData.phone });
        if (existingPhone) throw new Error('Phone already registered');
      }

      // Hash password
      const passwordHash = await hashPassword(userData.password);

      // Generate referral code
      const referralCode = generateReferralCode(userData.email || userData.phone || '');

      // Create user
      const user = new User({
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        passwordHash,
        referralCode,
        role: ['buyer'],
        isEmailVerified: false,
        isPhoneVerified: false
      });

      await user.save();

      // Handle referral
      if (userData.referralCode) {
        const referrer = await User.findOne({ referralCode: userData.referralCode });
        if (referrer) {
          user.referredBy = referrer._id;
          referrer.walletBalance += 50; // Referral bonus
          await user.save();
          await referrer.save();
        }
      }

      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      };
    } catch (error) {
      logger.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Login user
   */
  static async login(credentials: { email?: string; phone?: string; password: string }) {
    try {
      const user = await User.findOne({
        $or: [{ email: credentials.email }, { phone: credentials.phone }]
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Verify password
      const isPasswordValid = await comparePassword(credentials.password, user.passwordHash);
      if (!isPasswordValid) {
        throw new Error('Invalid password');
      }

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(
        user._id.toString(),
        user.email || user.phone || '',
        user.role
      );

      return {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role
        },
        accessToken,
        refreshToken
      };
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(refreshToken: string) {
    try {
      const decoded = verifyRefreshToken(refreshToken);
      if (!decoded) {
        throw new Error('Invalid refresh token');
      }

      const user = await User.findById(decoded._id);
      if (!user) {
        throw new Error('User not found');
      }

      const tokens = generateTokens(user._id.toString(), user.email || user.phone || '', user.role);

      return tokens;
    } catch (error) {
      logger.error('Token refresh error:', error);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string) {
    try {
      const user = await User.findById(userId).select('-passwordHash');
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      logger.error('Get user error:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: string, updateData: any) {
    try {
      const user = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true
      }).select('-passwordHash');

      return user;
    } catch (error) {
      logger.error('Update profile error:', error);
      throw error;
    }
  }

  /**
   * Add address
   */
  static async addAddress(userId: string, addressData: any) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      // If this is the first address, make it default
      if (user.addresses.length === 0) {
        addressData.isDefault = true;
        user.defaultAddressIndex = 0;
      }

      user.addresses.push(addressData);
      await user.save();

      return user.addresses;
    } catch (error) {
      logger.error('Add address error:', error);
      throw error;
    }
  }

  /**
   * Update address
   */
  static async updateAddress(userId: string, addressIndex: number, addressData: any) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');
      if (!user.addresses[addressIndex]) throw new Error('Address not found');

      user.addresses[addressIndex] = {
        ...user.addresses[addressIndex],
        ...addressData
      };

      await user.save();
      return user.addresses;
    } catch (error) {
      logger.error('Update address error:', error);
      throw error;
    }
  }

  /**
   * Delete address
   */
  static async deleteAddress(userId: string, addressIndex: number) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      user.addresses.splice(addressIndex, 1);

      // Adjust default address index
      if (user.defaultAddressIndex === addressIndex && user.addresses.length > 0) {
        user.defaultAddressIndex = 0;
        user.addresses[0].isDefault = true;
      }

      await user.save();
      return user.addresses;
    } catch (error) {
      logger.error('Delete address error:', error);
      throw error;
    }
  }

  /**
   * Generate and send OTP
   */
  static async sendOTP(phone: string): Promise<string> {
    try {
      const otp = generateOTP();

      // In production, send via Twilio/MSG91
      // For development, just log it
      logger.info(`📱 OTP for ${phone}: ${otp}`);

      // Store OTP in Redis with 5 minute expiry
      // await redisClient.setex(`otp:${phone}`, 300, otp);

      return otp; // For testing only
    } catch (error) {
      logger.error('Send OTP error:', error);
      throw error;
    }
  }

  /**
   * Verify OTP and create/login user
   */
  static async verifyOTP(phone: string, otp: string) {
    try {
      // In production, verify OTP from Redis
      // const storedOTP = await redisClient.get(`otp:${phone}`);
      // if (!storedOTP || storedOTP !== otp) {
      //   throw new Error('Invalid OTP');
      // }

      // Find or create user
      let user = await User.findOne({ phone });

      if (!user) {
        user = new User({
          name: phone, // Will be updated by user
          phone,
          passwordHash: await hashPassword(Math.random().toString()), // Temporary
          referralCode: generateReferralCode(phone),
          role: ['buyer'],
          isPhoneVerified: true
        });
        await user.save();
      }

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(
        user._id.toString(),
        user.email || user.phone || '',
        user.role
      );

      return {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role
        },
        accessToken,
        refreshToken
      };
    } catch (error) {
      logger.error('Verify OTP error:', error);
      throw error;
    }
  }
}

export default AuthService;
