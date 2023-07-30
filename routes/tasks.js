// todos.js
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const fse = require("fs-extra");
const jwt = require("jsonwebtoken");
const router = express.Router();
const secretKey = require("./handlers/jwt_key");
const openai = require("./handlers/openAiConfig.js");
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');

// Set up the storage location for uploaded audio files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// Set up the multer middleware with the storage configuration
const upload = multer({ storage: storage });
// speech to rext
router.use(express.json());

function generatePrompt(text) {
  return ` Extract tasks from the following text and return the tasks as a javascript list: ${text}`;
}


router.post("/extract-task", async (req, res) => {
  console.log("extract task");
  const token = req.header("Authorization");
  const text = req.body["text"];
  jwt.verify(token, secretKey, async (err, decoded) => {
    if (err) {
      console.log("err ", err);
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      if (text == null) {
        throw new Error("Uh oh, no prompt was provided");
      }
      const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: generatePrompt(text),
        max_tokens: 2000,
        temperature: 0.6,
      });
      const completion = response.data.choices[0].text;
      res.json(completion);
    } catch (error) {
      console.log(error.message);
    }
  });
});


router.post("/speech-to-text", upload.single("audio"), async (req, res) => {
  console.log("speech to text");
  try {
    let path_to_audio = req.file.path;
    console.log("path_to_audio ", path_to_audio);
    const transcript = await openai.createTranscription(
      fs.createReadStream(path_to_audio),
      model="whisper-1",
      language='English',
    );
    const text = transcript.data.text;
    console.log(text);
    const response_tasks = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: generatePrompt(text),
      max_tokens: 2000,
      temperature: 0.6,
    });
    console.log("response ", response_tasks);
    const completion = response_tasks.data.choices[0].text;
    console.log("completion ", completion);
    res.json(completion);
  } catch (error) {
    console.error("Error processing audio:", error);
    res.status(500).json({ error: "Error processing audio" });
  }
});

module.exports = router;
