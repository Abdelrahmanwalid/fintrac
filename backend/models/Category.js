const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isExpanded: { type: Boolean, default: false },
  items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }], // Reference to Item documents
});

module.exports = mongoose.model('Category', CategorySchema);