
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With')

  next()
})

app.use(bodyParser.json());

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
    email: 'user1@example.com',
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
app.post('/api/user/login', (req, res) => {
  const { name, password } = req.body;
  const user = users.find((u) => u.name === name && u.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  //   const token = jwt.sign({ sub: user.id }, secretKey);
  const token = jwt.sign({ name }, secretKey, { expiresIn: '5h' });
  res.json({ token });
});

// app.post('/api/user/login', (req, res) => {
//     // Mock authentication logic
//     const { email, password } = req.body;
//     if (email === 'example@mail.com' && password === 'password') {
//       // Generate JWT token
//       const token = jwt.sign({ name }, secretKey, { expiresIn: '1h' });
//       res.json({ token });
//     } else {
//       res.status(401).json({ error: 'Invalid name or password' });
//     }
//   });

// Signup route
app.post('/api/user/signup', (req, res) => {
  const { email, password, name, isInCharge } = req.body;
  const user = { id: users.length + 1, email, password, name, isInCharge };
  users.push(user);
  res.json(user);
});

// Logout route
app.post('/api/user/logout', (req, res) => {
  // TODO
});

// Events route
// app.get('/api/events', (req, res) => {
//   const { start, end } = req.query;
//   let filteredEvents = events;
//   if (start) {
//     filteredEvents = events.filter((e) => e.date_start >= start);
//   }
//   if (end) {
//     filteredEvents = filteredEvents.filter((e) => e.date_end <= end);
//   }
//   res.json({ events: filteredEvents });
// });

app.get('/api/events', (req, res) => {
  const { start, end } = req.query;
  let filteredEvents = events;
  const user = jwt.verify(req.header('Authorization'), secretKey).name

  if (start) {
    filteredEvents = filteredEvents.filter((e) => e.date_start >= start && e.user == user);
  }
  if (end) {
    filteredEvents = filteredEvents.filter((e) => e.date_end <= end && e.user == user);
  }
  filteredEvents = filteredEvents.filter((e) => e.user == user);
  const token = req.header('Authorization');
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    res.json({ events: filteredEvents });
  });
});

app.post('/api/events', (req, res) => {
  const event = req.body;
  event.id = events.length + 1;
  const token = req.header('Authorization');
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    events.push(event);
    res.json(event);
  });
});

// Notes route
app.get('/api/notes', (req, res) => {
  let filteredNotes = notes;
  const token = req.header('Authorization');

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const user = decoded.name
    filteredNotes = filteredNotes.filter((e) => e.user == user);
    return res.json({ notes: filteredNotes });
  });
});

app.post('/api/notes', (req, res) => {
  const token = req.header('Authorization');
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    console.log(decoded)
  const note = req.body;
  note.id = notes.length + 1;
  notes.push(note);
  res.json(note);
  });

  // const token = req.header('Authorization');
  // jwt.verify(token, secretKey, (err, decoded) => {
  //   if (err) {
  //     return res.status(401).json({ message: 'Unauthorized' });
  //   }
  //   const note = req.body;
  //   note.id = notes.length + 1;
  //   notes.push(note);
  //   res.json(note);
  // });
});

app.put('/api/notes', (req, res) => {
  const { id } = req.query;
  const noteIndex = notes.findIndex((n) => n.id === Number(id));
  if (noteIndex === -1) {
    return res.status(404).json({ message: `Note with ID ${id} not found` });
  }
  const token = req.header('Authorization');
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const noteToUpdate = notes[noteIndex];
    noteToUpdate.name = req.body.name;
    noteToUpdate.content = req.body.content;

    notes[noteIndex] = noteToUpdate;

    res.json(noteToUpdate);
  });
});

app.delete('/api/notes', (req, res) => {
  const { id } = req.query;
  const token = req.header('Authorization');
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const noteIndex = notes.findIndex((n) => n.id === Number(id));
    if (noteIndex === -1) {
      return res.status(404).json({ message: `Note with ID ${id} not found` });
    }
    notes.splice(noteIndex, 1);
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