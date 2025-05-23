const express = require("express");
const cors = require("cors");
require("dotenv").config();
const authRoutes = require("./routes/auth");
const schedulesRoutes = require("./routes/scheduleEntries");
const buildingsRoutes = require("./routes/buildings");
const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/scheduleEntries", schedulesRoutes);
app.use("/api/buildings", buildingsRoutes);
app.use((req, res, next) => {
  console.log(` [${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Ensure we listen on process.env.PORT (required by Azure)
const PORT = process.env.PORT || 3000; //change when on AZURRE!!!!! 3000

app.get("/api/health", (req, res) => {
  res.json({ message: "API is running!" });
});

app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
