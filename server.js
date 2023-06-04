const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 4005;

app.use(bodyParser.json());

// Import routes
const userRoutes = require("./routes/user");
const eventRoutes = require("./routes/events");
const noteRoutes = require("./routes/notes");
const reminderRoutes = require("./routes/reminders");
const todoRoutes = require("./routes/todos");
const taskRoutes = require("./routes/tasks");

// Route middleware
app.use("/api/user", userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/todos", todoRoutes);
app.use("/api/tasks", taskRoutes);

app.listen(port, () => console.log(`Server started on port ${port}`));
