const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Item = require("../models/Item");
const Category = require("../models/Category");
const protect = require("../middleware/authMiddleware");

// Get all items (optional filter by categoryId)
router.get("/", protect, async (req, res) => {
  const { categoryId } = req.query;

  try {
    const filter = { userId: req.user.id };
    if (categoryId) {
      filter.categoryId = categoryId;
    }

    const items = await Item.find(filter);

    // Remove invalid items before sending response
    const validItems = items.filter((item) => item && item.name);

    console.log("Returning Items:", validItems); // Debugging Log
    res.json(validItems);
  } catch (err) {
    console.error("Error fetching items:", err.message);
    res
      .status(500)
      .json({ message: "Failed to fetch items", error: err.message });
  }
});
// Get a single item by ID
router.get("/:id", protect, async (req, res) => {
  try {
    const item = await Item.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!item) return res.status(404).json({ message: "Item not found" });

    res.json(item);
  } catch (err) {
    console.error("Error fetching item:", err.message);
    res
      .status(500)
      .json({ message: "Failed to fetch item", error: err.message });
  }
});
// POST - Create new item
router.put("/order", protect, async (req, res) => {
  const { itemId, newOrder, sourceCategoryId, targetCategoryId } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Validate core parameters
    if (
      !mongoose.Types.ObjectId.isValid(itemId) ||
      typeof newOrder !== "number" ||
      !mongoose.Types.ObjectId.isValid(sourceCategoryId) ||
      !mongoose.Types.ObjectId.isValid(targetCategoryId)
    ) {
      return res.status(400).json({
        message: "Invalid parameters",
        details: {
          itemId: mongoose.Types.ObjectId.isValid(itemId),
          newOrder: typeof newOrder === "number",
          sourceCategoryId: mongoose.Types.ObjectId.isValid(sourceCategoryId),
          targetCategoryId: mongoose.Types.ObjectId.isValid(targetCategoryId),
        },
      });
    }

    // Fetch the item being moved
    const movedItem = await Item.findOne({
      _id: itemId,
      userId: req.user.id,
    }).session(session);

    if (!movedItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Save the original order for logging/debugging if needed.
    const originalOrder = movedItem.order;

    if (sourceCategoryId === targetCategoryId) {
      // Same-category move:
      if (newOrder > originalOrder) {
        // Moving down: decrement order for items between originalOrder+1 and newOrder (inclusive)
        await Item.updateMany(
          {
            categoryId: targetCategoryId,
            order: { $gt: originalOrder, $lte: newOrder },
            _id: { $ne: itemId },
          },
          { $inc: { order: -1 } }
        ).session(session);
      } else if (newOrder < originalOrder) {
        // Moving up: increment order for items between newOrder and originalOrder-1 (inclusive)
        await Item.updateMany(
          {
            categoryId: targetCategoryId,
            order: { $gte: newOrder, $lt: originalOrder },
            _id: { $ne: itemId },
          },
          { $inc: { order: 1 } }
        ).session(session);
      }
      // If newOrder === originalOrder, no update to other items is needed.
    } else {
      // Cross-category move:
      // 1. In the source category, decrement order for all items with order greater than the moved item’s original order.
      await Item.updateMany(
        {
          categoryId: sourceCategoryId,
          order: { $gt: originalOrder },
        },
        { $inc: { order: -1 } }
      ).session(session);

      // 2. In the target category, increment order for all items with order greater than or equal to newOrder.
      await Item.updateMany(
        {
          categoryId: targetCategoryId,
          order: { $gte: newOrder },
        },
        { $inc: { order: 1 } }
      ).session(session);
    }

    // Finally, update the moved item:
    await Item.findByIdAndUpdate(
      itemId,
      {
        order: newOrder,
        categoryId: targetCategoryId,
      },
      { session }
    );

    await session.commitTransaction();
    res.status(200).json({ success: true });
  } catch (error) {
    await session.abortTransaction();
    console.error("Order update failed:", error);
    res.status(500).json({ message: "Failed to update order" });
  } finally {
    session.endSession();
  }
});
router.post("/", protect, async (req, res) => {
  const {
    name,
    categoryId,
    budget,
    spent,
    frequency,
    paymentDayOfWeek,
    paymentDayOfMonth,
    isLastDayOfMonth,
    paymentDateOfYear,
  } = req.body;

  if (!name || !categoryId) {
    return res
      .status(400)
      .json({ message: "Item name and categoryId are required" });
  }

  try {
    // Find the current max order in this category
    const lastItem = await Item.findOne({ categoryId, userId: req.user.id })
      .sort({ order: -1 })
      .select("order");

    const order = lastItem ? lastItem.order + 1 : 0;

    const newItem = new Item({
      name,
      categoryId,
      userId: req.user.id,
      order,
      budget: budget || 0,
      spent: spent || 0,
      frequency: frequency || "monthly",
      paymentDayOfWeek: paymentDayOfWeek || null,
      paymentDayOfMonth: paymentDayOfMonth || null,
      isLastDayOfMonth: isLastDayOfMonth || false,
      paymentDateOfYear: paymentDateOfYear || null,
    });

    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    console.error("Error creating item:", error.message);
    res
      .status(500)
      .json({ message: "Failed to create item", error: error.message });
  }
});
// Update an item
router.put("/:id", protect, async (req, res) => {
  const { id } = req.params;
  const {
    name,
    budget,
    spent,
    frequency,
    categoryId,
    paymentDayOfWeek,
    paymentDayOfMonth,
    isLastDayOfMonth,
    paymentDateOfYear,
  } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid itemId" });
    }

    const updatedItem = await Item.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      {
        name,
        budget,
        spent,
        frequency,
        categoryId,
        paymentDayOfWeek,
        paymentDayOfMonth,
        isLastDayOfMonth,
        paymentDateOfYear,
      },
      { new: true }
    );

    if (!updatedItem)
      return res.status(404).json({ message: "Item not found" });

    res.json(updatedItem);
  } catch (err) {
    console.error("Error updating item:", err.message);
    res
      .status(500)
      .json({ message: "Failed to update item", error: err.message });
  }
});

// Delete an item
router.delete("/:id", protect, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid itemId" });
    }

    const deletedItem = await Item.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!deletedItem)
      return res.status(404).json({ message: "Item not found" });

    res.status(204).end();
  } catch (err) {
    console.error("Error deleting item:", err.message);
    res
      .status(500)
      .json({ message: "Failed to delete item", error: err.message });
  }
});

module.exports = router;
