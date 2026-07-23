const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');

router.get('/', async (req, res, next) => {
  try {
    const settings = await Settings.getSettings();
    res.json({ success: true, settings });
  } catch (err) { next(err); }
});

module.exports = router;
