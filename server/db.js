require("dotenv").config();
const sql = require("mssql");

const config = {
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  server: process.env.DATABASE_SERVER,
  database: process.env.DATABASE_NAME,
  options: {
    encrypt: true, 
    trustServerCertificate: false,
  },
};

const connectDB = async () => {
  try {
    await sql.connect(config);
    console.log("✅ Connected to Azure SQL Database");
  } catch (err) {
    console.error("❌ Database connection failed:", err);
  }
};

module.exports = connectDB;
