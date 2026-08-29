import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { api, authConfig } from "../api";

export default function Admin() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const token = localStorage.getItem("token");

  // ==========================================
  // MEMBERS
  // ==========================================

  const members = [
    "Rajeev",
    "Akhilesh",
    "Akhil",
    "Varun",
    "Sreedhar",
    "Bhaskar",
    "Mani",
    "Bunny",
    "Adarsh",
    "Deepak",
    "Sai",
  ];

  // ==========================================
  // EMPTY FORM
  // ==========================================

  const emptyForm = {
    type: "expense",
    title: "",
    amount: "",
    description: "",
    spentBy: "",
    donorName: "",
  };

  const [form, setForm] = useState(emptyForm);
  const [transactions, setTransactions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  // ==========================================
  // LOAD TRANSACTIONS
  // ==========================================

  const loadTransactions = async () => {
    try {
      const response = await api.get("/transactions");

      setTransactions(response.data);
    } catch (error) {
      console.error(error);

      setMessage("Unable to load transactions");
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  // ==========================================
  // LOGIN CHECK
  // ==========================================

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // ==========================================
  // HANDLE FORM CHANGE
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================
  // CHANGE TRANSACTION TYPE
  // ==========================================

  const handleTypeChange = (e) => {
    const type = e.target.value;

    setForm({
      ...emptyForm,
      type,
    });

    setMessage("");
  };

  // ==========================================
  // SUBMIT
  // ==========================================

  const submit = async (e) => {
    e.preventDefault();

    setMessage("");

    // ------------------------------------------
    // MONEY SPENT VALIDATION
    // ------------------------------------------

    if (form.type === "expense") {
      if (!form.spentBy) {
        setMessage("Please select who spent the money.");
        return;
      }

      if (!form.title.trim()) {
        setMessage("Please enter the purpose.");
        return;
      }
    }

    // ------------------------------------------
    // MONEY ADDED VALIDATION
    // ------------------------------------------

    if (form.type === "income") {
      if (!form.donorName.trim()) {
        setMessage("Please enter the person name.");
        return;
      }
    }

    // ------------------------------------------
    // PENDING DONATION VALIDATION
    // ------------------------------------------

    if (form.type === "pending") {
      if (!form.donorName.trim()) {
        setMessage("Please enter the donor name.");
        return;
      }
    }

    if (!form.amount || Number(form.amount) <= 0) {
      setMessage("Please enter a valid amount.");
      return;
    }

    // ==========================================
    // DATA TO SEND
    // ==========================================

    const data = {
      type: form.type,

      // For expense:
      // title = purpose
      //
      // For income:
      // title = person name
      //
      // For pending:
      // title = donor name

      title:
        form.type === "expense"
          ? form.title.trim()
          : form.donorName.trim(),

      amount: Number(form.amount),

      description: form.description.trim(),

      spentBy:
        form.type === "expense"
          ? form.spentBy
          : "",

      donorName:
        form.type === "income" || form.type === "pending"
          ? form.donorName.trim()
          : "",
    };

    try {
      // ========================================
      // UPDATE
      // ========================================

      if (editingId) {
        await api.put(
          `/transactions/${editingId}`,
          data,
          authConfig()
        );

        setMessage("Transaction updated successfully.");
      }

      // ========================================
      // ADD
      // ========================================

      else {
        await api.post(
          "/transactions",
          data,
          authConfig()
        );

        setMessage("Transaction added successfully.");
      }

      // Reset form

      setForm(emptyForm);

      setEditingId(null);

      // Reload transactions

      await loadTransactions();
    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.message ||
          "Unable to save transaction"
      );
    }
  };

  // ==========================================
  // START EDIT
  // ==========================================

  const startEdit = (transaction) => {
    setEditingId(transaction._id);

    setForm({
      type: transaction.type,

      title:
        transaction.type === "expense"
          ? transaction.title || ""
          : "",

      amount: transaction.amount || "",

      description:
        transaction.description || "",

      spentBy:
        transaction.spentBy || "",

      donorName:
        transaction.donorName ||
        (transaction.type !== "expense"
          ? transaction.title
          : ""),
    });

    setMessage("Editing transaction");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================
  // CANCEL EDIT
  // ==========================================

  const cancelEdit = () => {
    setEditingId(null);

    setForm(emptyForm);

    setMessage("");
  };

  // ==========================================
  // DELETE
  // ==========================================

  const deleteTransaction = async (id, title) => {
    const confirmed = window.confirm(
      `Delete "${title}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(
        `/transactions/${id}`,
        authConfig()
      );

      setMessage(
        "Transaction deleted successfully."
      );

      if (editingId === id) {
        cancelEdit();
      }

      await loadTransactions();
    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.message ||
          "Unable to delete transaction"
      );
    }
  };

  // ==========================================
  // DISPLAY TITLE
  // ==========================================

  const getTransactionTitle = (transaction) => {
    if (transaction.type === "expense") {
      return transaction.title;
    }

    return (
      transaction.donorName ||
      transaction.title ||
      "Unknown"
    );
  };

  // ==========================================
  // DISPLAY TYPE
  // ==========================================

  const getTransactionType = (type) => {
    if (type === "income") {
      return "Money Added";
    }

    if (type === "pending") {
      return "Pending Donation";
    }

    return "Money Spent";
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div>
      {/* ========================================
          ADMIN FORM
      ======================================== */}

      <div className="form-card">

        <h1>
          {editingId
            ? "Edit Transaction"
            : "Admin Panel"}
        </h1>

        <p>
          Logged in as{" "}
          <strong>
            {user?.name}
          </strong>
        </p>

        <form onSubmit={submit}>

          {/* ====================================
              TRANSACTION TYPE
          ==================================== */}

          <label>
            Transaction Type
          </label>

          <select
            name="type"
            value={form.type}
            onChange={handleTypeChange}
          >
            <option value="income">
              Money Added / Collected
            </option>

            <option value="expense">
              Money Spent
            </option>

            <option value="pending">
              Pending Donation
            </option>
          </select>

          {/* ====================================
              MONEY SPENT
          ==================================== */}

          {form.type === "expense" && (
            <>
              <label>
                Purpose
              </label>

              <input
                name="title"
                type="text"
                placeholder="Example: Decorations"
                value={form.title}
                onChange={handleChange}
                required
              />

              <label>
                Amount (₹)
              </label>

              <input
                name="amount"
                type="number"
                min="1"
                step="0.01"
                placeholder="Example: 1200"
                value={form.amount}
                onChange={handleChange}
                required
              />

              <label>
                Spent By
              </label>

              <select
                name="spentBy"
                value={form.spentBy}
                onChange={handleChange}
                required
              >
                <option value="">
                  Select Person
                </option>

                {members.map((member) => (
                  <option
                    key={member}
                    value={member}
                  >
                    {member}
                  </option>
                ))}
              </select>
            </>
          )}

          {/* ====================================
              MONEY ADDED / COLLECTED
          ==================================== */}

          {form.type === "income" && (
            <>
              <label>
                Person Name
              </label>

              <input
                name="donorName"
                type="text"
                placeholder="Enter person name"
                value={form.donorName}
                onChange={handleChange}
                required
              />

              <label>
                Amount (₹)
              </label>

              <input
                name="amount"
                type="number"
                min="1"
                step="0.01"
                placeholder="Example: 1200"
                value={form.amount}
                onChange={handleChange}
                required
              />
            </>
          )}

          {/* ====================================
              PENDING DONATION
          ==================================== */}

          {form.type === "pending" && (
            <>
              <label>
                Amount (₹)
              </label>

              <input
                name="amount"
                type="number"
                min="1"
                step="0.01"
                placeholder="Example: 1200"
                value={form.amount}
                onChange={handleChange}
                required
              />

              <label>
                Donor Name
              </label>

              <input
                name="donorName"
                type="text"
                placeholder="Enter donor name"
                value={form.donorName}
                onChange={handleChange}
                required
              />
            </>
          )}

          {/* ====================================
              DESCRIPTION
          ==================================== */}

          <label>
            Description (Optional)
          </label>

          <textarea
            name="description"
            placeholder="Additional details"
            value={form.description}
            onChange={handleChange}
          />

          {/* ====================================
              MESSAGE
          ==================================== */}

          {message && (
            <p
              className={
                message.toLowerCase().includes("success")
                  ? "success"
                  : "error"
              }
            >
              {message}
            </p>
          )}

          {/* ====================================
              BUTTON
          ==================================== */}

          <button type="submit">
            {editingId
              ? "Update Transaction"
              : "Add Transaction"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              style={{
                marginLeft: "10px",
              }}
            >
              Cancel
            </button>
          )}

        </form>
      </div>

      {/* ========================================
          MANAGE TRANSACTIONS
      ======================================== */}

      <div className="transactions-card">

        <h2>
          Manage Transactions
        </h2>

        {transactions.length === 0 ? (
          <p>
            No transactions yet.
          </p>
        ) : (
          <div className="transaction-list">

            {transactions.map((transaction) => (
              <div
                className="transaction-item"
                key={transaction._id}
              >

                <div>

                  <strong>
                    {getTransactionTitle(
                      transaction
                    )}
                  </strong>

                  <p>
                    {getTransactionType(
                      transaction.type
                    )}{" "}
                    — ₹
                    {Number(
                      transaction.amount
                    ).toLocaleString("en-IN")}
                  </p>

                  {/* SPENT BY */}

                  {transaction.type ===
                    "expense" && (
                    <p>
                      Spent by:{" "}
                      <strong>
                        {transaction.spentBy ||
                          "Not specified"}
                      </strong>
                    </p>
                  )}

                  {/* DONOR */}

                  {transaction.type ===
                    "income" && (
                    <p>
                      Person:{" "}
                      <strong>
                        {transaction.donorName ||
                          transaction.title ||
                          "Not specified"}
                      </strong>
                    </p>
                  )}

                  {/* PENDING DONOR */}

                  {transaction.type ===
                    "pending" && (
                    <p>
                      Donor:{" "}
                      <strong>
                        {transaction.donorName ||
                          transaction.title ||
                          "Not specified"}
                      </strong>
                    </p>
                  )}

                  {/* DESCRIPTION */}

                  {transaction.description && (
                    <p>
                      {transaction.description}
                    </p>
                  )}

                  {/* ADDED BY */}

                  <small>
                    Added by:{" "}
                    {transaction.addedBy?.name ||
                      "Unknown"}
                  </small>

                </div>

                {/* BUTTONS */}

                <div>

                  <button
                    type="button"
                    onClick={() =>
                      startEdit(transaction)
                    }
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      deleteTransaction(
                        transaction._id,
                        getTransactionTitle(
                          transaction
                        )
                      )
                    }
                    style={{
                      marginLeft: "10px",
                    }}
                  >
                    Delete
                  </button>

                </div>

              </div>
            ))}

          </div>
        )}

      </div>
    </div>
  );
}