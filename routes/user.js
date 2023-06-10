const express = require("express");
const router = express.Router();
const { login, signup, logout } = require("./controllers/user");

// Login route
router.post("/login", login);

// Signup route
router.post("/signup", signup);

// Logout route
router.post("/logout", logout);

module.exports = router;
