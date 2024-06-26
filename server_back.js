// const express = require("express");
// const bodyParser = require("body-parser");
// const jwt = require("jsonwebtoken");
// const { v4: uuidv4 } = require("uuid");

// var admin = require("firebase-admin");

// var serviceAccount = require("./i-got-this-1-firebase-adminsdk-ysq6p-63ce11191b.json");

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: "https://i-got-this-1-default-rtdb.firebaseio.com",
// });
// const db = admin.firestore();

// const app = express();

// app.use(function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Content-Type, Authorization, Content-Length, X-Requested-With"
//   );

//   next();
// });

// app.use(bodyParser.json());


// // Login route
// app.post("/api/user/login", async (req, res) => {
//   const { email, password } = req.body;
//   const usersRef = db.collection("users").doc(email);
//   const user_get = await usersRef.get();
//   if (user_get && user_get.data() && user_get.data().password === password) {
//     const token = jwt.sign({ email }, secretKey, { expiresIn: "5h" });
//     res.json({ token });
//   }
// });

// // Signup route
// app.post("/api/user/signup", async (req, res) => {
//   const { email, password, name, isInCharge } = req.body;
//   console.log("email");
//   console.log(email);
//   const user = { id: uuidv4(), email, password, name, isInCharge };
//   const usersRef = db.collection("users").doc(email);
//   console.log("usersRef");
//   console.log(usersRef);
//   const user_get = await usersRef.set(user);
//   if (user_get) {
//     const token = jwt.sign({ email }, secretKey, { expiresIn: "5h" });
//     res.json({ token });
//   }
// });

// // Logout route
// app.post("/api/user/logout", (req, res) => {
//   // TODO
// });

// // Events route
// app.get("/api/events", (req, res) => {
//   const { start, end } = req.query;
//   const token = req.header("Authorization");
//   jwt.verify(token, secretKey, async (err, decoded) => {
//     if (err) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }
//     const user = decoded.email;
//     const eventsRef = db.collection("events");
//     const eventsGet = await eventsRef.where("user", "==", user).get();
//     let filteredEvents = eventsGet.docs.map((doc) => doc.data());
//     if (start) {
//       filteredEvents = filteredEvents.filter(
//         (e) => e.date_start >= start && e.user == user
//       );
//     }
//     if (end) {
//       filteredEvents = filteredEvents.filter(
//         (e) => e.date_end <= end && e.user == user
//       );
//     }
//     res.json({ events: filteredEvents });
//   });
// });

// app.post("/api/events", async (req, res) => {
//   const event = req.body;
//   const token = req.header("Authorization");
//   jwt.verify(token, secretKey, async (err, decoded) => {
//     if (err) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }
//     const user = decoded.email;
//     event.user = user;
//     const eventsRef = db.collection("events");
//     const eventsGet = await eventsRef.add(event);
//     if (eventsGet && eventsGet.id) {
//       event.id = eventsGet.id;
//     }
//     res.json(event);
//   });
// });

// // Notes route
// app.get("/api/notes", async (req, res) => {
//   const token = req.header("Authorization");
//   jwt.verify(token, secretKey, async (err, decoded) => {
//     if (err) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }
//     const notesRef = db.collection("notes");
//     const user = decoded.email;
//     let notesGet = await notesRef.where("user", "==", user).get();
//     notesGet = notesGet.docs.map((doc) => doc.data());
//     return res.json({ notes: notesGet });
//   });
// });

// app.post("/api/notes", async (req, res) => {
//   const token = req.header("Authorization");
//   jwt.verify(token, secretKey, async (err, decoded) => {
//     if (err) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }
//     const note = req.body;
//     const user = decoded.email;
//     note.user = user;
//     const notesRef = db.collection("notes");
//     const notesGet = await notesRef.add(note);
//     if (notesGet && notesGet.id) {
//       note.id = notesGet.id;
//     }
//     res.json(note);
//   });
// });

// app.put("/api/notes", async (req, res) => {
//   const { id } = req.query;
//   const token = req.header("Authorization");
//   jwt.verify(token, secretKey, async (err, decoded) => {
//     if (err) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }
//     const notesRef = db.collection("notes").doc(id);
//     const noteToUpdate = await notesRef.get();
//     if (!noteToUpdate || !noteToUpdate.data) {
//       return res.status(404).json({ message: `Note with ID ${id} not found` });
//     }
//     const response = await notesRef.update(req.body);
//     res.json(response.data());
//   });
// });

// app.delete("/api/notes", (req, res) => {
//   const { id } = req.query;
//   const token = req.header("Authorization");
//   jwt.verify(token, secretKey, async (err, decoded) => {
//     if (err) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }
//     const notesRef = db.collection("notes").doc(id);
//     const noteToUpdate = await notesRef.get();
//     if (!noteToUpdate || !noteToUpdate.data) {
//       return res.status(404).json({ message: `Note with ID ${id} not found` });
//     }
//     const response = await notesRef.delete(req.body);
//     res.json({ message: `Note with ID ${id} deleted` });
//   });
// });


// // Reminders route
// app.get("/api/reminders", (req, res) => {
//   const { user_id, date } = req.query;
//   let filteredReminders = reminders;
//   if (user_id) {
//     filteredReminders = reminders.filter((r) => r.user_id === user_id);
//   }
//   if (date) {
//     filteredReminders = filteredReminders.filter((r) => r.date === date);
//   }
//   res.json({ reminders: filteredReminders });
// });

// app.post("/api/reminders", (req, res) => {
//   const reminder = req.body;
//   reminder.id = reminders.length + 1;
//   reminders.push(reminder);
//   res.json(reminder);
// });

// // Todo route
// app.get("/api/todos", async (req, res) => {
//   const token = req.header("Authorization");
//   jwt.verify(token, secretKey, async (err, decoded) => {
//     if (err) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }
//     const todoRef = db.collection("todo");
//     const user = decoded.email;
//     let todosGet = await todoRef.where("user", "==", user).get();
//     todos = todosGet.docs.map((doc) => doc.data());
//     return res.json({ todos });
//   });
// });

// app.post("/api/todos", async (req, res) => {
//   const token = req.header("Authorization");
//   jwt.verify(token, secretKey, async (err, decoded) => {
//     if (err) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }
//     const todo = req.body;
//     const user = decoded.email;
//     todo.user = user;
//     const todosRef = db.collection("todo");
//     const todosGet = await todosRef.add(todo);
//     if (todosGet && todosGet.id) {
//       todo.id = todosGet.id;
//     }
//     res.json(todo);
//   });
// });

// // Get Tasks From Text Using OpenAI API
// const { Configuration, OpenAIApi } = require("openai");

// const OPENAI_API_KEY = "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";

// const configuration = new Configuration({
//   //get SECRET_KEY from env variable,
//   apiKey: OPENAI_API_KEY,
// });

// const openai = new OpenAIApi(configuration);


// app.use(express.json());

// app.post("/extract-task", async (req, res) => {
//   const token = req.header("Authorization");
//   const { text } = req.body;
//   jwt.verify(token, secretKey, async (err, decoded) => {
//     if (err) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }
//     try {
//       if (text == null) {
//         throw new Error("Uh oh, no prompt was provided");
//       }
//       console.log("text ", text);
//       const response = await openai.createCompletion({
//         model: "text-davinci-003",
//         prompt: generatePrompt(text),
//         max_tokens: 2000,
//         temperature: 0.6,
//       });
//       const completion = response.data.choices[0].text;
//       console.log("completion ", completion);
//       /**
//        * // convert completion to list (complection = ["task1", "task2"])
//       const tasks_list = JSON.parse(completion);
//       for (let i = 0; i < tasks_list.length; i++) {
//         const task = tasks_list[i];
//         console.log("task ", task);
//         // add task to db
//       }
//        * 
//        */
      
//       return res.status(200).json({
//         success: true,
//         message: completion,
//       });
//     } catch (error) {
//       console.log(error.message);
//     }
//   });
// });

// function generatePrompt(text) {
//   return ` Extract tasks from the following text and return the tasks as a java script list:  ${text}`;
// }

// // speech to rext
// const fs = require("fs");
// app.post("/speech-to-text", async (req, res) => {
//   const token = req.header("Authorization");
//   const { path_to_audio } = req.body;
//   jwt.verify(token, secretKey, async (err, decoded) => {
//     if (err) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }
//     try {
//       if (path_to_audio == null) {
//         throw new Error("Missing path_to_audio in request body");
//       }
//       const response = await openai.createTranscription(
//         fs.createReadStream(path_to_audio),
//         "whisper-1"
//       );
//       const transcript = response.data.text;
//       return res.status(200).json({
//         success: true,
//         message: transcript,
//       });
//     } catch (error) {
//       console.log(error.message);
//     }
//   });
// });

// app.put("/api/todos", async (req, res) => {
//   const { id } = req.query;
//   const token = req.header("Authorization");
//   jwt.verify(token, secretKey, async (err, decoded) => {
//     if (err) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }
//     const todosRef = db.collection("todo").doc(id);
//     const todoToUpdate = await todosRef.get();
//     if (!todoToUpdate || !todoToUpdate.data) {
//       return res.status(404).json({ message: `Todo with ID ${id} not found` });
//     }
//     const response = await todosRef.update(req.body);
//     res.json(response.data());
//   });
// });

// app.delete("/api/todos", (req, res) => {
//   const { id } = req.query;
//   const token = req.header("Authorization");
//   jwt.verify(token, secretKey, async (err, decoded) => {
//     if (err) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }
//     const todosRef = db.collection("todo").doc(id);
//     const todoToUpdate = await todosRef.get();
//     if (!todoToUpdate || !todoToUpdate.data) {
//       return res.status(404).json({ message: `Todo with ID ${id} not found` });
//     }
//     const response = await todosRef.delete(req.body);
//     res.json({ message: `Todo with ID ${id} deleted` });
//   });
// });

// // Start the server
// const port = process.env.PORT || 4005;
// app.listen(port, () => console.log(`Server started on port ${port}`));
