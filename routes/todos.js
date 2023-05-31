// todos.js
const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const db = require("../handlers/firebase");
const secretKey = require("../handlers/jwt_key");


router.get("/", async (req, res) => {
  const token = req.header("Authorization");
  jwt.verify(token, secretKey, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const todoRef = db.collection("todo");
    const user = decoded.email;
    let todosGet = await todoRef.where("user", "==", user).get();
    todos = todosGet.docs.map((doc) => doc.data());
    return res.json({ todos });
  });
});

router.post("/", async (req, res) => {
  const token = req.header("Authorization");
  jwt.verify(token, secretKey, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const todo = req.body;
    const user = decoded.email;
    todo.user = user;
    const todosRef = db.collection("todo");
    const todosGet = await todosRef.add(todo);
    if (todosGet && todosGet.id) {
      todo.id = todosGet.id;
    }
    res.json(todo);
  });
});

router.put("/", async (req, res) => {
  const { id } = req.query;
  const token = req.header("Authorization");
  jwt.verify(token, secretKey, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const todosRef = db.collection("todo").doc(id);
    const todoToUpdate = await todosRef.get();
    if (!todoToUpdate || !todoToUpdate.data) {
      return res.status(404).json({ message: `Todo with ID ${id} not found` });
    }
    const response = await todosRef.update(req.body);
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
    const todosRef = db.collection("todo").doc(id);
    const todoToUpdate = await todosRef.get();
    if (!todoToUpdate || !todoToUpdate.data) {
      return res.status(404).json({ message: `Todo with ID ${id} not found` });
    }
    const response = await todosRef.delete(req.body);
    res.json({ message: `Todo with ID ${id} deleted` });
  });
});

module.exports = router;
