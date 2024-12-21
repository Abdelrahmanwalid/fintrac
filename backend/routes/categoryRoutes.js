const express = require('express');
const Category = require('../models/Category');
const protect = require('../middleware/authMiddleware');
const itemRoutes = require('./itemRoutes');



const router = express.Router();

// Get all categories for the authenticated user
router.get('/', protect, async (req, res) => {
    try {
      const categories = await Category.find({ userId: req.user.id }); // Query by authenticated user
      res.json(categories);
    } catch (error) {
      console.error('Error fetching categories:', error.message);
      res.status(500).json({ message: 'Failed to fetch categories' });
    }
  });

// Create a new category
router.post('/', protect, async (req, res) => {
    const { name } = req.body;
  
    try {
      const category = await Category.create({ name, userId: req.user.id });
      res.status(201).json(category);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create category', error: error.message });
    }
  });

  // Fetch a category by ID
router.get('/:id', protect, async (req, res) => {
    try {
      const category = await Category.findOne({ _id: req.params.id, userId: req.user.id }); // Ensure userId matches authenticated user
      if (!category) {
        return res.status(404).json({ message: 'Category not found' }); // Return 404 if not found
      }
      res.json(category); // Send the category as the response
    } catch (error) {
      console.error('Error fetching category:', error.message); // Log any errors
      res.status(500).json({ message: 'Failed to fetch category', error: error.message }); // Handle unexpected errors
    }
  });
// Update a category
router.put('/:id', protect, async (req, res) => {
    const { name, isExpanded, items } = req.body;
  
    // Validate input
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ message: 'Invalid or missing category name' });
    }
  
    try {
      // Find and update the category
      const category = await Category.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.id }, // Use `userId` if that's the field in your schema
        { name, isExpanded, items },
        { new: true, runValidators: true } // Return updated document and run schema validations
      );
  
      // Check if the category was found
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
  
      res.json(category); // Respond with the updated category
    } catch (err) {
      console.error('Error updating category:', err.message); // Log the error
      res.status(500).json({ message: 'Failed to update category', error: err.message });
    }
  });

// Delete a category
router.delete('/:id', protect, async (req, res) => {
  try {
    // Ensure the query uses the correct user field
    const category = await Category.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id, // Use `userId` if this is the schema field
    });

    // If no category was found, return a 404 error
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Successful deletion, send 204 No Content
    res.status(204).end();
  } catch (err) {
    console.error('Error deleting category:', err.message); // Log the error for debugging
    res.status(500).json({ message: 'Failed to delete category', error: err.message }); // Include error details
  }
});

router.use('/:categoryId/items', itemRoutes);

module.exports = router;
