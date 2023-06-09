const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const db = require("../handlers/firebase");
const secretKey = require("../handlers/jwt_key");


// router.get("/", async (req, res) => {
//   const token = req.header("Authorization");
//   jwt.verify(token, secretKey, async (err, decoded) => {
//     if (err) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }
//     const notesRef = db.collection("notes");
//     const user = decoded.email;
//     let notesGet = await notesRef.where("user", "==", user).get();
//     notesGet = notesGet.docs.map((doc) => doc.data());
//     return res.json({ notes: notesGet });
//   });
// });

// router.post("/schedule-notification", (req, res) => {
//   const { token, scheduleTime, message } = req.body;

//   // Schedule the notification based on the provided time
//   // You can use a task scheduler or a cron job library here

//   // Example using node-cron library
//   const cron = require("node-cron");
//   const task = cron.schedule(scheduleTime, async () => {
//     try {
//       // Send the notification to the device using Firebase Admin SDK
//       await admin.messaging().send({
//         token,
//         notification: {
//           title: "Scheduled Notification",
//           body: message,
//         },
//       });

//       console.log("Notification sent!");
//     } catch (error) {
//       console.error("Error sending notification:", error);
//     }
//   });

//   res.send("Notification scheduled successfully!");
// });

// router.put("/", async (req, res) => {
//   const { id } = req.query;
//   const token = req.header("Authorization");
//   jwt.verify(token, secretKey, async (err, decoded) => {
//     if (err) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }
//     const notesRef = db.collection("notes").doc(id);
//     const noteToUpdate = await notesRef.get();
//     if (!noteToUpdate || !noteToUpdate.data) {
//       return res.status(404).json({ message: `Note with ID ${id} not found` });
//     }
//     const response = await notesRef.update(req.body);
//     res.json(response.data());
//   });
// });

// router.delete("/", (req, res) => {
//   const { id } = req.query;
//   const token = req.header("Authorization");
//   jwt.verify(token, secretKey, async (err, decoded) => {
//     if (err) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }
//     const notesRef = db.collection("notes").doc(id);
//     const noteToUpdate = await notesRef.get();
//     if (!noteToUpdate || !noteToUpdate.data) {
//       return res.status(404).json({ message: `Note with ID ${id} not found` });
//     }
//     const response = await notesRef.delete(req.body);
//     res.json({ message: `Note with ID ${id} deleted` });
//   });
// });


module.exports = router;
