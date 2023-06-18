const admin = require("firebase-admin");
var serviceAccount = require("./i-got-this-1-firebase-adminsdk-ysq6p-63ce11191b.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://i-got-this-1-default-rtdb.firebaseio.com",
});
const db = admin.firestore();
module.exports =  db; //export the app