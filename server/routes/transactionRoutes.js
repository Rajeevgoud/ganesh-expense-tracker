const express = require("express");
const Transaction = require("../models/Transaction");
const protect = require("../middleware/authMiddleware");

const router = express.Router();


// =====================================================
// GET ALL TRANSACTIONS
// =====================================================

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


// =====================================================
// GET SUMMARY
// =====================================================

router.get("/summary", async (req, res) => {
  try {
    const transactions = await Transaction.find();

    const totalIncome = transactions
      .filter(
        (item) => item.type === "income"
      )
      .reduce(
        (sum, item) =>
          sum + Number(item.amount || 0),
        0
      );

    const totalExpense = transactions
      .filter(
        (item) => item.type === "expense"
      )
      .reduce(
        (sum, item) =>
          sum + Number(item.amount || 0),
        0
      );

    const totalPending = transactions
      .filter(
        (item) => item.type === "pending"
      )
      .reduce(
        (sum, item) =>
          sum + Number(item.amount || 0),
        0
      );

    res.status(200).json({
      totalIncome,
      totalExpense,
      totalPending,
      balance:
        totalIncome - totalExpense,
    });
  } catch (error) {
    console.error(
      "Get summary error:",
      error
    );

    res.status(500).json({
      message:
        error.message ||
        "Unable to get summary",
    });
  }
});


// =====================================================
// ADD TRANSACTION
// =====================================================

router.post(
  "/",
  protect,
  async (req, res) => {
    try {
      const {
        type,
        title,
        amount,
        description,
        spentBy,
        donorName,
      } = req.body;


      // -----------------------------------------------
      // TYPE VALIDATION
      // -----------------------------------------------

      if (
        ![
          "income",
          "expense",
          "pending",
        ].includes(type)
      ) {
        return res.status(400).json({
          message:
            "Invalid transaction type",
        });
      }


      // -----------------------------------------------
      // AMOUNT VALIDATION
      // -----------------------------------------------

      if (
        amount === undefined ||
        amount === ""
      ) {
        return res.status(400).json({
          message:
            "Amount is required",
        });
      }


      // -----------------------------------------------
      // EXPENSE
      // -----------------------------------------------

      if (type === "expense") {

        if (!title) {
          return res.status(400).json({
            message:
              "Purpose is required",
          });
        }

        if (!spentBy) {
          return res.status(400).json({
            message:
              "Please select who spent the money",
          });
        }
      }


      // -----------------------------------------------
      // INCOME
      // -----------------------------------------------

      if (type === "income") {

        if (!title) {
          return res.status(400).json({
            message:
              "Purpose is required",
          });
        }
      }


      // -----------------------------------------------
      // PENDING DONATION
      // -----------------------------------------------

      if (type === "pending") {

        if (!donorName) {
          return res.status(400).json({
            message:
              "Please select donor name",
          });
        }
      }


      // -----------------------------------------------
      // CREATE
      // -----------------------------------------------

      const transaction =
        await Transaction.create({

          type,

          // Pending donations don't need purpose
          title:
            type === "pending"
              ? "Pending Donation"
              : title,

          amount:
            Number(amount),

          description:
            description || "",

          spentBy:
            type === "expense"
              ? spentBy
              : "",

          donorName:
            type === "pending"
              ? donorName
              : "",

          addedBy:
            req.user.id,
        });


      // -----------------------------------------------
      // POPULATE ADMIN
      // -----------------------------------------------

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
  }
);


// =====================================================
// UPDATE TRANSACTION
// =====================================================

router.put(
  "/:id",
  protect,
  async (req, res) => {

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
          message:
            "Transaction not found",
        });
      }


      // -----------------------------------------------
      // TYPE
      // -----------------------------------------------

      if (type !== undefined) {

        if (
          ![
            "income",
            "expense",
            "pending",
          ].includes(type)
        ) {
          return res.status(400).json({
            message:
              "Invalid transaction type",
          });
        }

        transaction.type = type;
      }


      // -----------------------------------------------
      // AMOUNT
      // -----------------------------------------------

      if (
        amount !== undefined &&
        amount !== ""
      ) {
        transaction.amount =
          Number(amount);
      }


      // -----------------------------------------------
      // DESCRIPTION
      // -----------------------------------------------

      if (
        description !== undefined
      ) {
        transaction.description =
          description;
      }


      // -----------------------------------------------
      // EXPENSE
      // -----------------------------------------------

      if (
        transaction.type ===
        "expense"
      ) {

        if (!title) {
          return res.status(400).json({
            message:
              "Purpose is required",
          });
        }

        if (!spentBy) {
          return res.status(400).json({
            message:
              "Please select who spent the money",
          });
        }

        transaction.title =
          title;

        transaction.spentBy =
          spentBy;

        transaction.donorName =
          "";
      }


      // -----------------------------------------------
      // INCOME
      // -----------------------------------------------

      else if (
        transaction.type ===
        "income"
      ) {

        if (!title) {
          return res.status(400).json({
            message:
              "Purpose is required",
          });
        }

        transaction.title =
          title;

        transaction.spentBy =
          "";

        transaction.donorName =
          "";
      }


      // -----------------------------------------------
      // PENDING DONATION
      // -----------------------------------------------

      else if (
        transaction.type ===
        "pending"
      ) {

        if (!donorName) {
          return res.status(400).json({
            message:
              "Please select donor name",
          });
        }

        transaction.title =
          "Pending Donation";

        transaction.donorName =
          donorName;

        transaction.spentBy =
          "";
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
  }
);


// =====================================================
// DELETE TRANSACTION
// =====================================================

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