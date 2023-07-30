const { Strings } = require( "./../consts");
const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const db = require("./handlers/firebase");
const secretKey = require("./handlers/jwt_key");
const { DB_COLLECTION_NOTIFICATIONS } = Strings;

router.get("/", async (req, res) => {
    const { id } = req.query;
    const token = req.header("Authorization");
    jwt.verify(token, secretKey, async (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const notificationsGet = db.collection(DB_COLLECTION_NOTIFICATIONS).where('eventId', '==', id);
        notificationsGet = notificationsGet.docs.map((doc) => doc.data());
        return res.json(notificationsGet[0]);
    });
});

router.post("/", async (req, res) => {
    const notification = req.body;
    const token = req.header("Authorization");
    jwt.verify(token, secretKey, async (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const user = decoded.email;
        notification.user = user;
        const notificationsRef = db.collection(DB_COLLECTION_NOTIFICATIONS).doc(notification.id);
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
        const notificationsRef = db.collection(DB_COLLECTION_NOTIFICATIONS).doc(id);
        const notificationToUpdate = await notificationsRef.get();
        if (!notificationToUpdate || !notificationToUpdate.data()) {
            return res.status(404).json({ message: `Notification with ID ${id} not found` });
        }
        const response = await notificationsRef.update(req.body);
        res.json({...notificationToUpdate.data(), ...req.body});
    });
});

router.delete("/", (req, res) => {
    const { id } = req.query;
    const token = req.header("Authorization");
    jwt.verify(token, secretKey, async (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const notificationsRef = db.collection(DB_COLLECTION_NOTIFICATIONS).doc(id);
        const notificationToUpdate = await notificationsRef.get();
        if (!notificationToUpdate || !notificationToUpdate.data) {
          return res.status(404).json({ message: `Notification with EVENT ID ${id} not found` });
        }
        const response = await notificationsRef.delete();
        res.json({ message: `Notification with EVENT ID ${id} deleted` });
    });
});

module.exports = router;
