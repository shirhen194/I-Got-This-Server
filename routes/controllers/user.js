const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const db = require("../handlers/firebase");
const secretKey = require("../handlers/jwt_key");

// Login controller
exports.login = async (req, res) => {
  const { email, password } = req.body;
  const usersRef = db.collection("users").doc(email);
  const user_get = await usersRef.get();
  if (user_get && user_get.data() && user_get.data().password === password) {
    const token = jwt.sign({ email }, secretKey, { expiresIn: "5h" });
    res.json({ user: user_get.data(), token: token });
  } else {
    res.status(401).json({ message: "Invalid email or password" });
  }
};

// Signup controller
exports.signup = async (req, res) => {
  const { email, password, name, isInCharge, homeAddress = "Not provided", contactNumber = "Not provided" } = req.body;
  console.log("address", homeAddress)
  const user = { id: uuidv4(), email, password, name, isInCharge, homeAddress, contactNumber };
  const usersRef = db.collection("users").doc(email);
  let user_get = await usersRef.get();
  if (user_get && user_get.data()) {
    return res.status(403).json({ message: "User Already Exists" });
  }
  user_get = await usersRef.set(user);
  if (user_get) {
    const token = jwt.sign({ email }, secretKey, { expiresIn: "5h" });
    res.json({ token });
  } else {
    res.status(500).json({ message: "Failed to create user" });
  }
};

// Logout controller
exports.logout = (req, res) => {
  // TODO: Implement logout functionality
  res.json({ message: "Logout route" });
};
