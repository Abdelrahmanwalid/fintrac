const mongoose = require('mongoose');

// Define the schema for items
const ItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  budget: { type: Number, default: 0 },
  spent: { type: Number, default: 0 },
  frequency: { type: String, default: 'monthly' },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' }, // Nullable if no category
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

// Export the model
module.exports = mongoose.model('Item', ItemSchema);