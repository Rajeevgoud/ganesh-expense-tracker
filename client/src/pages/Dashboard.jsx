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
  const [selectedPerson, setSelectedPerson] = useState("All");

  // All festival members
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
      const [summaryRes, transactionRes] = await Promise.all([
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

    // Refresh every 5 seconds
    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);
  }, [fetchData]);

  // ==========================================
  // FILTER TRANSACTIONS BY PERSON
  // ==========================================
  const filteredTransactions =
    selectedPerson === "All"
      ? transactions
      : transactions.filter(
          (item) =>
            item.type === "expense" &&
            item.spentBy === selectedPerson
        );

  // ==========================================
  // PERSON-WISE TOTALS
  // ==========================================
  const spendingSummary = members.reduce((totals, person) => {
    totals[person] = transactions
      .filter(
        (item) =>
          item.type === "expense" &&
          item.spentBy === person
      )
      .reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0
      );

    return totals;
  }, {});

  // Total spent by selected person
  const selectedPersonTotal =
    selectedPerson === "All"
      ? Number(summary.totalExpense || 0)
      : Number(spendingSummary[selectedPerson] || 0);

  return (
    <div>
      {/* ========================================== */}
      {/* HERO */}
      {/* ========================================== */}

      <section className="hero">
        <h1>🙏 Ganesh Festival Expense Tracker</h1>

        <p>
          Transparent festival money and expense tracking
          for everyone.
        </p>
      </section>

      {/* ========================================== */}
      {/* SUMMARY CARDS */}
      {/* ========================================== */}

      <section className="cards">
        <div className="card">
          <span>Total Collected</span>

          <strong>
            ₹
            {Number(summary.totalIncome || 0).toLocaleString(
              "en-IN"
            )}
          </strong>
        </div>

        <div className="card">
          <span>
            {selectedPerson === "All"
              ? "Total Spent"
              : `${selectedPerson} Spent`}
          </span>

          <strong>
            ₹{selectedPersonTotal.toLocaleString("en-IN")}
          </strong>
        </div>

        <div className="card">
          <span>Remaining Balance</span>

          <strong>
            ₹
            {Number(summary.balance || 0).toLocaleString(
              "en-IN"
            )}
          </strong>
        </div>
      </section>

      {/* ========================================== */}
      {/* PERSON FILTER */}
      {/* ========================================== */}

      <section className="panel">
        <h2>🔎 Filter Transactions</h2>

        <label
          htmlFor="personFilter"
          style={{
            display: "block",
            marginBottom: "8px",
            fontWeight: "600",
          }}
        >
          Select Person
        </label>

        <select
          id="personFilter"
          value={selectedPerson}
          onChange={(e) => setSelectedPerson(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            fontSize: "16px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            marginBottom: "10px",
          }}
        >
          <option value="All">
            All Persons
          </option>

          {members.map((person) => (
            <option
              key={person}
              value={person}
            >
              {person}
            </option>
          ))}
        </select>

        {selectedPerson !== "All" && (
          <p>
            Showing transactions for{" "}
            <strong>{selectedPerson}</strong>
          </p>
        )}
      </section>

      {/* ========================================== */}
      {/* TRANSACTION HISTORY */}
      {/* ========================================== */}

      <section className="panel">
        <h2>
          Transaction History
          {selectedPerson !== "All" &&
            ` — ${selectedPerson}`}
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
                      {selectedPerson === "All"
                        ? "No transactions yet."
                        : `No expenses found for ${selectedPerson}.`}
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <span
                          className={`badge ${item.type}`}
                        >
                          {item.type === "income"
                            ? "Money Added"
                            : "Money Spent"}
                        </span>
                      </td>

                      <td>{item.title}</td>

                      <td>
                        ₹
                        {Number(
                          item.amount || 0
                        ).toLocaleString("en-IN")}
                      </td>

                      <td>
                        {item.type === "expense"
                          ? item.spentBy || "Not specified"
                          : "-"}
                      </td>

                      <td>
                        {item.addedBy?.name || "Unknown"}
                      </td>

                      <td>
                        {new Date(
                          item.createdAt
                        ).toLocaleString("en-IN")}
                      </td>

                      <td>
                        {item.description || "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ========================================== */}
      {/* PERSON-WISE SPENDING */}
      {/* ========================================== */}

      <section className="panel">
        <h2>👥 Person-wise Spending Summary</h2>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Person</th>
                <th>Total Spent</th>
              </tr>
            </thead>

            <tbody>
              {members.map((person) => (
                <tr key={person}>
                  <td>
                    <strong>{person}</strong>
                  </td>

                  <td>
                    ₹
                    {Number(
                      spendingSummary[person] || 0
                    ).toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}

              <tr>
                <td>
                  <strong>Total</strong>
                </td>

                <td>
                  <strong>
                    ₹
                    {Number(
                      summary.totalExpense || 0
                    ).toLocaleString("en-IN")}
                  </strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}