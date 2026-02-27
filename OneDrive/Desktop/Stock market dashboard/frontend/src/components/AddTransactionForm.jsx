import React, { useState } from "react";
import axios from "axios";

const AddTransactionForm = () => {
  const [stockSymbol, setStockSymbol] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [transactionType, setTransactionType] = useState("buy");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("User not logged in!");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/transactions/add", {
        user: userId,
        stockSymbol,
        price: Number(price),
        quantity: Number(quantity),
        transactionType,
      });

      alert("Transaction added successfully!");
      console.log(res.data);

      // Clear form
      setStockSymbol("");
      setPrice("");
      setQuantity("");
      setTransactionType("buy");
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Failed to add transaction");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: "auto" }}>
      <h2>Add Transaction</h2>
      <input
        type="text"
        placeholder="Stock Symbol"
        value={stockSymbol}
        onChange={(e) => setStockSymbol(e.target.value.toUpperCase())}
        required
      />
      <input
        type="number"
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        required
        step="0.01"
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
};

export default AddTransactionForm;