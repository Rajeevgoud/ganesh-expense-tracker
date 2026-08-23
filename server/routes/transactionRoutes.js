const express = require("express");
const Transaction = require("../models/Transaction");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// ==========================================
// PUBLIC - GET ALL TRANSACTIONS
// ==========================================
router.get("/", async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate("addedBy", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(transactions);
  } catch (error) {
    console.error("Get transactions error:", error);

    res.status(500).json({
      message: error.message || "Unable to get transactions",
    });
  }
});

// ==========================================
// PUBLIC - GET TRANSACTION SUMMARY
// ==========================================
router.get("/summary", async (req, res) => {
  try {
    const transactions = await Transaction.find();

    const totalIncome = transactions
      .filter((item) => item.type === "income")
      .reduce((sum, item) => sum + Number(item.amount), 0);

    const totalExpense = transactions
      .filter((item) => item.type === "expense")
      .reduce((sum, item) => sum + Number(item.amount), 0);

    res.status(200).json({
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    });
  } catch (error) {
    console.error("Get summary error:", error);

    res.status(500).json({
      message: error.message || "Unable to get summary",
    });
  }
});

// ==========================================
// ADMIN - ADD TRANSACTION
// ==========================================
router.post("/", protect, async (req, res) => {
  try {
    const {
      type,
      title,
      amount,
      description,
      spentBy,
    } = req.body;

    if (!type || !title || amount === undefined || amount === "") {
      return res.status(400).json({
        message: "Type, title and amount are required",
      });
    }

    if (!["income", "expense"].includes(type)) {
      return res.status(400).json({
        message: "Type must be income or expense",
      });
    }

    // Expense must have a person selected
    if (type === "expense" && !spentBy) {
      return res.status(400).json({
        message: "Please select who spent the money",
      });
    }

    const transaction = await Transaction.create({
      type,
      title,
      amount: Number(amount),
      description: description || "",

      // SAVE SPENT BY
      spentBy: type === "expense" ? spentBy : "",

      // Logged-in admin
      addedBy: req.user.id,
    });

    const populatedTransaction = await transaction.populate(
      "addedBy",
      "name"
    );

    res.status(201).json(populatedTransaction);
  } catch (error) {
    console.error("Add transaction error:", error);

    res.status(500).json({
      message: error.message || "Unable to add transaction",
    });
  }
});

// ==========================================
// ADMIN - UPDATE TRANSACTION
// ==========================================
router.put("/:id", protect, async (req, res) => {
  try {
    const {
      type,
      title,
      amount,
      description,
      spentBy,
    } = req.body;

    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    if (type !== undefined) {
      if (!["income", "expense"].includes(type)) {
        return res.status(400).json({
          message: "Type must be income or expense",
        });
      }

      transaction.type = type;
    }

    if (title !== undefined) {
      transaction.title = title;
    }

    if (amount !== undefined && amount !== "") {
      transaction.amount = Number(amount);
    }

    if (description !== undefined) {
      transaction.description = description;
    }

    // UPDATE SPENT BY
    if (transaction.type === "expense") {
      if (!spentBy) {
        return res.status(400).json({
          message: "Please select who spent the money",
        });
      }

      transaction.spentBy = spentBy;
    } else {
      transaction.spentBy = "";
    }

    await transaction.save();

    const updatedTransaction = await transaction.populate(
      "addedBy",
      "name"
    );

    res.status(200).json(updatedTransaction);
  } catch (error) {
    console.error("Update transaction error:", error);

    res.status(500).json({
      message: error.message || "Unable to update transaction",
    });
  }
});

// ==========================================
// ADMIN - DELETE TRANSACTION
// ==========================================
router.delete("/:id", protect, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    await transaction.deleteOne();

    res.status(200).json({
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    console.error("Delete transaction error:", error);

    res.status(500).json({
      message: error.message || "Unable to delete transaction",
    });
  }
});

module.exports = router;