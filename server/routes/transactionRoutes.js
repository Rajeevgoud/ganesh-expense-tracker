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
      message:
        error.message || "Unable to get transactions",
    });
  }
});


// ==========================================
// PUBLIC - GET SUMMARY
// ==========================================

router.get("/summary", async (req, res) => {
  try {
    const transactions = await Transaction.find();

    const totalIncome = transactions
      .filter((item) => item.type === "income")
      .reduce(
        (sum, item) => sum + Number(item.amount),
        0
      );

    const totalExpense = transactions
      .filter((item) => item.type === "expense")
      .reduce(
        (sum, item) => sum + Number(item.amount),
        0
      );

    const pendingDonations = transactions
      .filter((item) => item.type === "pending")
      .reduce(
        (sum, item) => sum + Number(item.amount),
        0
      );

    res.status(200).json({
      totalIncome,
      totalExpense,
      pendingDonations,
      balance: totalIncome - totalExpense,
    });
  } catch (error) {
    console.error("Get summary error:", error);

    res.status(500).json({
      message:
        error.message || "Unable to get summary",
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


    // ----------------------------------------
    // BASIC VALIDATION
    // ----------------------------------------

    if (
      !type ||
      amount === undefined ||
      amount === ""
    ) {
      return res.status(400).json({
        message: "Type and amount are required",
      });
    }


    // ----------------------------------------
    // VALID TYPE
    // ----------------------------------------

    if (
      !["income", "expense", "pending"].includes(
        type
      )
    ) {
      return res.status(400).json({
        message:
          "Type must be income, expense or pending",
      });
    }


    // ----------------------------------------
    // EXPENSE
    // ----------------------------------------

    if (type === "expense") {
      if (!title || !title.trim()) {
        return res.status(400).json({
          message: "Purpose is required",
        });
      }

      if (!spentBy || !spentBy.trim()) {
        return res.status(400).json({
          message:
            "Please select who spent the money",
        });
      }
    }


    // ----------------------------------------
    // INCOME
    // ----------------------------------------

    if (type === "income") {
      if (!donorName || !donorName.trim()) {
        return res.status(400).json({
          message:
            "Please enter the person name",
        });
      }
    }


    // ----------------------------------------
    // PENDING DONATION
    // ----------------------------------------

    if (type === "pending") {
      if (!donorName || !donorName.trim()) {
        return res.status(400).json({
          message:
            "Please enter the donor name",
        });
      }
    }


    // ----------------------------------------
    // CREATE TRANSACTION
    // ----------------------------------------

    const transaction =
      await Transaction.create({
        type,

        title:
          type === "expense"
            ? title.trim()
            : donorName.trim(),

        amount: Number(amount),

        description:
          description || "",

        spentBy:
          type === "expense"
            ? spentBy.trim()
            : "",

        donorName:
          type === "income" ||
          type === "pending"
            ? donorName.trim()
            : "",

        addedBy: req.user.id,
      });


    // ----------------------------------------
    // POPULATE ADMIN
    // ----------------------------------------

    const populatedTransaction =
      await transaction.populate(
        "addedBy",
        "name"
      );


    res.status(201).json(
      populatedTransaction
    );

  } catch (error) {
    console.error(
      "Add transaction error:",
      error
    );

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
      await Transaction.findById(
        req.params.id
      );


    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }


    // ----------------------------------------
    // TYPE
    // ----------------------------------------

    if (type !== undefined) {
      if (
        !["income", "expense", "pending"].includes(
          type
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid transaction type",
        });
      }

      transaction.type = type;
    }


    // ----------------------------------------
    // AMOUNT
    // ----------------------------------------

    if (
      amount !== undefined &&
      amount !== ""
    ) {
      transaction.amount =
        Number(amount);
    }


    // ----------------------------------------
    // DESCRIPTION
    // ----------------------------------------

    if (description !== undefined) {
      transaction.description =
        description;
    }


    // ----------------------------------------
    // EXPENSE
    // ----------------------------------------

    if (transaction.type === "expense") {

      if (!title || !title.trim()) {
        return res.status(400).json({
          message: "Purpose is required",
        });
      }

      if (!spentBy || !spentBy.trim()) {
        return res.status(400).json({
          message:
            "Please select who spent the money",
        });
      }

      transaction.title =
        title.trim();

      transaction.spentBy =
        spentBy.trim();

      transaction.donorName = "";
    }


    // ----------------------------------------
    // INCOME
    // ----------------------------------------

    else if (
      transaction.type === "income"
    ) {

      if (
        !donorName ||
        !donorName.trim()
      ) {
        return res.status(400).json({
          message:
            "Please enter the person name",
        });
      }

      transaction.title =
        donorName.trim();

      transaction.donorName =
        donorName.trim();

      transaction.spentBy = "";
    }


    // ----------------------------------------
    // PENDING
    // ----------------------------------------

    else if (
      transaction.type === "pending"
    ) {

      if (
        !donorName ||
        !donorName.trim()
      ) {
        return res.status(400).json({
          message:
            "Please enter the donor name",
        });
      }

      transaction.title =
        donorName.trim();

      transaction.donorName =
        donorName.trim();

      transaction.spentBy = "";
    }


    await transaction.save();


    const updatedTransaction =
      await transaction.populate(
        "addedBy",
        "name"
      );


    res.status(200).json(
      updatedTransaction
    );

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

router.delete(
  "/:id",
  protect,
  async (req, res) => {
    try {
      const transaction =
        await Transaction.findById(
          req.params.id
        );


      if (!transaction) {
        return res.status(404).json({
          message:
            "Transaction not found",
        });
      }


      await transaction.deleteOne();


      res.status(200).json({
        message:
          "Transaction deleted successfully",
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
  }
);


module.exports = router;