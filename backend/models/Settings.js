const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  taxRate: { type: Number, default: 0.08 },
  freeShippingThreshold: { type: Number, default: 500 },
  standardShippingCost: { type: Number, default: 25 },
  storeName: { type: String, default: 'Maison Luxe' },
  supportEmail: { type: String, default: 'support@maisonluxe.com' },
  supportPhone: { type: String, default: '' },
  socialLinks: {
    instagram: { type: String, default: '' },
    facebook: { type: String, default: '' },
    pinterest: { type: String, default: '' },
  },
}, { timestamps: true });

settingsSchema.statics.getSettings = async function () {
  return this.findOneAndUpdate(
    {},
    { $setOnInsert: {} },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

module.exports = mongoose.model('Settings', settingsSchema);
