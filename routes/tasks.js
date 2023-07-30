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


function convertToMp3(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    const readableStream = fs.createReadStream(inputPath);
    const outputStream = fs.createWriteStream(outputPath);

    readableStream.on('error', (error) => {
      reject('Error reading the input file: ' + error.message);
    });

    outputStream.on('error', (error) => {
      reject('Error writing the output file: ' + error.message);
    });

    outputStream.on('finish', () => {
      console.log('Conversion complete.');
      resolve();
    });

    ffmpeg()
      .input(readableStream)
      .audioCodec('libmp3lame')
      .output(outputStream)
      .on('start', (commandLine) => {
        console.log('Spawned ffmpeg with command: ' + commandLine);
      })
      .on('error', (err) => {
        reject('An error occurred during conversion: ' + err.message);
      })
      .run();
  });
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

// Helper function to convert an audio file from URI to ArrayBuffer
function convertAudioToBuffer(uri) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", uri, true);
    xhr.responseType = "arraybuffer";

    xhr.onload = function () {
      if (xhr.status === 200) {
        resolve(xhr.response);
      } else {
        reject(new Error("Failed to load audio file"));
      }
    };

    xhr.onerror = function () {
      reject(new Error("Failed to load audio file"));
    };

    xhr.send();
  });
}

// Helper function to encode an ArrayBuffer to MP3
function encodeToMp3(buffer) {
  const mp3Encoder = new lamejs.Mp3Encoder(1, 44100, 128);
  const samples = new Int16Array(buffer);
  const sampleBlockSize = 1152;
  const mp3Data = [];

  for (let i = 0; i < samples.length; i += sampleBlockSize) {
    const left = samples.subarray(i, i + sampleBlockSize);
    const mp3buf = mp3Encoder.encodeBuffer(left);
    if (mp3buf.length > 0) {
      mp3Data.push(mp3buf);
    }
  }

  const mp3buf = mp3Encoder.flush();
  if (mp3buf.length > 0) {
    mp3Data.push(mp3buf);
  }

  const mergedMp3Data = new Uint8Array(
    mp3Data.reduce((acc, chunk) => acc.concat(chunk), [])
  );
  return mergedMp3Data.buffer;
}

// Convert audio file from URI to MP3
function convertToMp3(uri) {
  convertAudioToBuffer(uri)
    .then((audioBuffer) => {
      const mp3Buffer = encodeToMp3(audioBuffer);
      const mp3Blob = new Blob([mp3Buffer], { type: "audio/mp3" });

      // Use the mp3Blob as needed (e.g., download it or send it to the server)
      // For example, to download the converted file:
      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(mp3Blob);
      downloadLink.download = "converted.mp3";
      downloadLink.click();
    })
    .catch((error) => {
      console.error("Failed to convert audio to MP3:", error);
    });
}

module.exports = router;
