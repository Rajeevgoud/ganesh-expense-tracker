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

    // Money actually collected
    const totalIncome = transactions
      .filter((item) => item.type === "income")
      .reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0
      );

    // Money spent
    const totalExpense = transactions
      .filter((item) => item.type === "expense")
      .reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0
      );

    // Donations promised but not yet collected
    const totalPending = transactions
      .filter((item) => item.type === "pending")
      .reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0
      );

    res.status(200).json({
      totalIncome,
      totalExpense,
      totalPending,

      // Pending donations are NOT included
      // because the money has not been collected yet.
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
      donorName,
    } = req.body;

    // Basic validation
    if (
      !type ||
      amount === undefined ||
      amount === ""
    ) {
      return res.status(400).json({
        message: "Type and amount are required",
      });
    }

    if (!["income", "expense", "pending"].includes(type)) {
      return res.status(400).json({
        message: "Invalid transaction type",
      });
    }

    // ==========================================
    // EXPENSE
    // ==========================================
    if (type === "expense") {
      if (!title) {
        return res.status(400).json({
          message: "Purpose is required",
        });
      }

      if (!spentBy) {
        return res.status(400).json({
          message: "Please select who spent the money",
        });
      }
    }

    // ==========================================
    // INCOME / COLLECTED
    // ==========================================
    if (type === "income") {
      if (!donorName) {
        return res.status(400).json({
          message: "Person name is required",
        });
      }
    }

    // ==========================================
    // PENDING DONATION
    // ==========================================
    if (type === "pending") {
      if (!donorName) {
        return res.status(400).json({
          message: "Donor name is required",
        });
      }
    }

    const transaction = await Transaction.create({
      type,

      // Expense uses title as purpose.
      // Income/pending uses donor name as title.
      title:
        type === "expense"
          ? title
          : donorName,

      amount: Number(amount),

      description: description || "",

      spentBy:
        type === "expense"
          ? spentBy
          : "",

      donorName:
        type === "income" || type === "pending"
          ? donorName
          : "",

      addedBy: req.user.id,
    });

    const populatedTransaction =
      await transaction.populate(
        "addedBy",
        "name"
      );

    res.status(201).json(populatedTransaction);
  } catch (error) {
    console.error("Add transaction error:", error);

    res.status(500).json({
      message:
        error.message ||
        "Unable to add transaction",
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
      donorName,
    } = req.body;

    const transaction =
      await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    // ==========================================
    // TYPE
    // ==========================================
    if (type !== undefined) {
      if (
        !["income", "expense", "pending"].includes(type)
      ) {
        return res.status(400).json({
          message: "Invalid transaction type",
        });
      }

      transaction.type = type;
    }

    // ==========================================
    // AMOUNT
    // ==========================================
    if (
      amount !== undefined &&
      amount !== ""
    ) {
      transaction.amount = Number(amount);
    }

    // ==========================================
    // EXPENSE
    // ==========================================
    if (transaction.type === "expense") {
      if (title !== undefined) {
        transaction.title = title;
      }

      if (!spentBy) {
        return res.status(400).json({
          message: "Please select who spent the money",
        });
      }

      transaction.spentBy = spentBy;
      transaction.donorName = "";
    }

    // ==========================================
    // INCOME
    // ==========================================
    if (transaction.type === "income") {
      if (!donorName) {
        return res.status(400).json({
          message: "Person name is required",
        });
      }

      transaction.donorName = donorName;
      transaction.title = donorName;
      transaction.spentBy = "";
    }

    // ==========================================
    // PENDING
    // ==========================================
    if (transaction.type === "pending") {
      if (!donorName) {
        return res.status(400).json({
          message: "Donor name is required",
        });
      }

      transaction.donorName = donorName;
      transaction.title = donorName;
      transaction.spentBy = "";
    }

    // ==========================================
    // DESCRIPTION
    // ==========================================
    if (description !== undefined) {
      transaction.description = description;
    }

    await transaction.save();

    const updatedTransaction =
      await transaction.populate(
        "addedBy",
        "name"
      );

    res.status(200).json(updatedTransaction);
  } catch (error) {
    console.error(
      "Update transaction error:",
      error
    );

    res.status(500).json({
      message:
        error.message ||
        "Unable to update transaction",
    });
  }
});

// ==========================================
// ADMIN - DELETE TRANSACTION
// ==========================================
router.delete("/:id", protect, async (req, res) => {
  try {
    const transaction =
      await Transaction.findById(req.params.id);

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
    console.error(
      "Delete transaction error:",
      error
    );

    res.status(500).json({
      message:
        error.message ||
        "Unable to delete transaction",
    });
  }
});

module.exports = router;