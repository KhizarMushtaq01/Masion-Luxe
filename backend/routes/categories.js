const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { Category } = require('../models/index');

router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort('sortOrder name');
    res.json({ success: true, categories });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/', protect, authorize('admin','superadmin'), async (req, res) => {
  try {
    const cat = await Category.create(req.body);
    res.status(201).json({ success: true, category: cat });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

router.put('/:id', protect, authorize('admin','superadmin'), async (req, res) => {
  try {
    const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, category: cat });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

router.delete('/:id', protect, authorize('admin','superadmin'), async (req, res) => {
  try {
    await Category.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Category deactivated.' });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

module.exports = router;
