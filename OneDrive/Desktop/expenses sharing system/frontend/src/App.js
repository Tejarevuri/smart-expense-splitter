import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [members, setMembers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [debts, setDebts] = useState({});
  const [newName, setNewName] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [splitBetween, setSplitBetween] = useState([]);

  const api = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const refresh = async () => {
    try {
      const m = await (await fetch(`${api}/members`)).json();
      const e = await (await fetch(`${api}/expenses`)).json();
      const d = await (await fetch(`${api}/debts`)).json();
      setMembers(m); setExpenses(e); setDebts(d);
      if (m.length > 0 && !paidBy) setPaidBy(m[0]);
    } catch (e) { console.log("Check Backend"); }
  };

  useEffect(() => { refresh(); }, []);

  const handleAction = async (path, method, body) => {
    await fetch(`${api}${path}`, {
      method, headers: {'Content-Type': 'application/json'},
      body: body ? JSON.stringify(body) : null
    });
    refresh();
  };

  return (
    <div className="ios-container">
      <div className="ios-header">
        <span style={{ fontSize: '14px', color: '#666', fontWeight: 500 }}>frontend/App.js</span>
        <button className="ios-btn-blue">Splits Now</button>
      </div>

      <div className="ios-main">
        <div className="ios-sidebar">
          <h5 style={{ color: '#888', margin: '0 0 15px 0' }}>MEMBERS</h5>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '25px' }}>
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Name" style={{margin:0}} />
            <button onClick={() => { handleAction('/members', 'POST', {name: newName}); setNewName(""); }} 
                    style={{ background: '#e5e5ea', border: 'none', borderRadius: '10px', padding: '0 12px', cursor:'pointer' }}>+</button>
          </div>

          <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '30px' }}>
            {members.map(m => (
              <div key={m} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '0.5px solid rgba(0,0,0,0.05)' }}>
                <span>{m}</span>
                <span onClick={() => handleAction(`/members/${m}`, 'DELETE')} style={{ color: '#ff3b30', cursor: 'pointer', fontSize: '12px' }}>Remove</span>
              </div>
            ))}
          </div>

          <div className="ios-card-dark">
            <h5 style={{ margin: '0 0 15px 0', color: '#0a84ff' }}>SETTLEMENT</h5>
            {Object.entries(debts).map(([person, owes]) => (
              <div key={person} style={{ marginBottom: '12px', fontSize: '13px' }}>
                <div style={{ color: '#888' }}>{person} owes:</div>
                {Object.entries(owes).map(([to, val]) => (
                  <div key={to} style={{ fontWeight: 600 }}>→ {to}: ₹{val}</div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="ios-content">
          <h2 style={{ fontWeight: 600, marginTop: 0 }}>Record New Expense</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: '#888' }}>AMOUNT</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="₹ 0.00" />
              <label style={{ fontSize: '11px', fontWeight: 600, color: '#888' }}>DESCRIPTION</label>
              <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Lunch, Taxi, etc." />
            </div>
            
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: '#888' }}>PAID BY</label>
              <select value={paidBy} onChange={e => setPaidBy(e.target.value)}>
                {members.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <label style={{ fontSize: '11px', fontWeight: 600, color: '#888' }}>SPLIT WITH</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                {members.map(m => (
                  <label key={m} style={{ fontSize: '14px', display: 'flex', alignItems: 'center' }}>
                    <input type="checkbox" checked={splitBetween.includes(m)} onChange={() => setSplitBetween(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])} style={{ width: 'auto', marginRight: '8px' }} /> {m}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <button className="ios-btn-blue" onClick={() => { handleAction('/expenses', 'POST', {amount, description, paidBy, splitBetween}); setAmount(""); setDescription(""); setSplitBetween([]); }} style={{ width: '100%', padding: '18px' }}>Confirm Expense</button>

          <div style={{ marginTop: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h5 style={{ color: '#888', margin: 0 }}>HISTORY</h5>
              {expenses.length > 0 && (
                <button 
                  onClick={() => { if(window.confirm("Clear all history?")) handleAction('/expenses', 'DELETE'); }}
                  style={{ background: 'rgba(255, 59, 48, 0.1)', border: 'none', color: '#ff3b30', fontSize: '11px', fontWeight: '600', cursor: 'pointer', padding: '5px 10px', borderRadius: '8px' }}
                >
                  CLEAR ALL
                </button>
              )}
            </div>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ color: '#fffefe', fontSize: '11px', borderBottom: '1px solid #eee' }}>
                  <th style={{ padding: '10px' }}>DESCRIPTION</th>
                  <th>AMOUNT</th>
                  <th>PAYER</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp, i) => (
                  <tr key={i} style={{ fontSize: '13px', borderBottom: '0.5px solid #f9f9f9' }}>
                    <td style={{ padding: '15px 10px' }}>{exp.description}</td>
                    <td style={{ fontWeight: 600 }}>₹{exp.amount}</td>
                    <td>{exp.paidBy}</td>
                    <td><span style={{ color: '#b2f13e', background: '#eafaf1', padding: '4px 8px', borderRadius: '6px', fontSize: '10px' }}>RECORDED</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;