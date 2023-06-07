// events.js
const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const db = require("../handlers/firebase");
const secretKey = require("../handlers/jwt_key");

router.get("/", (req, res) => {
  const { start, end } = req.query;
  const token = req.header("Authorization");
  jwt.verify(token, secretKey, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = decoded.email;
    const eventsRef = db.collection("events");
    const eventsGet = await eventsRef.where("user", "==", user).get();
    let filteredEvents = eventsGet.docs.map((doc) => doc.data());
    if (start) {
      filteredEvents = filteredEvents.filter(
        (e) => e.date_start >= start && e.user == user
      );
    }
    if (end) {
      filteredEvents = filteredEvents.filter(
        (e) => e.date_end <= end && e.user == user
      );
    }
    res.json({ events: filteredEvents });
  });
});

router.post("/", async (req, res) => {
  const event = req.body;
  const token = req.header("Authorization");
  jwt.verify(token, secretKey, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = decoded.email;
    event.user = user;
    const eventsRef = db.collection("events");
    const eventsGet = await eventsRef.add(event);
    if (eventsGet && eventsGet.id) {
      event.id = eventsGet.id;
    }
    res.json(event);
  });
});

router.delete("/", (req, res) => {
  const { id } = req.query;
  const token = req.header("Authorization");
  jwt.verify(token, secretKey, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const eventsRef = db.collection("events").doc(id);
    const eventToUpdate = await eventsRef.get();
    if (!eventToUpdate || !eventToUpdate.data) {
      return res.status(404).json({ message: `Event with ID ${id} not found` });
    }
    const response = await eventsRef.delete();
    res.json({ message: `Event with ID ${id} deleted` });
  });
});


module.exports = router;
