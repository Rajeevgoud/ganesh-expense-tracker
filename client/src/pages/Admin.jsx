import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { api, authConfig } from "../api";

export default function Admin() {
  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const token = localStorage.getItem("token");

  // ==========================================
  // EMPTY FORM
  // ==========================================

  const emptyForm = {
    type: "expense",

    // Money Spent
    title: "",
    spentBy: "",

    // Money Collected / Pending Donation
    donorName: "",

    amount: "",
    description: "",
  };

  // ==========================================
  // STATE
  // ==========================================

  const [form, setForm] = useState(emptyForm);

  const [transactions, setTransactions] = useState([]);

  const [editingId, setEditingId] = useState(null);

  const [message, setMessage] = useState("");

  const [transactionFilter, setTransactionFilter] =
    useState("all");

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

  // ==========================================
  // LOAD ON PAGE OPEN
  // ==========================================

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
  // SUBMIT TRANSACTION
  // ==========================================

  const submit = async (e) => {
    e.preventDefault();

    setMessage("");

    // ------------------------------------------
    // MONEY SPENT VALIDATION
    // ------------------------------------------

    if (form.type === "expense") {
      if (!form.spentBy) {
        setMessage(
          "Please select who spent the money."
        );

        return;
      }
    }

    // ------------------------------------------
    // MONEY COLLECTED VALIDATION
    // ------------------------------------------

    if (form.type === "income") {
      if (!form.donorName.trim()) {
        setMessage(
          "Please enter the person's name."
        );

        return;
      }
    }

    // ------------------------------------------
    // PENDING DONATION VALIDATION
    // ------------------------------------------

    if (form.type === "pending") {
      if (!form.donorName.trim()) {
        setMessage(
          "Please enter the donor name."
        );

        return;
      }
    }

    if (!form.amount || Number(form.amount) <= 0) {
      setMessage(
        "Please enter a valid amount."
      );

      return;
    }

    // ==========================================
    // DATA SENT TO SERVER
    // ==========================================

    const data = {
      type: form.type,

      // For expense this is the purpose.
      // For income/pending we also keep title
      // as donor name for compatibility.
      title:
        form.type === "expense"
          ? form.title
          : form.donorName,

      amount: Number(form.amount),

      description:
        form.description || "",

      spentBy:
        form.type === "expense"
          ? form.spentBy
          : "",

      donorName:
        form.type === "income" ||
        form.type === "pending"
          ? form.donorName
          : "",
    };

    // ==========================================
    // SAVE
    // ==========================================

    try {
      if (editingId) {
        await api.put(
          `/transactions/${editingId}`,
          data,
          authConfig()
        );

        setMessage(
          "Transaction updated successfully."
        );
      } else {
        await api.post(
          "/transactions",
          data,
          authConfig()
        );

        setMessage(
          "Transaction added successfully."
        );
      }

      // Reset
      setForm(emptyForm);

      setEditingId(null);

      // Refresh transactions
      await loadTransactions();

      // Scroll to top
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
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

      title: transaction.title || "",

      amount: transaction.amount || "",

      description:
        transaction.description || "",

      spentBy:
        transaction.spentBy || "",

      donorName:
        transaction.donorName ||
        (transaction.type === "income" ||
        transaction.type === "pending"
          ? transaction.title || ""
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

  const deleteTransaction = async (
    id,
    name
  ) => {
    const confirmed = window.confirm(
      `Delete "${name || "this transaction"}"?`
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
  // FILTER TRANSACTIONS
  // ==========================================

  const filteredTransactions =
    transactions.filter((transaction) => {
      if (transactionFilter === "all") {
        return true;
      }

      if (transactionFilter === "spent") {
        return transaction.type === "expense";
      }

      if (transactionFilter === "collected") {
        return transaction.type === "income";
      }

      if (transactionFilter === "pending") {
        return transaction.type === "pending";
      }

      return true;
    });

  // ==========================================
  // FORM TITLE
  // ==========================================

  const getFormTitle = () => {
    if (editingId) {
      return "Edit Transaction";
    }

    return "Admin Panel";
  };

  // ==========================================
  // TRANSACTION TYPE LABEL
  // ==========================================

  const getTransactionLabel = (type) => {
    if (type === "expense") {
      return "💸 Money Spent";
    }

    if (type === "income") {
      return "💰 Money Collected";
    }

    if (type === "pending") {
      return "⏳ Pending Donation";
    }

    return type;
  };

  // ==========================================
  // TRANSACTION DISPLAY NAME
  // ==========================================

  const getTransactionName = (transaction) => {
    if (
      transaction.type === "income" ||
      transaction.type === "pending"
    ) {
      return (
        transaction.donorName ||
        transaction.title ||
        "Unknown"
      );
    }

    return transaction.title || "Unknown";
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div>

      {/* ==================================================
          ADMIN FORM
      ================================================== */}

      <div className="form-card">

        <h1>{getFormTitle()}</h1>

        <p>
          Logged in as{" "}
          <strong>{user?.name}</strong>
        </p>

        <form onSubmit={submit}>

          {/* ------------------------------------------
              TRANSACTION TYPE
          ------------------------------------------ */}

          <label>
            Transaction Type
          </label>

          <select
            name="type"
            value={form.type}
            onChange={handleTypeChange}
          >
            <option value="income">
              💰 Money Added / Collected
            </option>

            <option value="expense">
              💸 Money Spent
            </option>

            <option value="pending">
              ⏳ Pending Donation
            </option>
          </select>


          {/* ==================================================
              MONEY SPENT
          ================================================== */}

          {form.type === "expense" && (
            <>

              {/* PURPOSE */}

              <label>
                Purpose
              </label>

              <input
                name="title"
                placeholder="Example: Decorations"
                value={form.title}
                onChange={handleChange}
                required
              />


              {/* AMOUNT */}

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


              {/* SPENT BY */}

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


          {/* ==================================================
              MONEY COLLECTED
          ================================================== */}

          {form.type === "income" && (
            <>

              {/* PERSON NAME */}

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


              {/* AMOUNT */}

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


          {/* ==================================================
              PENDING DONATION
          ================================================== */}

          {form.type === "pending" && (
            <>

              {/* DONOR NAME */}

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


              {/* AMOUNT */}

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


          {/* ==================================================
              DESCRIPTION
          ================================================== */}

          <label>
            Description (Optional)
          </label>

          <textarea
            name="description"
            placeholder="Additional details"
            value={form.description}
            onChange={handleChange}
          />


          {/* ==================================================
              MESSAGE
          ================================================== */}

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


          {/* ==================================================
              BUTTON
          ================================================== */}

          <button type="submit">
            {editingId
              ? "Update Transaction"
              : "Add Transaction"}
          </button>


          {/* CANCEL */}
          
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


      {/* ==================================================
          MANAGE TRANSACTIONS
      ================================================== */}

      <div
        className="transactions-card"
        style={{
          marginTop: "30px",
        }}
      >

        <h2>
          📋 Manage Transactions
        </h2>


        {/* ==================================================
            FILTER
        ================================================== */}

        <div
          style={{
            marginBottom: "25px",
          }}
        >

          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "600",
            }}
          >
            Filter Transactions
          </label>


          <select
            value={transactionFilter}
            onChange={(e) =>
              setTransactionFilter(
                e.target.value
              )
            }
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              fontSize: "16px",
            }}
          >

            <option value="all">
              All Transactions
            </option>

            <option value="spent">
              💸 Money Spent
            </option>

            <option value="collected">
              💰 Money Collected
            </option>

            <option value="pending">
              ⏳ Pending Donations
            </option>

          </select>

        </div>


        {/* ==================================================
            TRANSACTION COUNT
        ================================================== */}

        <p
          style={{
            marginBottom: "20px",
            color: "#666",
          }}
        >
          Showing{" "}
          <strong>
            {filteredTransactions.length}
          </strong>{" "}
          transaction
          {filteredTransactions.length !== 1
            ? "s"
            : ""}
        </p>


        {/* ==================================================
            TRANSACTIONS
        ================================================== */}

        {filteredTransactions.length === 0 ? (

          <p>
            No transactions found.
          </p>

        ) : (

          <div className="transaction-list">

            {filteredTransactions.map(
              (transaction) => (

                <div
                  className="transaction-item"
                  key={transaction._id}
                  style={{
                    marginBottom: "15px",
                    padding: "20px",
                    border: "1px solid #ddd",
                    borderRadius: "10px",
                    background: "#fff",
                  }}
                >

                  {/* ----------------------------------------
                      NAME
                  ---------------------------------------- */}

                  <h3
                    style={{
                      marginTop: 0,
                      marginBottom: "10px",
                    }}
                  >
                    {getTransactionName(
                      transaction
                    )}
                  </h3>


                  {/* ----------------------------------------
                      TYPE + AMOUNT
                  ---------------------------------------- */}

                  <p>
                    <strong>
                      {getTransactionLabel(
                        transaction.type
                      )}
                    </strong>

                    {" — "}

                    <strong>
                      ₹
                      {Number(
                        transaction.amount
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </strong>
                  </p>


                  {/* ----------------------------------------
                      PURPOSE
                  ---------------------------------------- */}

                  {transaction.type ===
                    "expense" && (
                    <p>
                      <strong>
                        Purpose:
                      </strong>{" "}
                      {transaction.title}
                    </p>
                  )}


                  {/* ----------------------------------------
                      SPENT BY
                  ---------------------------------------- */}

                  {transaction.type ===
                    "expense" && (
                    <p>
                      <strong>
                        Spent By:
                      </strong>{" "}
                      {transaction.spentBy ||
                        "Not specified"}
                    </p>
                  )}


                  {/* ----------------------------------------
                      DONOR
                  ---------------------------------------- */}

                  {transaction.type ===
                    "pending" && (
                    <p>
                      <strong>
                        Donor:
                      </strong>{" "}
                      {transaction.donorName ||
                        transaction.title ||
                        "Not specified"}
                    </p>
                  )}


                  {/* ----------------------------------------
                      PERSON WHO COLLECTED
                  ---------------------------------------- */}

                  {transaction.type ===
                    "income" && (
                    <p>
                      <strong>
                        Person:
                      </strong>{" "}
                      {transaction.donorName ||
                        transaction.title ||
                        "Not specified"}
                    </p>
                  )}


                  {/* ----------------------------------------
                      DESCRIPTION
                  ---------------------------------------- */}

                  {transaction.description && (
                    <p>
                      <strong>
                        Description:
                      </strong>{" "}
                      {transaction.description}
                    </p>
                  )}


                  {/* ----------------------------------------
                      ADDED BY
                  ---------------------------------------- */}

                  <p>
                    <strong>
                      Added by:
                    </strong>{" "}
                    {transaction.addedBy?.name ||
                      "Unknown"}
                  </p>


                  {/* ----------------------------------------
                      DATE
                  ---------------------------------------- */}

                  <small
                    style={{
                      color: "#666",
                    }}
                  >
                    {transaction.createdAt
                      ? new Date(
                          transaction.createdAt
                        ).toLocaleString(
                          "en-IN"
                        )
                      : ""}
                  </small>


                  {/* ----------------------------------------
                      BUTTONS
                  ---------------------------------------- */}

                  <div
                    style={{
                      marginTop: "15px",
                    }}
                  >

                    <button
                      type="button"
                      onClick={() =>
                        startEdit(
                          transaction
                        )
                      }
                    >
                      Edit
                    </button>


                    <button
                      type="button"
                      onClick={() =>
                        deleteTransaction(
                          transaction._id,
                          getTransactionName(
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

              )
            )}

          </div>

        )}

      </div>

    </div>
  );
}