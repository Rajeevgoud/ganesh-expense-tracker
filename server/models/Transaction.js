const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["income", "expense", "pending"],
      required: true,
    },

    // For expense = purpose
    // For income/pending = donor/person name
    title: {
      type: String,
      required: true,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    // Person who spent money
    spentBy: {
      type: String,
      default: "",
      trim: true,
    },

    // Donor/person for collected or pending donation
    donorName: {
      type: String,
      default: "",
      trim: true,
    },

    // Admin who added the transaction
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Transaction",
  transactionSchema
);