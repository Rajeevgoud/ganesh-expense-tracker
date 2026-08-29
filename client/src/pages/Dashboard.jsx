import React, {
  useState,
  useEffect,
  useCallback,
} from "react";

import { api } from "../api";

export default function Dashboard() {
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    totalPending: 0,
    balance: 0,
  });

  const [transactions, setTransactions] = useState([]);

  const [loading, setLoading] = useState(true);

  const [selectedPerson, setSelectedPerson] =
    useState("all");

  // What card is currently selected
  const [selectedDetails, setSelectedDetails] =
    useState(null);

  // =====================================================
  // MEMBERS
  // =====================================================

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

  // =====================================================
  // FETCH DATA
  // =====================================================

  const fetchData = useCallback(async () => {
    try {
      const [
        summaryRes,
        transactionRes,
      ] = await Promise.all([
        api.get("/transactions/summary"),
        api.get("/transactions"),
      ]);

      setSummary(summaryRes.data);

      setTransactions(
        transactionRes.data
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

  // =====================================================
  // AUTO REFRESH
  // =====================================================

  useEffect(() => {
    fetchData();

    const interval = setInterval(
      fetchData,
      5000
    );

    return () =>
      clearInterval(interval);
  }, [fetchData]);

  // =====================================================
  // PERSON SPENDING TOTALS
  // =====================================================

  const spendingTotals = transactions
    .filter(
      (item) =>
        item.type === "expense" &&
        item.spentBy
    )
    .reduce(
      (totals, item) => {
        const person =
          item.spentBy;

        if (!totals[person]) {
          totals[person] = 0;
        }

        totals[person] += Number(
          item.amount || 0
        );

        return totals;
      },
      {}
    );

  // =====================================================
  // FILTERED TRANSACTIONS
  // =====================================================

  const filteredTransactions =
    selectedPerson === "all"
      ? transactions
      : transactions.filter(
          (item) =>
            item.type === "expense" &&
            item.spentBy ===
              selectedPerson
        );

  // =====================================================
  // FILTER TOTAL
  // =====================================================

  const filteredPersonTotal =
    selectedPerson === "all"
      ? Number(
          summary.totalExpense || 0
        )
      : Number(
          spendingTotals[
            selectedPerson
          ] || 0
        );

  // =====================================================
  // CARD CLICK
  // =====================================================

  const showDetails = (type) => {
    setSelectedDetails(type);

    // Scroll to details
    setTimeout(() => {
      document
        .getElementById(
          "details-section"
        )
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 100);
  };

  // =====================================================
  // DETAILS DATA
  // =====================================================

  const collectedTransactions =
    transactions.filter(
      (item) =>
        item.type === "income"
    );

  const pendingTransactions =
    transactions.filter(
      (item) =>
        item.type === "pending"
    );

  // =====================================================
  // DETAILS TOTALS
  // =====================================================

  const collectedTotal =
    collectedTransactions.reduce(
      (sum, item) =>
        sum +
        Number(item.amount || 0),
      0
    );

  const pendingTotal =
    pendingTransactions.reduce(
      (sum, item) =>
        sum +
        Number(item.amount || 0),
      0
    );

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div>

      {/* =================================================
          HERO
      ================================================= */}

      <section className="hero">
        <h1>
          🙏 Ganesh Festival Expense Tracker
        </h1>

        <p>
          Transparent festival money
          and expense tracking for
          everyone.
        </p>
      </section>


      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <section className="cards">

        {/* TOTAL COLLECTED */}

        <div
          className="card"
          onClick={() =>
            showDetails("collected")
          }
          style={{
            cursor: "pointer",
          }}
        >
          <span>
            Total Collected
          </span>

          <strong>
            ₹
            {Number(
              summary.totalIncome || 0
            ).toLocaleString(
              "en-IN"
            )}
          </strong>

          <small>
            Click to view details
          </small>
        </div>


        {/* PENDING DONATIONS */}

        <div
          className="card"
          onClick={() =>
            showDetails("pending")
          }
          style={{
            cursor: "pointer",
          }}
        >
          <span>
            Pending Donations
          </span>

          <strong>
            ₹
            {Number(
              summary.totalPending || 0
            ).toLocaleString(
              "en-IN"
            )}
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
            ₹
            {Number(
              summary.balance || 0
            ).toLocaleString(
              "en-IN"
            )}
          </strong>
        </div>

      </section>


      {/* =================================================
          SELECTED CARD DETAILS
      ================================================= */}

      {selectedDetails && (
        <section
          className="panel"
          id="details-section"
        >

          {/* =============================================
              COLLECTED DETAILS
          ============================================= */}

          {selectedDetails ===
            "collected" && (
            <>
              <h2>
                💰 Collected Donations
              </h2>

              <p>
                Total collected:{" "}
                <strong>
                  ₹
                  {Number(
                    collectedTotal
                  ).toLocaleString(
                    "en-IN"
                  )}
                </strong>
              </p>

              {collectedTransactions.length ===
              0 ? (
                <p>
                  No collected
                  donations yet.
                </p>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>
                          Purpose
                        </th>

                        <th>
                          Amount
                        </th>

                        <th>
                          Added By
                        </th>

                        <th>
                          Date & Time
                        </th>

                        <th>
                          Description
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {collectedTransactions.map(
                        (item) => (
                          <tr
                            key={
                              item._id
                            }
                          >
                            <td>
                              {item.title ||
                                "-"}
                            </td>

                            <td>
                              ₹
                              {Number(
                                item.amount ||
                                  0
                              ).toLocaleString(
                                "en-IN"
                              )}
                            </td>

                            <td>
                              {
                                item
                                  .addedBy
                                  ?.name ||
                                "Unknown"
                              }
                            </td>

                            <td>
                              {new Date(
                                item.createdAt
                              ).toLocaleString()}
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

              <button
                type="button"
                onClick={() =>
                  setSelectedDetails(
                    null
                  )
                }
                style={{
                  marginTop: "15px",
                }}
              >
                Close Details
              </button>
            </>
          )}


          {/* =============================================
              PENDING DETAILS
          ============================================= */}

          {selectedDetails ===
            "pending" && (
            <>
              <h2>
                ⏳ Pending Donations
              </h2>

              <p>
                Total pending:{" "}
                <strong>
                  ₹
                  {Number(
                    pendingTotal
                  ).toLocaleString(
                    "en-IN"
                  )}
                </strong>
              </p>

              {pendingTransactions.length ===
              0 ? (
                <p>
                  No pending
                  donations.
                </p>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>
                          Donor Name
                        </th>

                        <th>
                          Amount
                        </th>

                        <th>
                          Description
                        </th>

                        <th>
                          Added By
                        </th>

                        <th>
                          Date & Time
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {pendingTransactions.map(
                        (item) => (
                          <tr
                            key={
                              item._id
                            }
                          >
                            <td>
                              <strong>
                                {
                                  item.donorName ||
                                  "Unknown"
                                }
                              </strong>
                            </td>

                            <td>
                              ₹
                              {Number(
                                item.amount ||
                                  0
                              ).toLocaleString(
                                "en-IN"
                              )}
                            </td>

                            <td>
                              {item.description ||
                                "-"}
                            </td>

                            <td>
                              {
                                item
                                  .addedBy
                                  ?.name ||
                                "Unknown"
                              }
                            </td>

                            <td>
                              {new Date(
                                item.createdAt
                              ).toLocaleString()}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              <button
                type="button"
                onClick={() =>
                  setSelectedDetails(
                    null
                  )
                }
                style={{
                  marginTop: "15px",
                }}
              >
                Close Details
              </button>
            </>
          )}

        </section>
      )}


      {/* =================================================
          FILTER
      ================================================= */}

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


        {/* PERSON TOTAL */}

        <div
          style={{
            marginTop: "20px",
            padding: "20px",
            borderRadius: "12px",
            background:
              "#f5f5f5",
          }}
        >

          <span>
            {selectedPerson ===
            "all"
              ? "Total Spent by Everyone"
              : `Total Spent by ${selectedPerson}`}
          </span>

          <h2
            style={{
              marginTop: "5px",
              marginBottom: "0",
            }}
          >
            ₹
            {Number(
              filteredPersonTotal
            ).toLocaleString(
              "en-IN"
            )}
          </h2>

        </div>


        <p>
          Showing transactions for{" "}

          <strong>
            {selectedPerson ===
            "all"
              ? "everyone"
              : selectedPerson}
          </strong>
        </p>

      </section>


      {/* =================================================
          TRANSACTION HISTORY
      ================================================= */}

      <section className="panel">

        <h2>
          Transaction History
        </h2>

        {loading ? (
          <p>
            Loading...
          </p>
        ) : (
          <div className="table-wrap">

            <table>

              <thead>
                <tr>
                  <th>
                    Type
                  </th>

                  <th>
                    Purpose
                  </th>

                  <th>
                    Amount
                  </th>

                  <th>
                    Spent By
                  </th>

                  <th>
                    Added By
                  </th>

                  <th>
                    Date & Time
                  </th>

                  <th>
                    Description
                  </th>
                </tr>
              </thead>


              <tbody>

                {filteredTransactions.length ===
                0 ? (
                  <tr>
                    <td
                      colSpan="7"
                    >
                      No transactions
                      found.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map(
                    (item) => (
                      <tr
                        key={
                          item._id
                        }
                      >

                        <td>
                          <span
                            className={`badge ${item.type}`}
                          >
                            {item.type ===
                            "income"
                              ? "Money Added"
                              : item.type ===
                                "expense"
                              ? "Money Spent"
                              : "Pending Donation"}
                          </span>
                        </td>


                        <td>
                          {item.type ===
                          "pending"
                            ? "Pending Donation"
                            : item.title}
                        </td>


                        <td>
                          ₹
                          {Number(
                            item.amount ||
                              0
                          ).toLocaleString(
                            "en-IN"
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
                          {
                            item
                              .addedBy
                              ?.name ||
                            "Unknown"
                          }
                        </td>


                        <td>
                          {new Date(
                            item.createdAt
                          ).toLocaleString()}
                        </td>


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