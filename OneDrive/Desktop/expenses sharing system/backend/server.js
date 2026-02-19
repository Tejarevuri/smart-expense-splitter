const express = require("express");
const fs = require("fs");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true
}));

// Serve static files from frontend build
const frontendPath = path.join(__dirname, "../frontend/build");
console.log("Looking for frontend at:", frontendPath);
console.log("Frontend exists:", fs.existsSync(frontendPath));

if (fs.existsSync(frontendPath)) {
    app.use(express.static(frontendPath));
    console.log("✅ Serving frontend from build folder");
} else {
    console.log("⚠️ Frontend build folder not found. Some features may not work.");
}

const DATA_DIR = path.join(__dirname, "data");
const MEMBERS_FILE = path.join(DATA_DIR, "members.json");
const EXPENSES_FILE = path.join(DATA_DIR, "expenses.json");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(MEMBERS_FILE)) fs.writeFileSync(MEMBERS_FILE, JSON.stringify(["Teja", "Ananya", "Divya"]));
if (!fs.existsSync(EXPENSES_FILE)) fs.writeFileSync(EXPENSES_FILE, JSON.stringify([]));

app.get("/members", (req, res) => res.json(JSON.parse(fs.readFileSync(MEMBERS_FILE))));

app.post("/members", (req, res) => {
    let members = JSON.parse(fs.readFileSync(MEMBERS_FILE));
    if (req.body.name && !members.includes(req.body.name)) {
        members.push(req.body.name);
        fs.writeFileSync(MEMBERS_FILE, JSON.stringify(members));
    }
    res.json(members);
});

app.delete("/members/:name", (req, res) => {
    let members = JSON.parse(fs.readFileSync(MEMBERS_FILE));
    members = members.filter(m => m !== req.params.name);
    fs.writeFileSync(MEMBERS_FILE, JSON.stringify(members));
    res.json(members);
});

app.get("/expenses", (req, res) => res.json(JSON.parse(fs.readFileSync(EXPENSES_FILE))));

app.post("/expenses", (req, res) => {
    const expenses = JSON.parse(fs.readFileSync(EXPENSES_FILE));
    expenses.push({ ...req.body, amount: Number(req.body.amount) });
    fs.writeFileSync(EXPENSES_FILE, JSON.stringify(expenses));
    res.json({ message: "Added" });
});

// IMPORTANT: This route clears the history
app.delete("/expenses", (req, res) => {
    fs.writeFileSync(EXPENSES_FILE, JSON.stringify([]));
    res.json([]);
});

app.get("/debts", (req, res) => {
    const expenses = JSON.parse(fs.readFileSync(EXPENSES_FILE));
    const debts = {};
    expenses.forEach(exp => {
        if (exp.splitBetween.length > 0) {
            const share = Number(exp.amount) / exp.splitBetween.length;
            exp.splitBetween.forEach(person => {
                if (person !== exp.paidBy) {
                    if (!debts[person]) debts[person] = {};
                    debts[person][exp.paidBy] = Number(((debts[person][exp.paidBy] || 0) + share).toFixed(2));
                }
            });
        }
    });
    res.json(debts);
});
// This defines the response for the "home" path (/)
app.get('/', (req, res) => {
    res.send('🚀 Smart Expense Splitter API is running successfully!');
});

// Serve frontend for all other routes (client-side routing)
app.get('*', (req, res) => {
    const indexPath = path.join(__dirname, "../frontend/build/index.html");
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).json({ error: "Frontend not built. Run: cd frontend && npm run build" });
    }
});

app.listen(PORT, () => console.log(`Server running on Port ${PORT}`));