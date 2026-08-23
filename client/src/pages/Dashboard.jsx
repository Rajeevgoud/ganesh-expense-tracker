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
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);
  }, [fetchData]);

  // Start every member with ₹0
  const spendingSummary = members.reduce((totals, member) => {
    totals[member] = 0;
    return totals;
  }, {});

  // Add expense amounts to the correct person's total
  transactions
    .filter(
      (item) =>
        item.type === "expense" &&
        item.spentBy
    )
    .forEach((item) => {
      const person = item.spentBy;

      if (spendingSummary[person] !== undefined) {
        spendingSummary[person] += Number(item.amount || 0);
      }
    });

  return (
    <div>
      <section className="hero">
        <h1>🙏 Ganesh Festival Expense Tracker</h1>

        <p>
          Transparent festival money and expense tracking
          for everyone.
        </p>
      </section>

      {/* Summary Cards */}
      <section className="cards">
        <div className="card">
          <span>Total Collected</span>
          <strong>
            ₹{Number(summary.totalIncome || 0).toLocaleString("en-IN")}
          </strong>
        </div>

        <div className="card">
          <span>Total Spent</span>
          <strong>
            ₹{Number(summary.totalExpense || 0).toLocaleString("en-IN")}
          </strong>
        </div>

        <div className="card">
          <span>Remaining Balance</span>
          <strong>
            ₹{Number(summary.balance || 0).toLocaleString("en-IN")}
          </strong>
        </div>
      </section>

      {/* Transaction History */}
      <section className="panel">
        <h2>Transaction History</h2>

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
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan="7">
                      No transactions yet.
                    </td>
                  </tr>
                ) : (
                  transactions.map((item) => (
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
                        ₹{Number(item.amount || 0).toLocaleString(
                          "en-IN"
                        )}
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
                        ).toLocaleString()}
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

      {/* Person-wise Spending Summary */}
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
                  <td>{person}</td>

                  <td>
                    ₹{Number(
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
                    ₹{Number(
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