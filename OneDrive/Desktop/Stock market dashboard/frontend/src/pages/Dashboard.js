import React, { useState, useEffect } from "react";
import { getTransactions, createTransaction } from "../services/transactionService";
import { getStockQuote } from "../services/stockService";

const Dashboard = () => {
  const [symbol, setSymbol] = useState("");
  const [stockData, setStockData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "null");
  const userId = userInfo?.user?._id || userInfo?._id || localStorage.getItem("userId");

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    localStorage.removeItem("userId");
    window.location.href = "/login";
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!userId) return;
      try {
        const data = await getTransactions(userId);
        setTransactions(data);
      } catch (err) {
        console.error("Error fetching transactions:", err);
      }
    };
    fetchTransactions();
  }, [userId]);

  const handleSearch = async () => {
    if (!symbol.trim()) return alert("Enter stock symbol");

    try {
      setIsSearching(true);
      const data = await getStockQuote(symbol.trim().toUpperCase());
      setStockData(data);
    } catch (err) {
      console.error("Error fetching stock quote:", err);
      setStockData(null);
      const message = err?.response?.data?.message || err.message || "Failed to fetch stock data";
      alert(message);
    } finally {
      setIsSearching(false);
    }
  };

  const addTransaction = async (transactionType) => {
    if (!stockData) {
      alert("Search a stock first");
      return;
    }

    if (!userId) {
      alert("Session expired. Please login again.");
      return;
    }

    const normalizedQuantity = Number(quantity);
    if (!Number.isFinite(normalizedQuantity) || normalizedQuantity <= 0) {
      alert("Enter a valid quantity");
      return;
    }

    const transactionData = {
      stockSymbol: stockData.symbol,
      price: stockData.price,
      quantity: normalizedQuantity,
      transactionType,
      user: userId,
    };

    try {
      const newTransaction = await createTransaction(transactionData);
      setTransactions((prev) => [newTransaction, ...prev]);
      alert(`${transactionType.toUpperCase()} transaction added!`);
    } catch (err) {
      console.error("Error adding transaction:", err);
      const message = err?.response?.data?.message || err?.response?.data?.error || "Failed to add transaction";
      alert(message);
    }
  };

  const exportTransactionsToCSV = () => {
    if (!transactions.length) {
      alert("No transactions to export");
      return;
    }

    const headers = ["Symbol", "Price", "Quantity", "Type", "Date"];
    const rows = transactions.map((t) => [
      t.stockSymbol || "",
      t.price ?? "",
      t.quantity ?? "",
      (t.transactionType || t.type || "").toUpperCase(),
      t.date ? new Date(t.date).toISOString() : "",
    ]);

    const escapeCsv = (value) => `"${String(value).replace(/"/g, '""')}"`;
    const csvContent = [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-shell">
      <section className="surface-card dashboard-wrap">
        <div className="top-row">
          <div>
            <h1 className="panel-title">Stock Market Dashboard</h1>
            <p className="panel-subtitle">Track live quotes and add trade entries in one place.</p>
          </div>
          <button className="btn btn-reject" onClick={handleLogout}>Logout</button>
        </div>

        <div className="search-row">
          <input
            className="app-input"
            type="text"
            placeholder="Enter stock symbol (AAPL)"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
          />
          <button className="btn btn-primary" onClick={handleSearch} disabled={isSearching}>
            {isSearching ? "Searching..." : "Search"}
          </button>
        </div>

        {stockData && (
          <section className="quote-card">
            <div className="quote-head">
              <span className="quote-symbol">{stockData.symbol}</span>
              <span className="quote-price">${stockData.price}</span>
            </div>

            <div className="metric-grid">
              <div className="metric">
                <div className="metric-label">Change</div>
                <div className="metric-value">{stockData.change}</div>
              </div>
              <div className="metric">
                <div className="metric-label">Volume</div>
                <div className="metric-value">{stockData.volume}</div>
              </div>
            </div>

            <div className="trade-controls">
              <label className="trade-label" htmlFor="trade-quantity">Quantity</label>
              <input
                id="trade-quantity"
                className="app-input trade-input"
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
              <div className="trade-actions">
                <button className="btn btn-approve" onClick={() => addTransaction("buy")}>Buy</button>
                <button className="btn btn-reject" onClick={() => addTransaction("sell")}>Sell</button>
              </div>
            </div>
          </section>
        )}

        <section className="tx-panel">
          <div className="tx-header">
            <h2>My Transactions</h2>
            <button className="btn btn-primary" onClick={exportTransactionsToCSV}>
              Export CSV
            </button>
          </div>
          {transactions.length === 0 ? (
            <p className="empty">No transactions yet.</p>
          ) : (
            <div className="table-wrap">
              <table className="tx-table">
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Type</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => {
                    const txType = (t.transactionType || t.type || "").toLowerCase();
                    const badgeClass = txType === "sell" ? "badge badge-sell" : "badge badge-buy";

                    return (
                      <tr key={t._id}>
                        <td>{t.stockSymbol}</td>
                        <td>${t.price}</td>
                        <td>{t.quantity}</td>
                        <td><span className={badgeClass}>{txType.toUpperCase() || "BUY"}</span></td>
                        <td>{new Date(t.date).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </div>
  );
};

export default Dashboard;
