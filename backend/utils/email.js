const { Resend } = require('resend');

const getResendClient = () => new Resend(process.env.RESEND_API_KEY);

const baseTemplate = (content, preheader = '') => `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="x-apple-disable-message-reformatting"/>
<title>Maison Luxe</title>
<style>
  body{margin:0;padding:0;background:#f4f0ec;font-family:'Georgia',serif}
  .container{max-width:600px;margin:0 auto;background:#fff}
  .header{background:#0a0a0a;padding:40px 48px;text-align:center}
  .header-logo{font-size:28px;letter-spacing:8px;color:#c9a96e;font-family:Georgia,serif;text-transform:uppercase}
  .header-tagline{color:#666;font-size:11px;letter-spacing:4px;margin-top:6px;text-transform:uppercase}
  .gold-bar{height:3px;background:linear-gradient(90deg,#c9a96e,#f0d080,#c9a96e)}
  .body{padding:48px}
  .greeting{font-size:22px;color:#0a0a0a;margin-bottom:8px;font-weight:400}
  .text{font-size:15px;color:#444;line-height:1.7;margin-bottom:16px}
  .btn{display:inline-block;background:#0a0a0a;color:#fff !important;padding:16px 40px;text-decoration:none;font-size:12px;letter-spacing:3px;text-transform:uppercase;margin:24px 0;font-family:Arial,sans-serif}
  .btn-gold{background:linear-gradient(135deg,#c9a96e,#b8963d);color:#fff !important}
  .divider{border:none;border-top:1px solid #e8e0d0;margin:32px 0}
  .order-table{width:100%;border-collapse:collapse;margin:24px 0}
  .order-table th{background:#0a0a0a;color:#c9a96e;padding:12px 16px;font-size:11px;letter-spacing:2px;text-transform:uppercase;text-align:left}
  .order-table td{padding:12px 16px;border-bottom:1px solid #f0ebe3;font-size:14px;color:#333}
  .total-row td{font-weight:bold;background:#f9f5f0;font-size:15px}
  .highlight-box{background:#f9f5f0;border-left:3px solid #c9a96e;padding:20px 24px;margin:24px 0}
  .footer{background:#0a0a0a;padding:32px 48px;text-align:center}
  .footer-text{color:#666;font-size:11px;line-height:1.8;letter-spacing:1px}
  .social-links{margin:16px 0}
  .social-link{color:#c9a96e !important;text-decoration:none;font-size:11px;letter-spacing:2px;margin:0 12px;text-transform:uppercase}
  .status-badge{display:inline-block;padding:6px 16px;border-radius:2px;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif}
  .status-confirmed{background:#e8f4e8;color:#2d7d2d}
  .status-shipped{background:#e8eef4;color:#1a4a8a}
  .status-delivered{background:#c9a96e;color:#fff}
  .warning-box{background:#fff8e8;border-left:3px solid #e8a000;padding:20px 24px;margin:24px 0}
</style>
</head>
<body>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f0ec;padding:40px 0">
<tr><td align="center">
<div class="container">
  <div class="header">
    <div class="header-logo">Maison Luxe</div>
    <div class="header-tagline">The Art of Living Beautifully</div>
  </div>
  <div class="gold-bar"></div>
  <div class="body">
    ${content}
  </div>
  <div class="gold-bar"></div>
  <div class="footer">
    <div class="social-links">
      <a href="#" class="social-link">Instagram</a>
      <a href="#" class="social-link">Facebook</a>
      <a href="#" class="social-link">Pinterest</a>
    </div>
    <div class="footer-text">
      © ${new Date().getFullYear()} Maison Luxe. All rights reserved.<br/>
      You are receiving this email because you have an account with us.<br/>
      <a href="${process.env.CLIENT_URL}/account/preferences" style="color:#c9a96e">Manage Preferences</a> &nbsp;|&nbsp; 
      <a href="${process.env.CLIENT_URL}/unsubscribe" style="color:#c9a96e">Unsubscribe</a>
    </div>
  </div>
</div>
</td></tr>
</table>
</body>
</html>
`;

const emailTemplates = {
  welcome: (user) => ({
    subject: 'Welcome to Maison Luxe – Your Luxury Journey Begins',
    html: baseTemplate(`
      <div class="greeting">Welcome, ${user.firstName}.</div>
      <p class="text">You have entered the world of Maison Luxe. We are delighted to have you as a member of our exclusive community, where luxury meets artistry and every detail is crafted to perfection.</p>
      <div class="highlight-box">
        <strong style="color:#c9a96e;letter-spacing:2px;font-size:12px;text-transform:uppercase">Your Member Benefits</strong>
        <p style="margin:12px 0 0;color:#555;font-size:14px;line-height:1.8">
          &bull; &nbsp;Early access to new collections<br/>
          &bull; &nbsp;Exclusive member-only events<br/>
          &bull; &nbsp;Complimentary shipping on orders over $500<br/>
          &bull; &nbsp;Dedicated concierge service
        </p>
      </div>
      <p class="text">Please verify your email address to unlock all features of your account.</p>
      <center><a href="${process.env.CLIENT_URL}/verify-email?token=${user.verificationToken}" class="btn btn-gold">Verify Email Address</a></center>
      <p class="text" style="font-size:13px;color:#888">If you did not create an account, you may safely ignore this email.</p>
    `)
  }),

  emailVerified: (user) => ({
    subject: 'Email Verified – Welcome to Maison Luxe',
    html: baseTemplate(`
      <div class="greeting">Your email has been verified.</div>
      <p class="text">Wonderful, ${user.firstName}. Your account is now fully active. Begin exploring our curated collections of the world's finest fashion and accessories.</p>
      <center><a href="${process.env.CLIENT_URL}/shop" class="btn btn-gold">Explore Collections</a></center>
    `)
  }),

  signIn: (user, loginInfo) => ({
    subject: 'New Sign-in to Your Maison Luxe Account',
    html: baseTemplate(`
      <div class="greeting">New sign-in detected.</div>
      <p class="text">Dear ${user.firstName}, we noticed a new sign-in to your Maison Luxe account.</p>
      <div class="highlight-box">
        <strong style="color:#0a0a0a;font-size:13px">Login Details</strong>
        <p style="margin:12px 0 0;color:#555;font-size:14px;line-height:2">
          <strong>Time:</strong> ${new Date().toLocaleString('en-US', { timeZone: 'UTC' })} UTC<br/>
          <strong>Device:</strong> ${loginInfo.userAgent || 'Unknown'}<br/>
          <strong>IP Address:</strong> ${loginInfo.ip || 'Unknown'}
        </p>
      </div>
      <div class="warning-box">
        <strong style="color:#e8a000">Was this not you?</strong>
        <p style="margin:8px 0 0;color:#555;font-size:14px">If you did not sign in, please secure your account immediately.</p>
        <a href="${process.env.CLIENT_URL}/account/security" style="color:#c9a96e">Secure My Account →</a>
      </div>
    `)
  }),

  passwordResetRequest: (user, resetToken) => ({
    subject: 'Password Reset Request – Maison Luxe',
    html: baseTemplate(`
      <div class="greeting">Password reset requested.</div>
      <p class="text">Dear ${user.firstName}, we received a request to reset the password for your account. This link will expire in 1 hour.</p>
      <center><a href="${process.env.CLIENT_URL}/reset-password?token=${resetToken}" class="btn">Reset Password</a></center>
      <div class="warning-box">
        <strong style="color:#e8a000">Didn't request this?</strong>
        <p style="margin:8px 0 0;color:#555;font-size:14px">If you did not request a password reset, your account may be compromised. Please contact our support team immediately.</p>
      </div>
    `)
  }),

  passwordChanged: (user) => ({
    subject: 'Password Successfully Changed – Maison Luxe',
    html: baseTemplate(`
      <div class="greeting">Password updated successfully.</div>
      <p class="text">Dear ${user.firstName}, your account password has been successfully changed on ${new Date().toLocaleString()}.</p>
      <div class="warning-box">
        <strong style="color:#e8a000">Was this not you?</strong>
        <p style="margin:8px 0 0;color:#555;font-size:14px">If you did not change your password, contact support immediately.</p>
      </div>
    `)
  }),

  profileUpdated: (user, changes) => ({
    subject: 'Profile Updated – Maison Luxe',
    html: baseTemplate(`
      <div class="greeting">Profile updated.</div>
      <p class="text">Dear ${user.firstName}, the following changes were made to your account:</p>
      <div class="highlight-box">
        ${changes.map(c => `<p style="margin:4px 0;font-size:14px;color:#555">&bull; &nbsp;${c}</p>`).join('')}
      </div>
      <p class="text">If you did not make these changes, please contact our support team immediately.</p>
    `)
  }),

  orderConfirmed: (user, order) => ({
    subject: `Order Confirmed – #${order.orderNumber} | Maison Luxe`,
    html: baseTemplate(`
      <div class="greeting">Thank you for your order.</div>
      <p class="text">Dear ${user.firstName}, your order has been confirmed and is being prepared with the utmost care.</p>
      <div class="highlight-box" style="text-align:center">
        <strong style="color:#888;font-size:11px;letter-spacing:2px;text-transform:uppercase">Order Number</strong><br/>
        <strong style="font-size:24px;color:#0a0a0a;letter-spacing:4px">${order.orderNumber}</strong>
      </div>
      <table class="order-table">
        <tr>
          <th>Product</th>
          <th>Size</th>
          <th>Qty</th>
          <th>Price</th>
        </tr>
        ${order.items.map(item => `
        <tr>
          <td><strong>${item.name}</strong></td>
          <td>${item.size || '—'}</td>
          <td>${item.quantity}</td>
          <td>$${item.price.toFixed(2)}</td>
        </tr>`).join('')}
        <tr class="total-row">
          <td colspan="3">Subtotal</td>
          <td>$${order.subtotal.toFixed(2)}</td>
        </tr>
        <tr>
          <td colspan="3" style="padding:8px 16px;font-size:13px;color:#666">Shipping</td>
          <td style="padding:8px 16px;font-size:13px;color:#666">${order.shippingCost === 0 ? 'Complimentary' : '$' + order.shippingCost.toFixed(2)}</td>
        </tr>
        <tr class="total-row">
          <td colspan="3">Total</td>
          <td>$${order.total.toFixed(2)}</td>
        </tr>
      </table>
      <center><a href="${process.env.CLIENT_URL}/account/orders/${order._id}" class="btn btn-gold">Track Your Order</a></center>
    `)
  }),

  orderShipped: (user, order) => ({
    subject: `Your Order is On Its Way – #${order.orderNumber}`,
    html: baseTemplate(`
      <div class="greeting">Your order has shipped.</div>
      <p class="text">Dear ${user.firstName}, your Maison Luxe order is now on its way to you. We have entrusted it to our premium delivery partners.</p>
      <div class="highlight-box" style="text-align:center">
        <div style="font-size:11px;color:#888;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px">Tracking Number</div>
        <strong style="font-size:20px;color:#0a0a0a;letter-spacing:3px">${order.trackingNumber || 'Available Soon'}</strong>
      </div>
      ${order.estimatedDelivery ? `<p class="text">Estimated delivery: <strong>${new Date(order.estimatedDelivery).toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</strong></p>` : ''}
      <center><a href="${order.trackingUrl || process.env.CLIENT_URL + '/account/orders/' + order._id}" class="btn">Track Shipment</a></center>
    `)
  }),

  orderDelivered: (user, order) => ({
    subject: `Order Delivered – Your Maison Luxe Experience`,
    html: baseTemplate(`
      <div class="greeting">Your order has arrived.</div>
      <p class="text">Dear ${user.firstName}, your Maison Luxe order #${order.orderNumber} has been successfully delivered. We hope it brings you the joy and elegance it was crafted to provide.</p>
      <center><a href="${process.env.CLIENT_URL}/products/${order.items[0]?.product}/review" class="btn btn-gold">Share Your Experience</a></center>
    `)
  }),

  orderCancelled: (user, order) => ({
    subject: `Order Cancelled – #${order.orderNumber}`,
    html: baseTemplate(`
      <div class="greeting">Order cancellation confirmed.</div>
      <p class="text">Dear ${user.firstName}, your order #${order.orderNumber} has been cancelled. ${order.cancelReason ? `Reason: ${order.cancelReason}.` : ''}</p>
      <p class="text">If payment was processed, a refund will be issued within 5-10 business days to your original payment method.</p>
      <center><a href="${process.env.CLIENT_URL}/shop" class="btn btn-gold">Continue Shopping</a></center>
    `)
  }),

  newsletterSubscribe: (email) => ({
    subject: 'Welcome to the World of Maison Luxe',
    html: baseTemplate(`
      <div class="greeting">You are subscribed.</div>
      <p class="text">Thank you for joining the Maison Luxe newsletter. Be among the first to discover new collections, exclusive events, and curated style stories delivered directly to your inbox.</p>
      <p class="text" style="font-size:13px;color:#888">You may unsubscribe at any time.</p>
    `)
  }),

  avatarChanged: (user) => ({
    subject: 'Profile Photo Updated – Maison Luxe',
    html: baseTemplate(`
      <div class="greeting">Profile photo updated.</div>
      <p class="text">Dear ${user.firstName}, your Maison Luxe profile photo has been successfully updated.</p>
      <p class="text">If you did not make this change, please contact our support team immediately.</p>
    `)
  }),

  adminBanUser: (user) => ({
    subject: 'Account Status Update – Maison Luxe',
    html: baseTemplate(`
      <div class="greeting">Account Update.</div>
      <p class="text">Dear ${user.firstName}, your Maison Luxe account has been suspended. If you believe this is an error, please contact our support team.</p>
    `)
  }),

  returnRequested: (user, order) => ({
    subject: `Return Request Received – #${order.orderNumber}`,
    html: baseTemplate(`
      <div class="greeting">Return request received.</div>
      <p class="text">Dear ${user.firstName}, we have received your return request for order #${order.orderNumber}. Our team will review your request within 1-2 business days.</p>
      <center><a href="${process.env.CLIENT_URL}/account/orders/${order._id}" class="btn">View Order Details</a></center>
    `)
  })
};

const sendEmail = async ({ to, subject, html }) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log('[EMAIL] Resend API key not configured. Email not sent to:', to);
      console.log('[EMAIL] Subject:', subject);
      return { success: true, preview: true };
    }

    const resend = getResendClient();
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Maison Luxe <onboarding@resend.dev>',
      to,
      subject,
      html
    });

    if (error) {
      console.error('[EMAIL] Resend error:', error.message || error);
      return { success: false, error: error.message || String(error) };
    }

    console.log(`[EMAIL] Sent to ${to}: ${data.id}`);
    return { success: true, id: data.id };
  } catch (error) {
    console.error('[EMAIL] error:', error.message);
    return { success: false, error: error.message };
  }
};

const sendTemplateEmail = async (templateName, recipient, data) => {
  try {
    const template = emailTemplates[templateName];
    if (!template) throw new Error(`Template '${templateName}' not found`);
    const { subject, html } = template(data);
    return sendEmail({ to: recipient, subject, html });
  } catch (error) {
    console.error('Email template error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendEmail, sendTemplateEmail, emailTemplates };
