const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const sql = require("mssql");
require("dotenv").config();

const router = express.Router();

// 🔑 Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey"; 

//  Register User
router.post(
    "/register",
    [   
        body("username").notEmpty(),
        body("password").isLength({ min: 6 }),
        body("FullName").notEmpty(),
        body("staffNumber").notEmpty(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        console.log(req.body)
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
        const {username, staffNumber, FullName, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

    try {
        console.log("1, ", process.env.DATABASE_URL);
        const pool = await sql.connect(process.env.DATABASE_URL);
        console.log( "2", pool);
        const result = await pool
            .request()
            .input("username", sql.NVarChar, username)
            .input("password_hash", sql.NVarChar, hashedPassword)
            .input("staffNumber", sql.VarChar, staffNumber)
            .input("FullName", sql.VarChar, FullName)
            .query("INSERT INTO users (username, password_hash, staffNumber, FullName) VALUES (@username, @password_hash, @staffNumber, @FullName)");
        res.status(201).json({ success: true, message: "User registered successfully!" });
        console.log("3", result);
        } catch (error) {
        res.status(500).json({ error: "User already exists or DB error" });
        }
    }
);

//  Login User
router.post(
  "/login",
  [
    body("username").notEmpty(),
    body("password").notEmpty(),
  ],
  async (req, res) => {
    const { username, password } = req.body;

    try {
      const pool = await sql.connect(process.env.DATABASE_URL);
      const result = await pool
        .request()
        .input("username", sql.NVarChar, username)
        .query("SELECT * FROM users WHERE username = @username");

      if (!result.recordset.length) return res.status(401).json({ error: "Invalid credentials" });

      const user = result.recordset[0];
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1h" });
      res.json({ token, userId: user.id });
    } catch (error) {
      res.status(500).json({ error: "Database error" });
    }
  }
);

// Update user info
router.put(
  "/update",
  [
    body("userId").notEmpty(),
    body("FullName").notEmpty(),
    body("staffNumber").notEmpty(),
  ],
  async (req, res) => {
    const { userId, FullName, staffNumber } = req.body;
    try {
      const pool = await sql.connect(process.env.DATABASE_URL);
      await pool
        .request()
        .input("userId", sql.Int, userId)
        .input("FullName", sql.VarChar, FullName)
        .input("staffNumber", sql.VarChar, staffNumber)
        .query("UPDATE users SET FullName = @FullName, staffNumber = @staffNumber WHERE id = @userId");
      res.json({ message: "User info updated" });
    } catch (error) {
      res.status(500).json({ error: "Database error" });
    }
  }
);
router.get("/user/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await sql.connect(process.env.DATABASE_URL);
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query("SELECT FullName, staffNumber FROM users WHERE id = @id");
    if (!result.recordset.length) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(result.recordset[0]);
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});
module.exports = router;
