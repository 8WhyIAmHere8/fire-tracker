require("dotenv").config();
const sql = require("mssql");

const config = {
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  server: process.env.SQL_SERVER, 
  database: process.env.SQL_DATABASE,
  options: {
    encrypt: true, 
    trustServerCertificate: false,
  },
};

const connectDB = async () => {
  try {
    await sql.connect(config);
    console.log("Connected to Azure SQL Database");
  } catch (err) {
    console.error("Database connection failed:", err);
  }
};

module.exports = connectDB;
