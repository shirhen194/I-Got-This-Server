const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 4005;

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With')
  
    next()
  })

app.use(bodyParser.json());

// Import routes
const userRoutes = require("./routes/user");
const eventRoutes = require("./routes/events");
const noteRoutes = require("./routes/notes");
const reminderRoutes = require("./routes/reminders");
const todoRoutes = require("./routes/todos");
const taskRoutes = require("./routes/tasks");
const notificationRoutes = require("./routes/notifications");


// Route middleware
app.use("/api/user", userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/todos", todoRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/notifications", notificationRoutes);


app.listen(port, () => console.log(`Server started on port ${port}`));
