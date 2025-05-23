const express = require('express');
const router = express.Router();
const sql = require('mssql');
const { body, validationResult } = require('express-validator');

router.post(
  "/add",

  async (req, res) => {
  const entries = req.body; 

  try {
    const pool = await sql.connect(process.env.DATABASE_URL);
    
    const result = await pool
    for (const entry of entries) {
      if (!entry.buildingId) {
        await pool.request()
          .input("Week", sql.NVarChar(10), entry.week)
          .input("Day", sql.NVarChar(10), entry.day)
          .input("Slot", sql.NVarChar(10), entry.slot)
          .input("userId", sql.Int, entry.userId)
          .query(`
            DELETE FROM ScheduleEntries
            WHERE [Week] = @Week AND [Day] = @Day AND Slot = @Slot AND userId = @userId
          `);
      } else {
        await pool.request()
          .input("Week", sql.NVarChar(10), entry.week)
          .input("Day", sql.NVarChar(10), entry.day)
          .input("Slot", sql.NVarChar(10), entry.slot)
          .input("userId", sql.Int, entry.userId)
          .input("buildingId", sql.Int, entry.buildingId)
          .query(`
            MERGE ScheduleEntries AS target
            USING (SELECT @Week AS [Week], @Day AS [Day], @Slot AS Slot, @userId AS userId) AS source
            ON target.[Week] = source.[Week] AND target.[Day] = source.[Day] AND target.[Slot] = source.[Slot] AND target.userId = source.userId
            WHEN MATCHED THEN
              UPDATE SET buildingId = @buildingId, UpdatedAt = SYSDATETIME()
            WHEN NOT MATCHED THEN
              INSERT ([Week], [Day], Slot, userId, buildingId)
              VALUES (@Week, @Day, @Slot, @userId, @buildingId);
          `);
      }
    }
    
    
    res.status(200).json({ message: "Saved successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({message: "Failed to save schedule." } );
  }
  }
);
router.get("/zones/:week", async (req, res) => {
  const { week } = req.params; 
  if (!week) {
    return res.status(400).send("Missing 'week' query parameter");
  }

  const zoneMap = {
    A: [1, 18, 24, 4, 7, 3, 5, 17],
    B: [8, 11, 9, 27, 13, 6],
    C: [30, 20, 19, 12, 25],
    D: [2, 15, 16],
    E: [10, 13, 21, 22],
    F: [29, 28, 26, 14]
  };

  try {
    const pool = await sql.connect(process.env.DATABASE_URL);

    const result = await pool.request()
      .input("Week", sql.NVarChar(10), week)
      .query(`
        SELECT se.Day, se.Slot, se.userId, se.buildingId, u.FullName
        FROM ScheduleEntries se
        JOIN users u ON se.userId = u.id
        WHERE se.Week = @Week
      `);
    console.log("result", result.recordset);
    // Group by zone
    

    res.json( result.recordset);
  } catch (err) {
    console.error("Zone schedule error:", err);
    res.status(500).send("Failed to fetch zone schedule.");
  }
});

// Get schedules for a user
router.get("/:userId/:week", async (req, res) => {
  const { week } = req.params; 
  const { userId } = req.params;
  console.log(req.query);
  console.log("week", week);
  console.log("userId", userId);

  // Validate input
  if (!week || !userId) {
    return res.status(400).send("Missing 'week' or 'userId' query parameter.");
  }

  try {
    const pool = await sql.connect(process.env.DATABASE_URL);

    const result = await pool.request()
      .input("Week", sql.NVarChar(10), week)
      .input("userId", sql.Int, userId)
      .query(`
        SELECT Day, Slot, buildingId
        FROM ScheduleEntries
        WHERE Week = @Week AND userId = @userId
      `);
    console.log("result", result.recordset);
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
    const slots = ["9-11", "11-13", "13-15", "15-17"];

    // Initialize empty schedule structure
    const schedule = {};
    days.forEach(day => {
      schedule[day] = {};
      slots.forEach(slot => {
        schedule[day][slot] = null;
      });
    });

    for (const row of result.recordset) {
      const { Day, Slot, buildingId } = row;
      if (schedule[Day] && schedule[Day][Slot] !== undefined) {
        schedule[Day][Slot] = buildingId;
      }
    }

    res.json(schedule);
    console.log("schedule", schedule);
  } catch (err) {
    console.error("User schedule fetch error:", err);
    res.status(500).send("Failed to fetch user schedule.");
  }
});

module.exports = router;
