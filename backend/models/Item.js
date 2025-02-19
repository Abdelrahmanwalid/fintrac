const mongoose = require("mongoose");

// Define the schema for items
const ItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  budget: { type: Number, default: 0 },
  spent: { type: Number, default: 0 },
  frequency: { type: String, default: "monthly" },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  order: { type: Number, default: 0 }, // New field for ordering

  // Payment schedule fields
  paymentDayOfWeek: {
    type: String,
    enum: [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ],
    required: false,
  }, // For weekly
  paymentDayOfMonth: { type: Number, min: 1, max: 31, required: false }, // For monthly (specific day)
  isLastDayOfMonth: { type: Boolean, default: false }, // For monthly (last day of month)
  paymentDateOfYear: { type: Date, required: false }, // For yearly (specific date)
});

module.exports = mongoose.model("Item", ItemSchema);
