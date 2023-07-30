const { Strings } = require( "./../../consts");

const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const db = require("../handlers/firebase");
const secretKey = require("../handlers/jwt_key");
const { DB_COLLECTION_USERS } = Strings;

// Login controller
exports.login = async (req, res) => {
  const { email, password } = req.body;
  const usersRef = db.collection(DB_COLLECTION_USERS).doc(email);
  const user_get = await usersRef.get();
  if (user_get && user_get.data() && user_get.data().password === password) {
    const token = jwt.sign({ email }, secretKey);
    res.json({ user: user_get.data(), token: token });
  } else {
    res.status(401).json({ message: "Invalid email or password" });
  }
};

//Forgot password- edit user
exports.forgotPassword = async (req, res) => {
    const { email } = req.query;
    const {name, password } = req.body;
    const usersRef = db.collection(DB_COLLECTION_USERS).doc(email);
    const user_get = await usersRef.get();
    if (user_get && user_get.data() && user_get.data().name === name) {
      const response = await usersRef.update({password})
      const token = jwt.sign({ email }, secretKey);
      res.json({ user: {...user_get.data(), ...req.body}, token: token });
    } else{
      res.status(401).json({message: "Invalid email or user name"});
    }
}

  // edit user
  exports.edit = async (req, res) => {
    const { email } = req.query;
    const token = req.header("Authorization");
    jwt.verify(token, secretKey, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Unauthorized" });
      }
    const usersRef = db.collection(DB_COLLECTION_USERS).doc(email);
    const user_get = await usersRef.get();
    if (!user_get || !user_get.data()) {
      return res.status(404).json({ message: `User with email ${email} not found` });
    }
    const response = await usersRef.update(req.body);
    res.json({...user_get.data(), ...req.body});
  });
}


// Signup controller
exports.signup = async (req, res) => {
  const { email, password, name, isInCharge, homeAddress = "Not provided", contactNumber = "Not provided" } = req.body;
  const user = { id: uuidv4(), email, password, name, isInCharge, homeAddress, contactNumber };
  const usersRef = db.collection(DB_COLLECTION_USERS).doc(email);
  let user_get = await usersRef.get();
  if (user_get && user_get.data()) {
    return res.status(403).json({ message: "User Already Exists" });
  }
  user_get = await usersRef.set(user);
  if (user_get) {
    const token = jwt.sign({ email }, secretKey);
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
