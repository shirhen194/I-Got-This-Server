const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const app = express();

app.use(bodyParser.json());

const SECRET_KEY = 'your-secret-key';

// Mock user data for authentication
const mockUsers = [
  {
    id: 1,
    email: 'testuser1@test.com',
    password: 'testpassword1',
    name: 'Test User 1',
    is_in_Charge: true
  },
  {
    id: 2,
    email: 'testuser2@test.com',
    password: 'testpassword2',
    name: 'Test User 2',
    is_in_Charge: false
  }
];

// Mock event data
const mockEvents = [
  {
    id: 1,
    date_start: '19-2-2023',
    date_end: '19-2-2023',
    time_start: '19:20',
    time_end: '20:20',
    notify_time_frame: 20,
    location: '',
    event_name: 'Test Event 1',
    extraData: ''
  },
  {
    id: 2,
    date_start: '20-2-2023',
    date_end: '20-2-2023',
    time_start: '19:30',
    time_end: '20:30',
    notify_time_frame: 30,
    location: '',
    event_name: 'Test Event 2',
    extraData: ''
  }
];

// Mock notes data
const mockNotes = [
  {
    id: 1,
    name: 'Test Note 1',
    Creation_date: '2023-04-05T11:45:00Z',
    text: 'This is a test note.',
    audio: ''
  },
  {
    id: 2,
    name: 'Test Note 2',
    Creation_date: '2023-04-05T12:00:00Z',
    text: '',
    audio: 'https://test-audio-url.com'
  }
];

// Mock reminders data
const mockReminders = [
  {
    date: '19-2-2023',
    Topic: 'Test Reminder 1',
    extraData: ''
  },
  {
    date: '20-2-2023',
    Topic: 'Test Reminder 2',
    extraData: ''
  }
];

// Login route
app.post('/api/user/login', (req, res) => {
  const { email, password } = req.body;
  const user = mockUsers.find(user => user.email === email && user.password === password);

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id }, SECRET_KEY);
  return res.status(200).json({ user, token});
});

// Signup route
app.post('/api/user/signup', (req, res) => {
  const { email, password, name, is_in_Charge } = req.body;

  // Add new user to mockUsers array
  const newUser = {
    id: mockUsers.length + 1,
    email,
    password,
    name,
    is_in_Charge
  };
  mockUsers.push(newUser);

  return res.status(200).json({ message: 'Signup successful' });
});

// Logout route
app.post('/api/user/logout', (req, res) => {
  // TODO: Implement logout functionality
  return res.status(200).json({ message: 'Logout successful' });
});
