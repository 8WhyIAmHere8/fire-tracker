const express = require("express");
require("dotenv").config();

const app = express();

// Ensure we listen on process.env.PORT (required by Azure)
const PORT = process.env.PORT || 3000;

app.get("/api/health", (req, res) => {
  res.json({ message: "API is running!" });
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
