// events.js
const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const db = require("../handlers/firebase");
const secretKey = require("../handlers/jwt_key");
const openai = require("../handlers/openAi");

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

// function convertToList(text) {
//   // Split the text into separate lines
//   const list = text.split("\n");
//   return list;
// }

function convertStringToTasks(str) {
  const lines = str.split('\n'); // Split the string by newline characters
  const tasks = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim(); // Remove leading/trailing whitespaces

    if (line.length > 0) {
      // Ignore empty lines
      const taskNumberMatch = line.match(/^\d+\./); // Check if the line starts with a number followed by a dot

      if (taskNumberMatch) {
        const content = line.slice(taskNumberMatch[0].length).trim(); // Extract the content after the task number
        const task = {
          content,
          isDone: false,
        };
        tasks.push(task);
      }
    }
  }
  console.log("completion ", tasks);
  return tasks;
};

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

router.put("/", async (req, res) => {
  const { id } = req.query;
  const token = req.header("Authorization");
  jwt.verify(token, secretKey, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const eventRef = db.collection("events").doc(id);
    console.log("eventRef ", eventRef);
    const eventToUpdate = await eventRef.get();
    console.log("eventToUpdate ", eventToUpdate);
    if (!eventToUpdate || !eventToUpdate.data) {
      return res.status(404).json({ message: `Event with ID ${id} not found` });
    }
    const response = await eventRef.update(req.body);
    console.log("response ", response);
    res.json(response);
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
    } else {
      return res.status(404).json({ message: `Event not added` });
    }
    const eventId = eventsGet.id
    const eventToUpdateRef = eventsRef.doc(eventId);
    const response = await eventToUpdateRef.update({id:eventId});
    res.json(event);
  });
});
router.put("/addTasks", async (req, res) => {
  console.log("addTasks");
  const { id } = req.query;
  const token = req.header("Authorization");
  jwt.verify(token, secretKey, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const eventRef = db.collection("events").doc(id);
    const eventToUpdate = await eventRef.get();
    if (!eventToUpdate || !eventToUpdate.data) {
      return res.status(404).json({ message: `Event with ID ${id} not found` });
    }
    const event = eventToUpdate.data();
    const tasks = await getTasksBeforeEvent(event.title, event.content);
    event.tasks = convertStringToTasks(tasks);
    console.log("here ");

    const response = await eventRef.update(event);
    res.json(tasks);
  });
});

router.delete("/", (req, res) => {
  const { id } = req.query;
  const token = req.header("Authorization");
  jwt.verify(token, secretKey, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const eventRef = db.collection("events").doc(id);
    const eventToUpdate = await eventRef.get();
    if (!eventToUpdate || !eventToUpdate.data) {
      return res.status(404).json({ message: `Event with ID ${id} not found` });
    }
    const response = await eventRef.delete(req.body);
    res.json({ message: `Event with ID ${id} deleted` });
  });
});


module.exports = router;
