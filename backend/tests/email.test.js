jest.mock('resend', () => {
  const send = jest.fn().mockResolvedValue({ data: { id: 'mock-email-id' }, error: null });
  return { Resend: jest.fn().mockImplementation(() => ({ emails: { send } })) };
});

const { sendEmail, sendTemplateEmail } = require('../utils/email');

describe('sendEmail (Resend)', () => {
  const originalKey = process.env.RESEND_API_KEY;
  afterEach(() => { process.env.RESEND_API_KEY = originalKey; });

  it('returns preview:true when RESEND_API_KEY is not configured', async () => {
    delete process.env.RESEND_API_KEY;
    const result = await sendEmail({ to: 'a@b.com', subject: 'Hi', html: '<p>Hi</p>' });
    expect(result).toEqual({ success: true, preview: true });
  });

  it('sends via Resend and returns the message id when configured', async () => {
    process.env.RESEND_API_KEY = 're_test_key';
    const result = await sendEmail({ to: 'a@b.com', subject: 'Hi', html: '<p>Hi</p>' });
    expect(result.success).toBe(true);
    expect(result.id).toBe('mock-email-id');
  });

  it('sendTemplateEmail resolves a known template', async () => {
    process.env.RESEND_API_KEY = 're_test_key';
    const result = await sendTemplateEmail('welcome', 'a@b.com', { firstName: 'Amina', verificationToken: 'abc' });
    expect(result.success).toBe(true);
  });
});

describe('sendTemplateEmail (single flattened data object, matching real call sites)', () => {
  const originalKey = process.env.RESEND_API_KEY;
  beforeEach(() => { process.env.RESEND_API_KEY = 're_test_key'; });
  afterEach(() => { process.env.RESEND_API_KEY = originalKey; });

  const order = {
    _id: 'order1', orderNumber: 'ML-1', items: [{ name: 'Bag', size: 'M', quantity: 1, price: 100 }],
    subtotal: 100, shippingCost: 0, total: 100, trackingNumber: 'TRACK1', trackingUrl: null,
    estimatedDelivery: null, cancelReason: null,
  };

  it.each([
    ['signIn', { firstName: 'Amina', ip: '1.2.3.4', userAgent: 'test-agent' }],
    ['passwordResetRequest', { firstName: 'Amina', resetToken: 'tok' }],
    ['profileUpdated', { firstName: 'Amina', changes: ['Email updated'] }],
    ['orderConfirmed', { firstName: 'Amina', ...order }],
    ['orderShipped', { firstName: 'Amina', ...order }],
    ['orderDelivered', { firstName: 'Amina', ...order }],
    ['orderCancelled', { firstName: 'Amina', ...order }],
    ['returnRequested', { firstName: 'Amina', ...order }],
  ])('%s does not throw when called with the data shape its call sites actually pass', async (templateName, data) => {
    const result = await sendTemplateEmail(templateName, 'a@b.com', data);
    expect(result.success).toBe(true);
  });
});
