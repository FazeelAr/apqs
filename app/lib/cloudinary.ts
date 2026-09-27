import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

/**
 * Upload a file buffer / base64 string to Cloudinary
 */
export async function uploadToCloudinary(
  fileBase64OrUrl: string,
  folder: 'avatars' | 'events' | 'booklets' = 'events',
  resourceType: 'image' | 'raw' | 'auto' = 'auto'
): Promise<{ url: string; publicId: string }> {
  const result = await cloudinary.uploader.upload(fileBase64OrUrl, {
    folder: `apqs/${folder}`,
    resource_type: resourceType,
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}
