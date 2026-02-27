import React, { useEffect, useState } from "react";
import API from "../services/api";

const AdminPanel = () => {
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/transactions/pending");
      setPendingTransactions(data);
    } catch (err) {
      alert("Access denied or server error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleAction = async (id, status) => {
    try {
      await API.put("/transactions/status", { id, status });
      alert(`Trade ${status}!`);
      fetchPending();
    } catch (err) {
      alert("Action failed");
    }
  };

  return (
    <div className="page-shell">
      <section className="surface-card dashboard-wrap">
        <h1 className="panel-title">Admin Trade Approval</h1>
        <p className="panel-subtitle">Review pending trades and approve or reject them.</p>

        <section className="tx-panel">
          {loading ? (
            <p className="empty">Loading pending trades...</p>
          ) : pendingTransactions.length === 0 ? (
            <p className="empty">No trades waiting for approval.</p>
          ) : (
            <div className="table-wrap">
              <table className="tx-table">
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingTransactions.map((trade) => (
                    <tr key={trade._id}>
                      <td>{trade.symbol}</td>
                      <td>{trade.quantity}</td>
                      <td>${trade.priceAtPurchase}</td>
                      <td>
                        <div className="action-row">
                          <button className="btn btn-approve" onClick={() => handleAction(trade._id, "approved")}>Approve</button>
                          <button className="btn btn-reject" onClick={() => handleAction(trade._id, "rejected")}>Reject</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </div>
  );
};

export default AdminPanel;
