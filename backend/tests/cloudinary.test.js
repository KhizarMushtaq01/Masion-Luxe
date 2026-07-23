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

const { uploadImage, deleteImage } = require('../utils/cloudinary');

describe('cloudinary utils', () => {
  it('uploadImage resolves with url and publicId', async () => {
    const result = await uploadImage(Buffer.from('fake-image-data'), 'maison-luxe/avatars');
    expect(result).toEqual({ url: 'https://res.cloudinary.com/demo/image/upload/mock.jpg', publicId: 'maison-luxe/mock123' });
  });

  it('deleteImage calls cloudinary destroy', async () => {
    await expect(deleteImage('maison-luxe/mock123')).resolves.not.toThrow();
  });
});
