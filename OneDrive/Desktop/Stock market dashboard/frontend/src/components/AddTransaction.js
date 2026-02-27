import { useState } from "react";

export default function AddTransaction({ loggedInUserId, refreshTransactions }) {
  const [stockSymbol, setStockSymbol] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [transactionType, setTransactionType] = useState("buy"); // default "buy"

  const handleSubmit = async (e) => {
    e.preventDefault();

    // build transaction object
    const transaction = {
      user: loggedInUserId,
      stockSymbol: stockSymbol.toUpperCase(),
      price: Number(price),
      quantity: Number(quantity),
      transactionType
    };

    try {
      const res = await fetch("http://localhost:5000/api/transactions/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transaction)
      });

      const data = await res.json();

      if (res.ok) {
        alert("Transaction added successfully!");
        // reset form
        setStockSymbol("");
        setPrice("");
        setQuantity("");
        setTransactionType("buy");
        // refresh parent transaction list
        refreshTransactions();
      } else {
        alert("Error: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Server error: " + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
      <input
        type="text"
        placeholder="Stock Symbol"
        value={stockSymbol}
        onChange={(e) => setStockSymbol(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Quantity"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        required
      />
      <select
        value={transactionType}
        onChange={(e) => setTransactionType(e.target.value)}
      >
        <option value="buy">Buy</option>
        <option value="sell">Sell</option>
      </select>
      <button type="submit">Add Transaction</button>
    </form>
  );
}