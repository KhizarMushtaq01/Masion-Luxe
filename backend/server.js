require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');
const { paymentConfigWarnings } = require('./utils/paymentConfig');

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    for (const warning of paymentConfigWarnings()) console.warn(`[config] ${warning}`);
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
