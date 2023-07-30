const express = require("express");
const { login, signup, logout, forgotPassword, edit } = require("./controllers/user");
const router = express.Router();

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
