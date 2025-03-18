const express = require("express");
const router = express.Router();
const Income = require("../models/Income");
const protect = require("../middleware/authMiddleware");

// GET /api/income - Fetch all income items for the user
router.get("/", protect, async (req, res) => {
  try {
    const incomeItems = await Income.find({ userId: req.user.id });
    res.json(incomeItems);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/income - Add a new income item
router.post("/", protect, async (req, res) => {
  try {
    const incomeData = { ...req.body, userId: req.user.id };
    const income = new Income(incomeData);
    await income.save();
    res.status(201).json(income);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/income/:incomeId - Remove an income item
router.delete("/:incomeId", protect, async (req, res) => {
  try {
    await Income.findByIdAndDelete(req.params.incomeId);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
