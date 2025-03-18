const mongoose = require("mongoose");

const IncomeSchema = new mongoose.Schema({
  source: { type: String, required: true },
  amount: { type: Number, required: true },
  recurring: {
    type: String,
    default: "one-off",
    enum: [
      "one-off",
      "weekly",
      "bi-weekly",
      "monthly",
      "semester",
      "yearly",
      "termly",
    ],
  },
  lastPaymentDate: { type: Date, required: false },
  customDate: { type: Date, required: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Income", IncomeSchema);
