jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload_stream: jest.fn((options, callback) => {
        const { Writable } = require('stream');
        const stream = new Writable({
          write(chunk, enc, cb) { cb(); }
        });
        stream.end = () => callback(null, { secure_url: 'https://res.cloudinary.com/demo/image/upload/mock.jpg', public_id: 'maison-luxe/mock123' });
        return stream;
      }),
      destroy: jest.fn().mockResolvedValue({ result: 'ok' })
    }
  }
}));

const cloudinary = require('cloudinary').v2;
const { uploadImage, deleteImage } = require('../utils/cloudinary');

const ENV_KEYS = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
const originalEnv = {};
beforeAll(() => { ENV_KEYS.forEach(k => { originalEnv[k] = process.env[k]; }); });
afterEach(() => { ENV_KEYS.forEach(k => { process.env[k] = originalEnv[k]; }); jest.clearAllMocks(); });

describe('cloudinary utils (configured)', () => {
  beforeEach(() => {
    process.env.CLOUDINARY_CLOUD_NAME = 'demo';
    process.env.CLOUDINARY_API_KEY = '123456789012345';
    process.env.CLOUDINARY_API_SECRET = 'real-secret-value';
  });

  it('uploadImage resolves with url and publicId', async () => {
    const result = await uploadImage(Buffer.from('fake-image-data'), 'maison-luxe/avatars');
    expect(result).toEqual({ url: 'https://res.cloudinary.com/demo/image/upload/mock.jpg', publicId: 'maison-luxe/mock123' });
  });

  it('deleteImage calls cloudinary destroy', async () => {
    await expect(deleteImage('maison-luxe/mock123')).resolves.not.toThrow();
    expect(cloudinary.uploader.destroy).toHaveBeenCalledWith('maison-luxe/mock123');
  });
});

describe('cloudinary utils (not configured)', () => {
  beforeEach(() => {
    delete process.env.CLOUDINARY_CLOUD_NAME;
    process.env.CLOUDINARY_API_KEY = 'your_api_key';
    process.env.CLOUDINARY_API_SECRET = 'your_api_secret';
  });

  it('uploadImage resolves with a mock result instead of calling Cloudinary', async () => {
    const result = await uploadImage(Buffer.from('fake-image-data'), 'maison-luxe/avatars');
    expect(result.url).toBeTruthy();
    expect(result.publicId).toContain('maison-luxe/avatars');
    expect(cloudinary.uploader.upload_stream).not.toHaveBeenCalled();
  });

  it('deleteImage resolves without calling Cloudinary destroy', async () => {
    await expect(deleteImage('maison-luxe/mock123')).resolves.not.toThrow();
    expect(cloudinary.uploader.destroy).not.toHaveBeenCalled();
  });
});
