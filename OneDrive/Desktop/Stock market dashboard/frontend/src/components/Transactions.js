import { useEffect, useState } from "react";
import AddTransaction from "./AddTransaction";

export default function Transactions({ loggedInUserId }) {
  const [transactions, setTransactions] = useState([]);

  // fetch transactions from backend
  const fetchTransactions = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/transactions/user/${loggedInUserId}`);
      const data = await res.json();
      if (res.ok) setTransactions(data.transactions);
      else console.error(data.message);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <div>
      <h2>My Transactions</h2>
      <AddTransaction loggedInUserId={loggedInUserId} refreshTransactions={fetchTransactions} />
      {transactions.length === 0 ? (
        <p>No transactions yet.</p>
      ) : (
        <table border="1" cellPadding="5">
          <thead>
            <tr>
              <th>Stock</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Type</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t._id}>
                <td>{t.stockSymbol}</td>
                <td>{t.price}</td>
                <td>{t.quantity}</td>
                <td>{t.transactionType}</td>
                <td>{new Date(t.date).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}