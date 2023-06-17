// notes.js
const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const db = require("./handlers/firebase");
const secretKey = require("./handlers/jwt_key");


router.get("/", async (req, res) => {
  const token = req.header("Authorization");
  jwt.verify(token, secretKey, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const notesRef = db.collection("notes");
    const user = decoded.email;
    let notesGet = await notesRef.where("user", "==", user).get();
    notesGet = notesGet.docs.map((doc) => doc.data());
    return res.json({ notes: notesGet });
  });
});

router.post("/", async (req, res) => {
  const token = req.header("Authorization");
  jwt.verify(token, secretKey, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const note = req.body;
    const user = decoded.email;
    note.user = user;
    const notesRef = db.collection("notes");
    const notesGet = await notesRef.add(note);
    if (notesGet && notesGet.id) {
      note.id = notesGet.id;
    } else {
      return res.status(404).json({ message: `Note not added` });
    }
    const noteId = notesGet.id
    const noteToUpdateRef = notesRef.doc(noteId);
    const response = await noteToUpdateRef.update({id:noteId});
    res.json(note);
  });
});

router.put("/", async (req, res) => {
  const { id } = req.query;
  const token = req.header("Authorization");
  jwt.verify(token, secretKey, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const notesRef = db.collection("notes").doc(id);
    const noteToUpdate = await notesRef.get();
    if (!noteToUpdate || !noteToUpdate.data()) {
      return res.status(404).json({ message: `Note with ID ${id} not found` });
    }
    const response = await notesRef.update(req.body);
    res.json({...noteToUpdate.data(), ...req.body});
  });
});

router.delete("/", (req, res) => {
  const { id } = req.query;
  const token = req.header("Authorization");
  jwt.verify(token, secretKey, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const notesRef = db.collection("notes").doc(id);
    const noteToUpdate = await notesRef.get();
    if (!noteToUpdate || !noteToUpdate.data) {
      return res.status(404).json({ message: `Note with ID ${id} not found` });
    }
    const response = await notesRef.delete(req.body);
    res.json({ message: `Note with ID ${id} deleted` });
  });
});


module.exports = router;
