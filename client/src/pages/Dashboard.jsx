
import React, { useState, useEffect, useCallback } from "react";
import { api } from "../api";

export default function Dashboard() {
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [summaryRes, transactionRes] = await Promise.all([
        api.get("/transactions/summary"),
        api.get("/transactions")
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

  return (
    <div>
      <section className="hero">
        <h1>🙏 Ganesh Festival Expense Tracker</h1>
        <p>Transparent festival money and expense tracking for everyone.</p>
      </section>

      <section className="cards">
        <div className="card"><span>Total Collected</span><strong>₹{summary.totalIncome.toLocaleString("en-IN")}</strong></div>
        <div className="card"><span>Total Spent</span><strong>₹{summary.totalExpense.toLocaleString("en-IN")}</strong></div>
        <div className="card"><span>Remaining Balance</span><strong>₹{summary.balance.toLocaleString("en-IN")}</strong></div>
      </section>

      <section className="panel">
        <h2>Transaction History</h2>
        {loading ? <p>Loading...</p> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Type</th><th>Purpose</th><th>Amount</th><th>Added By</th><th>Date & Time</th><th>Description</th></tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr><td colSpan="6">No transactions yet.</td></tr>
                ) : transactions.map((item) => (
                  <tr key={item._id}>
                    <td><span className={`badge ${item.type}`}>{item.type === "income" ? "Money Added" : "Money Spent"}</span></td>
                    <td>{item.title}</td>
                    <td>₹{item.amount.toLocaleString("en-IN")}</td>
                    <td>{item.addedBy?.name || "Unknown"}</td>
                    <td>{new Date(item.createdAt).toLocaleString()}</td>
                    <td>{item.description || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
