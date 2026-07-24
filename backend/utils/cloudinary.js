const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const isConfigured = () =>
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY && !process.env.CLOUDINARY_API_KEY.includes('your_api_key') &&
  process.env.CLOUDINARY_API_SECRET && !process.env.CLOUDINARY_API_SECRET.includes('your_api_secret');

const uploadImage = (buffer, folder) => {
  if (!isConfigured()) {
    console.log('[CLOUDINARY] Not configured. Returning a mock upload result for folder:', folder);
    return Promise.resolve({ url: 'https://placehold.co/400x400', publicId: `${folder}/mock-${Date.now()}` });
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
};

const deleteImage = async (publicId) => {
  if (!publicId || !isConfigured()) return;
  await cloudinary.uploader.destroy(publicId);
};

module.exports = { uploadImage, deleteImage };
