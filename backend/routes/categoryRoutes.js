const express = require('express');
const Category = require('../models/Category');
const protect = require('../middleware/authMiddleware');
const itemRoutes = require('./itemRoutes')
const Item = require('../models/Item'); 
const mongoose = require('mongoose');

const router = express.Router();

// Get all categories (User-specific)
router.get('/', protect, async (req, res) => {
  try {
    const categories = await Category.find({ userId: req.user.id }).sort({ order: 1 });

    const populatedCategories = await Promise.all(
      categories.map(async (category) => {
        try {
          // Validate category ID format first
          if (!mongoose.Types.ObjectId.isValid(category._id)) {
            console.error(`Invalid category ID: ${category._id}`);
            return { ...category.toObject(), items: [] };
          }

          const items = await Item.find({ 
            categoryId: category._id,
            userId: req.user.id 
          }).sort('order');

          return { ...category.toObject(), items };
          
        } catch (error) {
          console.error(`Error loading items for category ${category._id}:`, error);
          return { ...category.toObject(), items: [] }; // Graceful degradation
        }
      })
    );

    res.json(populatedCategories);
  } catch (error) {
    console.error('Category fetch failed:', error.stack); // Detailed error
    res.status(500).json({ 
      message: 'Failed to fetch categories',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
});
// Create a new category (requires authentication)
router.post('/', protect, async (req, res) => {
  const { name } = req.body;

  if (!name || typeof name !== 'string') {
    return res.status(400).json({ message: 'Category name is required and must be a string.' });
  }

  try {
    const existingCategory = await Category.findOne({ name, userId: req.user.id });
    if (existingCategory) {
      return res.status(400).json({ message: 'Category with this name already exists' });
    }

    const lastCategory = await Category.findOne({ userId: req.user.id }).sort({ order: -1 });
    const nextOrder = lastCategory ? lastCategory.order + 1 : 0;

    const category = await Category.create({ name, userId: req.user.id, order: nextOrder });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create category', error: error.message });
  }
});
router.put('/order', protect, async (req, res) => {
  const { categories } = req.body;

  // Validate all category IDs
  const invalidIds = categories.filter(cat => 
    !mongoose.Types.ObjectId.isValid(cat.id)
  );
  
  if (invalidIds.length > 0) {
    console.error("Invalid category IDs:", invalidIds);
    return res.status(400).json({ 
      message: 'Invalid category ID format',
      invalidIds: invalidIds.map(cat => cat.id) 
    });
  }
  try {
    const { categories } = req.body;

    // Perform bulk update
    const bulkOps = categories.map((cat) => ({
      updateOne: {
        filter: { _id: new mongoose.Types.ObjectId(cat.id), userId: req.user.id },
        update: { $set: { order: cat.order } },
      },
    }));

    await Category.bulkWrite(bulkOps);

    // Return FULL updated categories
    const updatedCategories = await Category.find({ userId: req.user.id })
    .sort({ order: 1 })
    .lean();

  res.status(200).json(updatedCategories);
} catch (error) {
  res.status(500).json({ message: 'Failed to update order', error: error.message });
}
});
// Fetch a category by ID (public access)
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id); // Public access to fetch a single category
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    console.error('Error fetching category:', error.message);
    res.status(500).json({ message: 'Failed to fetch category', error: error.message });
  }
});

// Update a category (requires authentication)
router.put('/:id', protect, async (req, res) => {
  const { name, isExpanded } = req.body;

  // Remove `name` requirement so updates without `name` succeed
  const updateFields = {};
  if (name) updateFields.name = name;
  if (isExpanded !== undefined) updateFields.isExpanded = isExpanded;

  try {
    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      updateFields,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category);
  } catch (err) {
    console.error('Error updating category:', err.message);
    res.status(500).json({ message: 'Failed to update category', error: err.message });
  }
});

// Delete a category (requires authentication)
router.delete('/:id', protect, async (req, res) => {
  try {
    // Delete the category
    const category = await Category.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Delete all items that belong to the deleted category
    await Item.deleteMany({
      categoryId: category._id,
      userId: req.user.id,
    });

    res.status(204).end();
  } catch (err) {
    console.error('Error deleting category and its items:', err.message);
    res.status(500).json({ message: 'Failed to delete category', error: err.message });
  }
});

// Toggle category expansion (requires authentication)
router.put('/:id/toggle', protect, async (req, res) => {
  try {
    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: { isExpanded: req.body.isExpanded } },
      { new: true }
    );
    res.json(category);
  } catch (err) {
    console.error('Error toggling category:', err.message);
    res.status(500).json({ message: 'Failed to toggle category', error: err.message });
  }
});

// Nested routes for items (requires authentication)
router.use('/:categoryId/items', protect, itemRoutes);

module.exports = router;