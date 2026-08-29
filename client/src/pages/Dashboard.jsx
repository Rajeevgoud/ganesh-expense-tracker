import React, {
  useState,
  useEffect,
  useCallback,
} from "react";

import { api } from "../api";


export default function Dashboard() {

  const [summary, setSummary] =
    useState({
      totalIncome: 0,
      totalExpense: 0,
      totalPending: 0,
      balance: 0,
    });


  const [transactions, setTransactions] =
    useState([]);


  const [loading, setLoading] =
    useState(true);


  // Selected person
  const [selectedPerson, setSelectedPerson] =
    useState("all");


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
  // FETCH DATA
  // =================================================

  const fetchData =
    useCallback(async () => {

      try {

        const [
          summaryRes,
          transactionRes,
        ] = await Promise.all([

          api.get(
            "/transactions/summary"
          ),

          api.get(
            "/transactions"
          ),

        ]);


        setSummary(
          summaryRes.data
        );


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


  // =================================================
  // AUTO REFRESH
  // =================================================

  useEffect(() => {

    fetchData();


    const interval =
      setInterval(
        fetchData,
        5000
      );


    return () =>
      clearInterval(interval);

  }, [fetchData]);


  // =================================================
  // PERSON TOTALS
  // =================================================

  const spendingTotals =
    transactions
      .filter(
        (item) =>
          item.type === "expense" &&
          item.spentBy
      )
      .reduce(
        (
          totals,
          item
        ) => {

          const person =
            item.spentBy;


          if (
            !totals[person]
          ) {
            totals[person] = 0;
          }


          totals[person] +=
            Number(
              item.amount || 0
            );


          return totals;

        },
        {}
      );


  // =================================================
  // FILTERED TRANSACTIONS
  // =================================================

  const filteredTransactions =
    selectedPerson === "all"

      ? transactions

      : transactions.filter(
          (item) =>
            item.type === "expense" &&
            item.spentBy ===
              selectedPerson
        );


  // =================================================
  // FILTERED PERSON TOTAL
  // =================================================

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


  // =================================================
  // PENDING DONATIONS
  // =================================================

  const pendingDonations =
    transactions.filter(
      (item) =>
        item.type === "pending"
    );


  // =================================================
  // RENDER
  // =================================================

  return (
    <div>

      {/* ============================================
          HERO
      ============================================ */}

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


      {/* ============================================
          SUMMARY CARDS
      ============================================ */}

      <section className="cards">

        {/* TOTAL COLLECTED */}

        <div className="card">

          <span>
            Total Collected
          </span>

          <strong>

            ₹
            {Number(
              summary.totalIncome ||
                0
            ).toLocaleString(
              "en-IN"
            )}

          </strong>

        </div>


        {/* PENDING */}

        <div className="card">

          <span>
            Pending Donations
          </span>

          <strong>

            ₹
            {Number(
              summary.totalPending ||
                0
            ).toLocaleString(
              "en-IN"
            )}

          </strong>

        </div>


        {/* BALANCE */}

        <div className="card">

          <span>
            Remaining Balance
          </span>

          <strong>

            ₹
            {Number(
              summary.balance ||
                0
            ).toLocaleString(
              "en-IN"
            )}

          </strong>

        </div>

      </section>


      {/* ============================================
          FILTER
      ============================================ */}

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


        {/* FILTER TOTAL */}

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


      {/* ============================================
          TRANSACTION HISTORY
      ============================================ */}

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

                        {/* TYPE */}

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


                        {/* PURPOSE */}

                        <td>
                          {
                            item.title
                          }
                        </td>


                        {/* AMOUNT */}

                        <td>

                          ₹
                          {Number(
                            item.amount ||
                              0
                          ).toLocaleString(
                            "en-IN"
                          )}

                        </td>


                        {/* SPENT BY */}

                        <td>

                          {item.type ===
                          "expense"
                            ? item.spentBy ||
                              "Not specified"
                            : item.type ===
                              "pending"
                            ? "-"
                            : "-"}

                        </td>


                        {/* ADDED BY */}

                        <td>

                          {
                            item
                              .addedBy
                              ?.name ||
                            "Unknown"
                          }

                        </td>


                        {/* DATE */}

                        <td>

                          {new Date(
                            item.createdAt
                          ).toLocaleString()}

                        </td>


                        {/* DESCRIPTION */}

                        <td>

                          {
                            item.description ||
                            "-"
                          }

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


      {/* ============================================
          PENDING DONATIONS
      ============================================ */}

      <section className="panel">

        <h2>
          💰 Pending Donations
        </h2>


        {pendingDonations.length ===
        0 ? (

          <p>
            No pending donations.
          </p>

        ) : (

          <>

            <div className="table-wrap">

              <table>

                <thead>

                  <tr>

                    <th>
                      Donor
                    </th>

                    <th>
                      Amount
                    </th>

                    <th>
                      Details
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

                  {pendingDonations.map(
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

                          {
                            item.description ||
                            item.title ||
                            "-"
                          }

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


            {/* TOTAL PENDING */}

            <div
              style={{
                marginTop: "20px",
                padding: "15px",
                fontSize: "20px",
              }}
            >

              <strong>

                Total Pending: ₹
                {Number(
                  summary.totalPending ||
                    0
                ).toLocaleString(
                  "en-IN"
                )}

              </strong>

            </div>

          </>

        )}

      </section>


      {/* ============================================
          PERSON TOTALS
      ============================================ */}

      <section className="panel">

        <h2>
          👥 Spending by Person
        </h2>


        <div className="table-wrap">

          <table>

            <thead>

              <tr>

                <th>
                  Person
                </th>

                <th>
                  Total Spent
                </th>

              </tr>

            </thead>


            <tbody>

              {members.map(
                (person) => (

                  <tr
                    key={person}
                  >

                    <td>

                      <strong>
                        {person}
                      </strong>

                    </td>

                    <td>

                      ₹
                      {Number(
                        spendingTotals[
                          person
                        ] || 0
                      ).toLocaleString(
                        "en-IN"
                      )}

                    </td>

                  </tr>

                )
              )}


              {/* TOTAL */}

              <tr>

                <td>

                  <strong>
                    Total
                  </strong>

                </td>


                <td>

                  <strong>

                    ₹
                    {Number(
                      summary.totalExpense ||
                        0
                    ).toLocaleString(
                      "en-IN"
                    )}

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