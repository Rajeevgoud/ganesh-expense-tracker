import React, { useState, useEffect, useCallback } from "react";
import { api } from "../api";

export default function Dashboard() {
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
  });

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Person filter
  const [selectedPerson, setSelectedPerson] =
    useState("all");

  // All members
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

  const fetchData = useCallback(async () => {
    try {
      const [summaryRes, transactionRes] =
        await Promise.all([
          api.get("/transactions/summary"),
          api.get("/transactions"),
        ]);

      setSummary(summaryRes.data);
      setTransactions(transactionRes.data);
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Automatically refresh every 5 seconds
    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);
  }, [fetchData]);

  // ==========================================
  // FILTER TRANSACTIONS BY PERSON
  // ==========================================

  const filteredTransactions =
    selectedPerson === "all"
      ? transactions
      : transactions.filter(
          (transaction) =>
            transaction.type === "expense" &&
            transaction.spentBy === selectedPerson
        );

  // ==========================================
  // TOTAL SPENT BY SELECTED PERSON
  // ==========================================

  const selectedPersonTotal =
    selectedPerson === "all"
      ? summary.totalExpense
      : filteredTransactions
          .filter(
            (transaction) =>
              transaction.type === "expense"
          )
          .reduce(
            (total, transaction) =>
              total + Number(transaction.amount || 0),
            0
          );

  return (
    <div>
      {/* ======================================
          HERO
      ====================================== */}

      <section className="hero">
        <h1>
          🙏 Ganesh Festival Expense Tracker
        </h1>

        <p>
          Transparent festival money and expense
          tracking for everyone.
        </p>
      </section>

      {/* ======================================
          SUMMARY CARDS
      ====================================== */}

      <section className="cards">
        <div className="card">
          <span>Total Collected</span>

          <strong>
            ₹
            {Number(
              summary.totalIncome || 0
            ).toLocaleString("en-IN")}
          </strong>
        </div>

        <div className="card">
          <span>Total Spent</span>

          <strong>
            ₹
            {Number(
              summary.totalExpense || 0
            ).toLocaleString("en-IN")}
          </strong>
        </div>

        <div className="card">
          <span>Remaining Balance</span>

          <strong>
            ₹
            {Number(
              summary.balance || 0
            ).toLocaleString("en-IN")}
          </strong>
        </div>
      </section>

      {/* ======================================
          FILTER
      ====================================== */}

      <section className="panel">
        <h2>🔎 Filter Transactions</h2>

        <label
          style={{
            display: "block",
            marginBottom: "8px",
            fontWeight: "600",
          }}
        >
          Select Person
        </label>

        <select
          value={selectedPerson}
          onChange={(e) =>
            setSelectedPerson(e.target.value)
          }
          style={{
            width: "100%",
            padding: "12px",
            fontSize: "16px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            marginBottom: "20px",
          }}
        >
          <option value="all">
            All Persons
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

        {/* SELECTED PERSON TOTAL */}

        <div
          style={{
            padding: "18px",
            borderRadius: "10px",
            background: "#f5f5f5",
            marginBottom: "10px",
          }}
        >
          <div
            style={{
              fontSize: "15px",
              marginBottom: "5px",
            }}
          >
            {selectedPerson === "all"
              ? "Total Spent by Everyone"
              : `Total Spent by ${selectedPerson}`}
          </div>

          <strong
            style={{
              fontSize: "28px",
            }}
          >
            ₹
            {Number(
              selectedPersonTotal || 0
            ).toLocaleString("en-IN")}
          </strong>
        </div>

        <p style={{ marginTop: "10px" }}>
          {selectedPerson === "all"
            ? "Showing transactions for everyone"
            : `Showing transactions for ${selectedPerson}`}
        </p>
      </section>

      {/* ======================================
          TRANSACTION HISTORY
      ====================================== */}

      <section className="panel">
        <h2>
          Transaction History
          {selectedPerson !== "all"
            ? ` — ${selectedPerson}`
            : ""}
        </h2>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Purpose</th>
                  <th>Amount</th>
                  <th>Spent By</th>
                  <th>Added By</th>
                  <th>Date & Time</th>
                  <th>Description</th>
                </tr>
              </thead>

              <tbody>
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="7">
                      {selectedPerson === "all"
                        ? "No transactions yet."
                        : `No transactions found for ${selectedPerson}.`}
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map(
                    (item) => (
                      <tr key={item._id}>
                        {/* TYPE */}

                        <td>
                          <span
                            className={`badge ${item.type}`}
                          >
                            {item.type === "income"
                              ? "Money Added"
                              : "Money Spent"}
                          </span>
                        </td>

                        {/* PURPOSE */}

                        <td>
                          {item.title}
                        </td>

                        {/* AMOUNT */}

                        <td>
                          ₹
                          {Number(
                            item.amount || 0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </td>

                        {/* SPENT BY */}

                        <td>
                          {item.type === "expense"
                            ? item.spentBy ||
                              "Not specified"
                            : "-"}
                        </td>

                        {/* ADDED BY */}

                        <td>
                          {item.addedBy?.name ||
                            "Unknown"}
                        </td>

                        {/* DATE */}

                        <td>
                          {item.createdAt
                            ? new Date(
                                item.createdAt
                              ).toLocaleString()
                            : "-"}
                        </td>

                        {/* DESCRIPTION */}

                        <td>
                          {item.description ||
                            "-"}
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}