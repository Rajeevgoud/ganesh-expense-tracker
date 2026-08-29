import React, {
  useState,
  useEffect,
  useCallback,
} from "react";

import { api } from "../api";

export default function Dashboard() {
  // ==========================================
  // SUMMARY
  // ==========================================
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    totalPending: 0,
    balance: 0,
  });

  // ==========================================
  // TRANSACTIONS
  // ==========================================
  const [transactions, setTransactions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  // ==========================================
  // FILTER
  // ==========================================
  const [selectedPerson, setSelectedPerson] =
    useState("all");

  // ==========================================
  // DETAILS CARD
  // ==========================================
  const [detailsType, setDetailsType] =
    useState(null);

  // ==========================================
  // ALL FESTIVAL MEMBERS
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
  // FETCH DATA
  // ==========================================
  const fetchData = useCallback(async () => {
    try {
      const [
        summaryRes,
        transactionRes,
      ] = await Promise.all([
        api.get("/transactions/summary"),
        api.get("/transactions"),
      ]);

      setSummary({
        totalIncome:
          Number(
            summaryRes.data.totalIncome
          ) || 0,

        totalExpense:
          Number(
            summaryRes.data.totalExpense
          ) || 0,

        totalPending:
          Number(
            summaryRes.data.totalPending
          ) || 0,

        balance:
          Number(
            summaryRes.data.balance
          ) || 0,
      });

      setTransactions(
        transactionRes.data || []
      );
    } catch (error) {
      console.error(
        "Dashboard error:",
        error
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================
  // AUTO REFRESH
  // ==========================================
  useEffect(() => {
    fetchData();

    const interval = setInterval(
      fetchData,
      5000
    );

    return () =>
      clearInterval(interval);
  }, [fetchData]);

  // ==========================================
  // FILTERED TRANSACTIONS
  // ==========================================
  const filteredTransactions =
    transactions.filter((item) => {
      if (selectedPerson === "all") {
        return true;
      }

      // Expenses → spentBy
      if (item.type === "expense") {
        return (
          (item.spentBy || "")
            .toLowerCase() ===
          selectedPerson.toLowerCase()
        );
      }

      // Income / pending → donorName
      if (
        item.type === "income" ||
        item.type === "pending"
      ) {
        return (
          (item.donorName || item.title || "")
            .toLowerCase() ===
          selectedPerson.toLowerCase()
        );
      }

      return false;
    });

  // ==========================================
  // TOTAL SPENT FOR SELECTED PERSON
  // ==========================================
  const selectedPersonSpent =
    transactions
      .filter((item) => {
        if (item.type !== "expense") {
          return false;
        }

        if (selectedPerson === "all") {
          return true;
        }

        return (
          (item.spentBy || "")
            .toLowerCase() ===
          selectedPerson.toLowerCase()
        );
      })
      .reduce(
        (sum, item) =>
          sum + Number(item.amount || 0),
        0
      );

  // ==========================================
  // DETAILS
  // ==========================================
  const detailTransactions =
    detailsType === "collected"
      ? transactions.filter(
          (item) =>
            item.type === "income"
        )
      : detailsType === "pending"
      ? transactions.filter(
          (item) =>
            item.type === "pending"
        )
      : [];

  // ==========================================
  // FORMAT MONEY
  // ==========================================
  const money = (amount) =>
    `₹${Number(amount || 0).toLocaleString(
      "en-IN"
    )}`;

  // ==========================================
  // FORMAT DATE
  // ==========================================
  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(
      date
    ).toLocaleString("en-IN");
  };

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
          Transparent festival money and
          expense tracking for everyone.
        </p>
      </section>

      {/* ======================================
          SUMMARY CARDS
      ====================================== */}

      <section className="cards">
        {/* TOTAL COLLECTED */}

        <div
          className="card"
          onClick={() =>
            setDetailsType(
              detailsType === "collected"
                ? null
                : "collected"
            )
          }
          style={{
            cursor: "pointer",
          }}
        >
          <span>
            Total Collected
          </span>

          <strong>
            {money(summary.totalIncome)}
          </strong>

          <small>
            Click to view details
          </small>
        </div>

        {/* PENDING DONATIONS */}

        <div
          className="card"
          onClick={() =>
            setDetailsType(
              detailsType === "pending"
                ? null
                : "pending"
            )
          }
          style={{
            cursor: "pointer",
          }}
        >
          <span>
            Pending Donations
          </span>

          <strong>
            {money(summary.totalPending)}
          </strong>

          <small>
            Click to view details
          </small>
        </div>

        {/* REMAINING BALANCE */}

        <div className="card">
          <span>
            Remaining Balance
          </span>

          <strong>
            {money(summary.balance)}
          </strong>
        </div>
      </section>

      {/* ======================================
          COLLECTED / PENDING DETAILS
      ====================================== */}

      {detailsType && (
        <section className="panel">
          <h2>
            {detailsType === "collected"
              ? "💰 Collected Donations"
              : "⏳ Pending Donations"}
          </h2>

          {detailTransactions.length ===
          0 ? (
            <p>
              {detailsType === "collected"
                ? "No collected donations yet."
                : "No pending donations yet."}
            </p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Person</th>
                    <th>Amount</th>
                    <th>Description</th>
                    <th>Date & Time</th>
                  </tr>
                </thead>

                <tbody>
                  {detailTransactions.map(
                    (item) => (
                      <tr
                        key={item._id}
                      >
                        <td>
                          {item.donorName ||
                            item.title ||
                            "-"}
                        </td>

                        <td>
                          {money(
                            item.amount
                          )}
                        </td>

                        <td>
                          {item.description ||
                            "-"}
                        </td>

                        <td>
                          {formatDate(
                            item.createdAt
                          )}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>

                <tfoot>
                  <tr>
                    <td>
                      <strong>
                        Total
                      </strong>
                    </td>

                    <td>
                      <strong>
                        {money(
                          detailTransactions.reduce(
                            (
                              sum,
                              item
                            ) =>
                              sum +
                              Number(
                                item.amount ||
                                  0
                              ),
                            0
                          )
                        )}
                      </strong>
                    </td>

                    <td colSpan="2"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </section>
      )}

      {/* ======================================
          PERSON FILTER
      ====================================== */}

      <section className="panel">
        <h2>
          🔎 Filter Transactions
        </h2>

        <label>
          Select Person
        </label>

        <select
          value={selectedPerson}
          onChange={(e) =>
            setSelectedPerson(
              e.target.value
            )
          }
        >
          <option value="all">
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

        <div
          style={{
            marginTop: "20px",
            padding: "20px",
            background: "#f5f5f5",
            borderRadius: "12px",
          }}
        >
          <span>
            {selectedPerson === "all"
              ? "Total Spent by Everyone"
              : `Total Spent by ${selectedPerson}`}
          </span>

          <h2
            style={{
              margin: "5px 0 0",
            }}
          >
            {money(
              selectedPersonSpent
            )}
          </h2>
        </div>

        <p>
          Showing transactions for{" "}
          <strong>
            {selectedPerson === "all"
              ? "everyone"
              : selectedPerson}
          </strong>
        </p>
      </section>

      {/* ======================================
          TRANSACTION HISTORY
      ====================================== */}

      <section className="panel">
        <h2>
          Transaction History
          {selectedPerson !== "all" &&
            ` — ${selectedPerson}`}
        </h2>

        {loading ? (
          <p>Loading...</p>
        ) : filteredTransactions.length ===
          0 ? (
          <p>
            No transactions found.
          </p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>
                    Person / Purpose
                  </th>
                  <th>Amount</th>
                  <th>Spent By</th>
                  <th>Added By</th>
                  <th>Date & Time</th>
                  <th>Description</th>
                </tr>
              </thead>

              <tbody>
                {filteredTransactions.map(
                  (item) => (
                    <tr
                      key={item._id}
                    >
                      <td>
                        <span
                          className={`badge ${item.type}`}
                        >
                          {item.type ===
                          "income"
                            ? "Money Collected"
                            : item.type ===
                              "pending"
                            ? "Pending Donation"
                            : "Money Spent"}
                        </span>
                      </td>

                      <td>
                        {item.type ===
                        "expense"
                          ? item.title
                          : item.donorName ||
                            item.title ||
                            "-"}
                      </td>

                      <td>
                        {money(
                          item.amount
                        )}
                      </td>

                      <td>
                        {item.type ===
                        "expense"
                          ? item.spentBy ||
                            "Not specified"
                          : "-"}
                      </td>

                      <td>
                        {item.addedBy
                          ?.name ||
                          "Unknown"}
                      </td>

                      <td>
                        {formatDate(
                          item.createdAt
                        )}
                      </td>

                      <td>
                        {item.description ||
                          "-"}
                      </td>
                    </tr>
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