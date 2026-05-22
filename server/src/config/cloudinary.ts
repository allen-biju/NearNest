import { v2 as cloudinary } from 'cloudinary';
import { getEnv } from './env';

const env = getEnv();

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET
});

export const uploadToCloudinary = async (
  file: Express.Multer.File | string,
  folder: string = 'nearnest'
): Promise<{ url: string; publicId: string }> => {
  try {
    let uploadResult;
    
    if (typeof file === 'string') {
      // File path provided
      uploadResult = await cloudinary.uploader.upload(file, {
        folder: folder,
        resource_type: 'auto'
      });
    } else {
      // Express.Multer.File provided (from multer middleware)
      const dataURI = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      uploadResult = await cloudinary.uploader.upload(dataURI, {
        folder: folder,
        resource_type: 'auto'
      });
    }

    return {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id
    };
  } catch (error) {
    console.error('❌ Cloudinary upload error:', error);
    throw error;
  }
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('❌ Cloudinary delete error:', error);
  }
};

export const generateImageUrl = (
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: 'fill' | 'fit' | 'thumb';
    quality?: 'auto';
    format?: 'auto' | 'webp';
  } = {}
): string => {
  return cloudinary.url(publicId, {
    width: options.width,
    height: options.height,
    crop: options.crop || 'fill',
    quality: options.quality || 'auto',
    format: options.format || 'auto'
  });
};

export default cloudinary;
