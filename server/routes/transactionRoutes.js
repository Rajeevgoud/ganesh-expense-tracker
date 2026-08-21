
const express = require("express");
const Transaction = require("../models/Transaction");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// PUBLIC - Get all transactions
router.get("/", async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate("addedBy", "name")
      .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// PUBLIC - Get transaction summary
router.get("/summary", async (req, res) => {
  try {
    const transactions = await Transaction.find();

    const totalIncome = transactions
      .filter((item) => item.type === "income")
      .reduce((sum, item) => sum + Number(item.amount), 0);

    const totalExpense = transactions
      .filter((item) => item.type === "expense")
      .reduce((sum, item) => sum + Number(item.amount), 0);

    res.json({
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// ADMIN - Add transaction
router.post("/", protect, async (req, res) => {
  try {
    const { type, title, amount, description } = req.body;

    if (!type || !title || amount === undefined) {
      return res.status(400).json({
        message: "Type, title and amount are required",
      });
    }

    const transaction = await Transaction.create({
      type,
      title,
      amount: Number(amount),
      description,
      addedBy: req.user.id,
    });

    const populatedTransaction = await transaction.populate(
      "addedBy",
      "name"
    );

    res.status(201).json(populatedTransaction);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// ADMIN - Edit transaction
router.put("/:id", protect, async (req, res) => {
  try {
    const { type, title, amount, description } = req.body;

    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    if (type !== undefined) {
      transaction.type = type;
    }

    if (title !== undefined) {
      transaction.title = title;
    }

    if (amount !== undefined) {
      transaction.amount = Number(amount);
    }

    if (description !== undefined) {
      transaction.description = description;
    }

    await transaction.save();

    const updatedTransaction = await transaction.populate(
      "addedBy",
      "name"
    );

    res.json(updatedTransaction);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// ADMIN - Delete transaction
router.delete("/:id", protect, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    await transaction.deleteOne();

    res.json({
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;
