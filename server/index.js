const express = require("express");
require("dotenv").config();
const connectDB = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to Azure SQL
connectDB();

app.get("/api/health", (req, res) => res.json({ message: "API is running!" }));

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
