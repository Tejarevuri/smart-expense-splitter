const express = require("express");
const fs = require("fs").promises; // Using Promises for better performance
const { existsSync, mkdirSync, writeFileSync } = require("fs"); 
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

// --- Initialization (Sync is okay here because it only runs once at startup) ---
const DATA_DIR = path.join(__dirname, "data");
const MEMBERS_FILE = path.join(DATA_DIR, "members.json");
const EXPENSES_FILE = path.join(DATA_DIR, "expenses.json");

if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR);
if (!existsSync(MEMBERS_FILE)) writeFileSync(MEMBERS_FILE, JSON.stringify(["Teja", "Ananya", "Divya"]));
if (!existsSync(EXPENSES_FILE)) writeFileSync(EXPENSES_FILE, JSON.stringify([]));

// --- Helper Functions ---
const readData = async (file) => JSON.parse(await fs.readFile(file, "utf8"));
const writeData = async (file, data) => await fs.writeFile(file, JSON.stringify(data, null, 2));

// --- API Routes ---

app.get("/members", async (req, res) => {
    try {
        const members = await readData(MEMBERS_FILE);
        res.json(members);
    } catch (err) {
        res.status(500).json({ error: "Failed to read members" });
    }
});

app.post("/members", async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });

    const members = await readData(MEMBERS_FILE);
    if (!members.includes(name)) {
        members.push(name);
        await writeData(MEMBERS_FILE, members);
    }
    res.json(members);
});

app.delete("/members/:name", async (req, res) => {
    let members = await readData(MEMBERS_FILE);
    members = members.filter(m => m !== req.params.name);
    await writeData(MEMBERS_FILE, members);
    res.json(members);
});

app.get("/expenses", async (req, res) => {
    const expenses = await readData(EXPENSES_FILE);
    res.json(expenses);
});

app.post("/expenses", async (req, res) => {
    const { description, amount, paidBy, splitBetween } = req.body;
    
    // Basic validation
    if (!amount || !paidBy || !splitBetween) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const expenses = await readData(EXPENSES_FILE);
    expenses.push({ 
        description, 
        paidBy, 
        splitBetween, 
        amount: Number(amount),
        date: new Date().toISOString() 
    });
    
    await writeData(EXPENSES_FILE, expenses);
    res.json({ message: "Added" });
});

app.delete("/expenses", async (req, res) => {
    await writeData(EXPENSES_FILE, []);
    res.json([]);
});

app.get("/debts", async (req, res) => {
    const expenses = await readData(EXPENSES_FILE);
    const debts = {};

    expenses.forEach(exp => {
        if (exp.splitBetween && exp.splitBetween.length > 0) {
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

// --- Static Frontend Serving ---
const frontendPath = path.join(__dirname, "../frontend/build");
if (existsSync(frontendPath)) {
    app.use(express.static(frontendPath));
    // Serve index.html for all non-API routes
    app.get("*", (req, res, next) => {
        if (req.path.startsWith('/api')) return next(); // Don't serve HTML for API calls
        res.sendFile(path.join(frontendPath, "index.html"));
    });
}

app.listen(PORT, () => console.log(`🚀 Server running on Port ${PORT}`));