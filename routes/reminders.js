// reminders.js
const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  const { user_id, date } = req.query;
  let filteredReminders = reminders;
  if (user_id) {
    filteredReminders = reminders.filter((r) => r.user_id === user_id);
  }
  if (date) {
    filteredReminders = filteredReminders.filter((r) => r.date === date);
  }
  res.json({ reminders: filteredReminders });
});

router.post("/", (req, res) => {
  const reminder = req.body;
  reminder.id = reminders.length + 1;
  reminders.push(reminder);
  res.json(reminder);
});

module.exports = router;
