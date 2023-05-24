
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
// const db = require('./firebase.js')
// const { getFirestore, collection} = require('firebase/firestore');

// const firebase = require('firebase/app');

// require('firebase/database'); // If using the Realtime Database
// require('firebase/firestore'); // If using Firestore

var admin = require("firebase-admin");

var serviceAccount = require("./i-got-this-1-firebase-adminsdk-ysq6p-63ce11191b.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://i-got-this-1-default-rtdb.firebaseio.com"
});
const db = admin.firestore();

const app = express();

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With')

  next()
})

app.use(bodyParser.json());
// const { books } = require('./handlers/books')
// app.get('/books', books);


// Mock users
const users = [
  {
    id: 1,
    email: 'user1@example.com',
    password: 'password1',
    name: 'User 1',
    isInCharge: false,
  },
  {
    id: 2,
    email: 'user2@example.com',
    password: 'password2',
    name: 'User 2',
    isInCharge: false,
  },
  {
    id: 3,
    email: 'user3@example.com',
    password: 's',
    name: 's',
    isInCharge: false,
  },
];

// Mock events
const events = [
  {
    id: 1,
    user: 'user2@example.com',
    date_start: '19-2-2023',
    date_end: '19-2-2023',
    time_start: '19:20',
    time_end: '20:20',
    notify_time_frame_minutes: 20,
    location: '',
    event_name: '',
    extraData: '',
  },
];

// Mock notes
const notes = [
  {
    id: 1,
    user: 's',
    name: 'ss',
    creationDate: 'ss',
    content: 'ss',
    audio: '',
  },
  {
    id: 2,
    user: 's',
    name: "note1",
    creationDate: "21/10/2222",
    content: "hey I just metu",
    audio: ""
  },
  {
    id: 3,
    user: 's',
    name: "note2",
    creationDate: "21/10/2222",
    content: "hey I just metu",
    audio: ""
  },
  {
    id: 4,
    user: 's',
    name: "note3",
    creationDate: "21/10/2222",
    content: "hey I just metu",
    audio: ""
  }
];

// Mock reminders
const reminders = [
  {
    date: '19-2-2023',
    Topic: '',
    extraData: '',
  },
];

// Secret key for JWT
const secretKey = 'secret';


// Login route
app.post('/api/user/login', async (req, res) => {
  const { email, password } = req.body;
  const usersRef = db.collection("users").doc(email);
  const user_get = await usersRef.get();
  if (user_get && user_get.data() && user_get.data().password === password) {
    const token = jwt.sign({ email }, secretKey, { expiresIn: '5h' });
    res.json({token});
  }
});

// Signup route
app.post('/api/user/signup', async (req, res) => {
  const { email, password, name, isInCharge } = req.body;
  console.log("email")
  console.log(email)
  const user = { id: uuidv4(), email, password, name, isInCharge };
  const usersRef = db.collection("users").doc(email);
  console.log("usersRef")
  console.log(usersRef)
  const user_get = await usersRef.set(user);
  if (user_get) {
    const token = jwt.sign({ email }, secretKey, { expiresIn: '5h' });
    res.json({token});
  }
});

// Logout route
app.post('/api/user/logout', (req, res) => {
  // TODO
});

// Events route
app.get('/api/events', (req, res) => {
  const { start, end } = req.query;
  const token = req.header('Authorization');
  jwt.verify(token, secretKey, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const user = decoded.email
    const eventsRef = db.collection("events")
    const eventsGet = await eventsRef.where('user', '==', user).get();
    let filteredEvents = eventsGet.docs.map(doc => doc.data());
    if (start) {
      filteredEvents = filteredEvents.filter((e) => e.date_start >= start && e.user == user);
    }
    if (end) {
      filteredEvents = filteredEvents.filter((e) => e.date_end <= end && e.user == user);
    }
    res.json({ events: filteredEvents });
  });
});

app.post('/api/events', async (req, res) => {
  const event = req.body;
  const token = req.header('Authorization');
  jwt.verify(token, secretKey, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const user = decoded.email
    event.user = user
    const eventsRef = db.collection("events")
    const eventsGet = await eventsRef.add(event);
    if(eventsGet && eventsGet.id){
      event.id = eventsGet.id;
    }
    res.json(event);
  });
});

// Notes route
app.get('/api/notes', async (req, res) => {
  const token = req.header('Authorization');
  jwt.verify(token, secretKey, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const notesRef = db.collection("notes");
    const user = decoded.email
    let notesGet = await notesRef.where('user', '==', user).get();
    notesGet =  notesGet.docs.map(doc => doc.data());
    return res.json({ notes: notesGet });
  });
});

app.post('/api/notes', async (req, res) => {
  const token = req.header('Authorization');
  jwt.verify(token, secretKey, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const note = req.body;
    const user = decoded.email
    note.user = user
    const notesRef = db.collection("notes")
    const notesGet = await notesRef.add(note);
    if(notesGet && notesGet.id){
      note.id = notesGet.id;
    }
    res.json(note);
  })
});

app.put('/api/notes', async (req, res) => {
  const { id } = req.query;
  const token = req.header('Authorization');
  jwt.verify(token, secretKey, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const notesRef = db.collection("notes").doc(id);
    const noteToUpdate = await notesRef.get();
    if (!noteToUpdate || !noteToUpdate.data) {
      return res.status(404).json({ message: `Note with ID ${id} not found` });
    }
    const res = await notesRef.update(req.body);
    res.json(res.data());
  });
});

app.delete('/api/notes', (req, res) => {
  const { id } = req.query;
  const token = req.header('Authorization');
  jwt.verify(token, secretKey, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const notesRef = db.collection("notes").doc(id);
    const noteToUpdate = await notesRef.get();
    if (!noteToUpdate || !noteToUpdate.data) {
      return res.status(404).json({ message: `Note with ID ${id} not found` });
    }
    const res = await notesRef.delete(req.body);
    res.json({ message: `Note with ID ${id} deleted` });
  });
});


// Reminders route
app.get('/api/reminders', (req, res) => {
  const { user_id, date } = req.query;
  let filteredReminders = reminders;
  if (user_id) {
    filteredReminders = reminders.filter((r) => r.user_id === user_id);
  }
  if (date) {
    filteredReminders = filteredReminders.filter((r) => r.date === date);
  }
  res.json({ reminders: filteredReminders });
});

app.post('/api/reminders', (req, res) => {
  const reminder = req.body;
  reminder.id = reminders.length + 1;
  reminders.push(reminder);
  res.json(reminder);
});

// Start the server
const port = process.env.PORT || 4005;
app.listen(port, () => console.log(`Server started on port ${port}`));