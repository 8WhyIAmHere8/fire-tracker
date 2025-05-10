const express = require('express');
const router = express.Router();
const sql = require('mssql');
const { body, validationResult } = require('express-validator');

router.post(
  "/add",
  [
    body("user_id").isInt(),
    body("building_id").isInt(),
    body("start_time").isISO8601(),
    body("end_time").isISO8601(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { user_id, building_id, start_time, end_time } = req.body;

    try {
      const pool = await sql.connect(process.env.DATABASE_URL);
      await pool.request()
        .input("user_id", sql.Int, user_id)
        .input("building_id", sql.Int, building_id)
        .input("start_time", sql.DateTime, start_time)
        .input("end_time", sql.DateTime, end_time)
        .query(`
          INSERT INTO schedules (user_id, building_id, start_time, end_time)
          VALUES (@user_id, @building_id, @start_time, @end_time)
        `);

      res.status(201).json({ message: "Schedule created successfully." });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error." });
    }
  }
);

// Get schedules for a user
router.get("/:user_id", async (req, res) => {
  const { user_id } = req.params;

  try {
    const pool = await sql.connect(process.env.DATABASE_URL);
    const result = await pool.request()
      .input("user_id", sql.Int, user_id)
      .query(`
        SELECT s.*, b.name AS building_name
        FROM schedules s
        JOIN buildings b ON s.building_id = b.id
        WHERE s.user_id = @user_id
        ORDER BY s.start_time DESC
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error." });
  }
});

module.exports = router;
