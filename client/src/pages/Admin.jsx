import React, {
  useEffect,
  useState,
} from "react";

import { Navigate } from "react-router-dom";

import {
  api,
  authConfig,
} from "../api";


export default function Admin() {

  const user = JSON.parse(
    localStorage.getItem("user") ||
      "null"
  );

  const token =
    localStorage.getItem("token");


  // =================================================
  // MEMBERS
  // =================================================

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


  // =================================================
  // EMPTY FORM
  // =================================================

  const emptyForm = {
    type: "expense",
    title: "",
    amount: "",
    description: "",
    spentBy: "",
    donorName: "",
  };


  const [form, setForm] =
    useState(emptyForm);

  const [transactions, setTransactions] =
    useState([]);

  const [editingId, setEditingId] =
    useState(null);

  const [message, setMessage] =
    useState("");


  // =================================================
  // LOAD
  // =================================================

  const loadTransactions =
    async () => {

      try {

        const response =
          await api.get(
            "/transactions"
          );

        setTransactions(
          response.data
        );

      } catch (error) {

        console.error(error);

        setMessage(
          "Unable to load transactions"
        );
      }
    };


  useEffect(() => {
    loadTransactions();
  }, []);


  // =================================================
  // LOGIN
  // =================================================

  if (!token) {

    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }


  // =================================================
  // HANDLE CHANGE
  // =================================================

  const handleChange = (e) => {

    const {
      name,
      value,
    } = e.target;


    setForm((previous) => ({

      ...previous,

      [name]: value,


      // Switching to income
      ...(name === "type" &&
      value === "income"
        ? {
            spentBy: "",
            donorName: "",
          }
        : {}),


      // Switching to expense
      ...(name === "type" &&
      value === "expense"
        ? {
            donorName: "",
          }
        : {}),


      // Switching to pending
      ...(name === "type" &&
      value === "pending"
        ? {
            spentBy: "",
            title: "",
          }
        : {}),

    }));
  };


  // =================================================
  // SUBMIT
  // =================================================

  const submit = async (e) => {

    e.preventDefault();

    setMessage("");


    // Expense validation
    if (
      form.type === "expense" &&
      !form.spentBy
    ) {

      setMessage(
        "Please select who spent the money."
      );

      return;
    }


    // Pending validation
    if (
      form.type === "pending" &&
      !form.donorName
    ) {

      setMessage(
        "Please select donor name."
      );

      return;
    }


    // Income / Expense purpose
    if (
      form.type !== "pending" &&
      !form.title.trim()
    ) {

      setMessage(
        "Please enter the purpose."
      );

      return;
    }


    const data = {

      type:
        form.type,

      // Pending has automatic title
      title:
        form.type === "pending"
          ? "Pending Donation"
          : form.title,

      amount:
        Number(form.amount),

      description:
        form.description,

      spentBy:
        form.type === "expense"
          ? form.spentBy
          : "",

      donorName:
        form.type === "pending"
          ? form.donorName
          : "",
    };


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


      setForm(emptyForm);

      setEditingId(null);

      await loadTransactions();

    } catch (error) {

      console.error(error);

      setMessage(
        error.response?.data?.message ||
          "Unable to save transaction"
      );
    }
  };


  // =================================================
  // EDIT
  // =================================================

  const startEdit =
    (transaction) => {

      setEditingId(
        transaction._id
      );


      setForm({

        type:
          transaction.type,

        title:
          transaction.title || "",

        amount:
          transaction.amount,

        description:
          transaction.description ||
          "",

        spentBy:
          transaction.spentBy ||
          "",

        donorName:
          transaction.donorName ||
          "",
      });


      setMessage(
        "Editing transaction"
      );


      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    };


  // =================================================
  // CANCEL
  // =================================================

  const cancelEdit = () => {

    setEditingId(null);

    setForm(emptyForm);

    setMessage("");
  };


  // =================================================
  // DELETE
  // =================================================

  const deleteTransaction =
    async (
      id,
      title
    ) => {

      const confirmed =
        window.confirm(
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


  // =================================================
  // UI
  // =================================================

  return (
    <div>

      {/* ============================================
          ADMIN FORM
      ============================================ */}

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

          {/* TRANSACTION TYPE */}

          <label>
            Transaction Type
          </label>

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

            <option value="pending">
              Pending Donation
            </option>

          </select>


          {/* ========================================
              PURPOSE
              Only for income and expense
          ======================================== */}

          {form.type !== "pending" && (
            <>

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

            </>
          )}


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


          {/* ========================================
              SPENT BY
          ======================================== */}

          {form.type === "expense" && (
            <>

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

                {members.map(
                  (member) => (

                    <option
                      key={member}
                      value={member}
                    >
                      {member}
                    </option>

                  )
                )}

              </select>

            </>
          )}


          {/* ========================================
              PENDING DONOR
          ======================================== */}

          {form.type === "pending" && (
            <>

              <label>
                Donor Name
              </label>

              <select
                name="donorName"
                value={form.donorName}
                onChange={handleChange}
                required
              >

                <option value="">
                  Select Person
                </option>

                {members.map(
                  (member) => (

                    <option
                      key={member}
                      value={member}
                    >
                      {member}
                    </option>

                  )
                )}

              </select>

            </>
          )}


          {/* DESCRIPTION */}

          <label>
            Description (Optional)
          </label>

          <textarea
            name="description"
            placeholder="Additional details"
            value={
              form.description
            }
            onChange={handleChange}
          />


          {/* MESSAGE */}

          {message && (
            <p
              className={
                message.includes(
                  "successfully"
                )
                  ? "success"
                  : "error"
              }
            >
              {message}
            </p>
          )}


          {/* SUBMIT */}

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


      {/* ============================================
          MANAGE TRANSACTIONS
      ============================================ */}

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

            {transactions.map(
              (transaction) => (

                <div
                  className="transaction-item"
                  key={
                    transaction._id
                  }
                >

                  <div>

                    <strong>
                      {
                        transaction.title ||
                        "Pending Donation"
                      }
                    </strong>


                    <p>

                      {transaction.type ===
                      "income"
                        ? "Money Added"
                        : transaction.type ===
                          "expense"
                        ? "Money Spent"
                        : "Pending Donation"}

                      {" — ₹"}

                      {Number(
                        transaction.amount
                      ).toLocaleString(
                        "en-IN"
                      )}

                    </p>


                    {/* SPENT BY */}

                    {transaction.type ===
                      "expense" && (

                      <p>

                        Spent by:{" "}

                        <strong>
                          {
                            transaction.spentBy ||
                            "Not specified"
                          }
                        </strong>

                      </p>

                    )}


                    {/* PENDING */}

                    {transaction.type ===
                      "pending" && (

                      <p>

                        Pending from:{" "}

                        <strong>
                          {
                            transaction.donorName ||
                            "Not specified"
                          }
                        </strong>

                      </p>

                    )}


                    {/* DESCRIPTION */}

                    {transaction.description && (

                      <p>
                        {
                          transaction.description
                        }
                      </p>

                    )}


                    {/* ADMIN */}

                    <small>

                      Added by:{" "}

                      {
                        transaction
                          .addedBy
                          ?.name ||
                        "Unknown"
                      }

                    </small>

                  </div>


                  <div>

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
                          transaction.title ||
                            "Pending Donation"
                        )
                      }
                      style={{
                        marginLeft:
                          "10px",
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