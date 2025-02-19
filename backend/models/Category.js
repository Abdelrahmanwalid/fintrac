const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  order: { type: Number, default: 0 },
});

module.exports = mongoose.model("Category", CategorySchema);
