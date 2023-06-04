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

function convertToList(text) {
  // Split the text into separate lines
  const list = text.split("\n");
  return list;
}

function generatePromptTasksBeforeEvent(eventTitle, eventContent) {
  return `As someone experiencing significant memory difficulties,
 I require your assistance in preparing for an upcoming event ${eventTitle}, ${eventContent}.
  Please provide me with a concise list of four straightforward tasks to complete at home before leaving for the meeting. 
  Please avoid providing explanations for each task and refrain from including tasks directly related to the specific event.`;
}

async function getTasksBeforeEvent(eventTitle, eventContent) {
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: generatePromptTasksBeforeEvent(eventTitle, eventContent),
    max_tokens: 2000,
    temperature: 0.6,
  });
  const completion = response.data.choices[0].text;
  console.log("completion ", completion);
  return completion;
}

app.post("/api/events", async (req, res) => {
  const event = req.body;
  const token = req.header("Authorization");
  jwt.verify(token, secretKey, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = decoded.email;
    event.user = user;

    const tasks = await getTasksBeforeEvent(event.event_name, event.extraData);
    event.tasks = convertToList(tasks);
    const eventsRef = db.collection("events");
    const eventsGet = await eventsRef.add(event);
    if (eventsGet && eventsGet.id) {
      event.id = eventsGet.id;
    }
    res.json(event);
  });
});

module.exports = router;
