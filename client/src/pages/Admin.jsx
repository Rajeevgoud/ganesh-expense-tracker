import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { api, authConfig } from "../api";

export default function Admin() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const token = localStorage.getItem("token");

  const emptyForm = {
    type: "expense",
    title: "",
    amount: "",
    description: "",
    spentBy: "",
  };

  const [form, setForm] = useState(emptyForm);
  const [transactions, setTransactions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  // Change these names to your actual members
  const members = ["Rajeev", "Ramu", "Deepak", "Sai"];

  const loadTransactions = async () => {
    try {
      const response = await api.get("/transactions");
      setTransactions(response.data);
    } catch (error) {
      setMessage("Unable to load transactions");
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
      ...(name === "type" && value === "income"
        ? { spentBy: "" }
        : {}),
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (form.type === "expense" && !form.spentBy) {
      setMessage("Please select who spent the money.");
      return;
    }

    const data = {
      ...form,
      amount: Number(form.amount),
      spentBy: form.type === "expense" ? form.spentBy : "",
    };

    try {
      if (editingId) {
        await api.put(
          `/transactions/${editingId}`,
          data,
          authConfig()
        );

        setMessage("Transaction updated successfully.");
      } else {
        await api.post(
          "/transactions",
          data,
          authConfig()
        );

        setMessage("Transaction added successfully.");
      }

      setForm(emptyForm);
      setEditingId(null);
      loadTransactions();
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Unable to save transaction"
      );
    }
  };

  const startEdit = (transaction) => {
    setEditingId(transaction._id);

    setForm({
      type: transaction.type,
      title: transaction.title,
      amount: transaction.amount,
      description: transaction.description || "",
      spentBy: transaction.spentBy || "",
    });

    setMessage("Editing transaction");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setMessage("");
  };

  const deleteTransaction = async (id, title) => {
    const confirmed = window.confirm(
      `Delete "${title}"?`
    );

    if (!confirmed) return;

    try {
      await api.delete(
        `/transactions/${id}`,
        authConfig()
      );

      setMessage("Transaction deleted successfully.");

      if (editingId === id) {
        cancelEdit();
      }

      loadTransactions();
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Unable to delete transaction"
      );
    }
  };

  return (
    <div>
      <div className="form-card">
        <h1>
          {editingId
            ? "Edit Transaction"
            : "Admin Panel"}
        </h1>

        <p>
          Logged in as <strong>{user?.name}</strong>
        </p>

        <form onSubmit={submit}>
          <label>Transaction Type</label>

          <select
            name="type"
            value={form.type}
            onChange={handleChange}
          >
            <option value="income">
              Money Added / Collected
            </option>

            <option value="expense">
              Money Spent
            </option>
          </select>

          <label>Purpose</label>

          <input
            name="title"
            placeholder="Example: Decorations"
            value={form.title}
            onChange={handleChange}
            required
          />

          <label>Amount (₹)</label>

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

          {form.type === "expense" && (
            <>
              <label>Spent By</label>

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

          <label>Description (Optional)</label>

          <textarea
            name="description"
            placeholder="Additional details"
            value={form.description}
            onChange={handleChange}
          />

          {message && (
            <p
              className={
                message.includes("success")
                  ? "success"
                  : "error"
              }
            >
              {message}
            </p>
          )}

          <button type="submit">
            {editingId
              ? "Update Transaction"
              : "Add Transaction"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              style={{ marginLeft: "10px" }}
            >
              Cancel
            </button>
          )}
        </form>
      </div>

      <div className="transactions-card">
        <h2>Manage Transactions</h2>

        {transactions.length === 0 ? (
          <p>No transactions yet.</p>
        ) : (
          <div className="transaction-list">
            {transactions.map((transaction) => (
              <div
                className="transaction-item"
                key={transaction._id}
              >
                <div>
                  <strong>{transaction.title}</strong>

                  <p>
                    {transaction.type === "income"
                      ? "Money Added"
                      : "Money Spent"}{" "}
                    — ₹{transaction.amount}
                  </p>

                  {transaction.type === "expense" && (
                    <p>
                      Spent by:{" "}
                      <strong>
                        {transaction.spentBy || "Not specified"}
                      </strong>
                    </p>
                  )}

                  {transaction.description && (
                    <p>{transaction.description}</p>
                  )}

                  <small>
                    Added by:{" "}
                    {transaction.addedBy?.name || "Unknown"}
                  </small>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => startEdit(transaction)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      deleteTransaction(
                        transaction._id,
                        transaction.title
                      )
                    }
                    style={{ marginLeft: "10px" }}
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