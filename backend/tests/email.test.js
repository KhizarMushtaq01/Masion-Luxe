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
