const express = require("express");
const router = express.Router();
const { login, signup, logout, forgotPassword, edit } = require("./controllers/user");

// Login route
router.post("/login", login);

// ForgotPassword route
router.put("/forgotPassword", forgotPassword)

// edit user
router.put("/", edit)

// Signup route
router.post("/signup", signup);

// Logout route
router.post("/logout", logout);

module.exports = router;
