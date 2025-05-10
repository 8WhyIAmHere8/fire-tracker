const express = require('express');
const router = express.Router();
const sql = require('mssql');
const { body, validationResult } = require('express-validator');

router.get("/", async (req, res) => {
  try {

    const pool = await sql.connect(process.env.DATABASE_URL);
    const result = await pool.request().query("SELECT * FROM buildings");
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error." });
  }
}
);
module.exports = router;