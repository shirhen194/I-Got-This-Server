const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const db = require("./handlers/firebase");
const secretKey = require("./handlers/jwt_key");


router.get("/", async (req, res) => {
    const { id } = req.query;
    const token = req.header("Authorization");
    jwt.verify(token, secretKey, async (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const notificationsGet = db.collection('notifications').where('eventId', '==', id);
        notificationsGet = notificationsGet.docs.map((doc) => doc.data());
        return res.json(notificationsGet[0]);
    });
});

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



router.post("/", async (req, res) => {
    const notification = req.body;
    const token = req.header("Authorization");
    jwt.verify(token, secretKey, async (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const user = decoded.email;
        notification.user = user;
        const notificationsRef = db.collection("notifications").doc(notification.id);
        const notification_get = await notificationsRef.set(notification);
        if (notification_get) {
            res.json(notification);
        } else {
            return res.status(404).json({ message: `Notification not added` });
        }
    });
});

router.put("/", async (req, res) => {
    const { id } = req.query;
    const token = req.header("Authorization");
    jwt.verify(token, secretKey, async (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const notificationsRef = db.collection("notifications").doc(id);
        const notificationToUpdate = await notificationsRef.get();
        if (!notificationToUpdate || !notificationToUpdate.data) {
            return res.status(404).json({ message: `Notification with ID ${id} not found` });
        }
        const response = await notificationsRef.update(req.body);
        res.json(response.data());
    });
});

router.delete("/", (req, res) => {
    const { id } = req.query;
    const token = req.header("Authorization");
    jwt.verify(token, secretKey, async (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const notificationsRef = db.collection("notifications").doc(id);
        const notificationToUpdate = await notificationsRef.get();
        if (!notificationToUpdate || !notificationToUpdate.data) {
          return res.status(404).json({ message: `Notification with EVENT ID ${id} not found` });
        }
        const response = await notificationsRef.delete();
        res.json({ message: `Notification with EVENT ID ${id} deleted` });
    });
});


module.exports = router;
