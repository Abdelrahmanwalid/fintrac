const express = require('express');
const mongoose = require('mongoose');
const Item = require('../models/Item');
const Category = require('../models/Category');
const protect = require('../middleware/authMiddleware');

const router = express.Router({ mergeParams: true }); // Merge parent route params for nested routes

// Get all items (optional filter by categoryId)
router.get('/', protect, async (req, res) => {
    const { categoryId } = req.query;
  
    try {
      const filter = { userId: req.user.id }; // Filter by authenticated user
  
      // If categoryId is provided, validate it and add it to the filter
      if (categoryId) {
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
          return res.status(400).json({ message: 'Invalid categoryId' });
        }
        filter.categoryId = categoryId; // Add to query filter
      }
  
      // Debugging Logs
      console.log('Filter being used for fetching items:', filter);
  
      // Fetch items based on the filter
      const items = await Item.find(filter);
      console.log('Fetched items:', items);
  
      res.json(items);
    } catch (err) {
      // Enhanced error logging
      console.error('Error fetching items:', err.message);
      res.status(500).json({ message: 'Failed to fetch items', error: err.message });
    }
  });
// Get a single item by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const item = await Item.findOne({ _id: req.params.id, userId: req.user.id });
    if (!item) return res.status(404).json({ message: 'Item not found' });

    res.json(item);
  } catch (err) {
    console.error('Error fetching item:', err.message);
    res.status(500).json({ message: 'Failed to fetch item', error: err.message });
  }
});

// Add a new item (linked to a categoryId)
router.post('/', protect, async (req, res) => {
  const { name, budget, spent, frequency, categoryId } = req.body;

  if (!name || typeof name !== 'string') {
    return res.status(400).json({ message: 'Item name is required' });
  }

  try {
    if (categoryId && !mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ message: 'Invalid categoryId' });
    }

    const newItem = new Item({ name, budget, spent, frequency, categoryId, userId: req.user.id });
    const savedItem = await newItem.save();

    res.status(201).json(savedItem);
  } catch (err) {
    console.error('Error adding item:', err.message);
    res.status(500).json({ message: 'Failed to add item', error: err.message });
  }
});

// Update an item
router.put('/:id', protect, async (req, res) => {
  const { id } = req.params;
  const { name, budget, spent, frequency, categoryId } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid itemId' });
    }

    const updatedItem = await Item.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { name, budget, spent, frequency, categoryId },
      { new: true }
    );

    if (!updatedItem) return res.status(404).json({ message: 'Item not found' });

    res.json(updatedItem);
  } catch (err) {
    console.error('Error updating item:', err.message);
    res.status(500).json({ message: 'Failed to update item', error: err.message });
  }
});

// Delete an item
router.delete('/:id', protect, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid itemId' });
    }

    const deletedItem = await Item.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!deletedItem) return res.status(404).json({ message: 'Item not found' });

    res.status(204).end();
  } catch (err) {
    console.error('Error deleting item:', err.message);
    res.status(500).json({ message: 'Failed to delete item', error: err.message });
  }
});

module.exports = router;