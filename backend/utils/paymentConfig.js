// The placeholder values shipped in .env.example look like real settings to
// `process.env`, so a half-finished deployment would otherwise behave as if
// payments were wired up. Treat them as unconfigured.
const PLACEHOLDER = /your_|_here|change_this|change-in-production/i;

const isSet = (value) =>
  typeof value === 'string' && value.trim() !== '' && !PLACEHOLDER.test(value);

const stripeConfigured = () => isSet(process.env.STRIPE_SECRET_KEY);

const paypalConfigured = () =>
  isSet(process.env.PAYPAL_CLIENT_ID) && isSet(process.env.PAYPAL_CLIENT_SECRET);

const isProduction = () => process.env.NODE_ENV === 'production';

// Listed at boot so a misconfigured deploy is obvious in the logs rather than
// only surfacing when a customer reaches checkout.
function paymentConfigWarnings() {
  const warnings = [];
  if (!stripeConfigured()) warnings.push('Stripe card payments disabled — STRIPE_SECRET_KEY is unset or a placeholder');
  if (stripeConfigured() && !isSet(process.env.STRIPE_WEBHOOK_SECRET)) {
    warnings.push('Stripe orders will never be marked paid — STRIPE_WEBHOOK_SECRET is unset or a placeholder');
  }
  if (!paypalConfigured()) warnings.push('PayPal disabled — PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET unset or placeholders');
  return warnings;
}

module.exports = { isSet, stripeConfigured, paypalConfigured, isProduction, paymentConfigWarnings };
