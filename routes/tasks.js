// todos.js
const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const secretKey = require("./handlers/jwt_key");
const openai = require("./handlers/openAiConfig.js");

// speech to rext
const fs = require("fs");
router.use(express.json());

function generatePrompt(text) {
    return ` Extract tasks from the following text and return the tasks as a java script list:  ${text}`;
}

router.post("/extract-task", async (req, res) => {
  console.log("extract task");
    const token = req.header("Authorization");
    const { text } = req.body;
    jwt.verify(token, secretKey, async (err, decoded) => {
        if (err) {
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
            return res.status(200).json({
                success: true,
                message: completion,
            });
        } catch (error) {
            console.log(error.message);
        }
    });
});

// Helper function to convert an audio file from URI to ArrayBuffer
function convertAudioToBuffer(uri) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', uri, true);
      xhr.responseType = 'arraybuffer';
  
      xhr.onload = function () {
        if (xhr.status === 200) {
          resolve(xhr.response);
        } else {
          reject(new Error('Failed to load audio file'));
        }
      };
  
      xhr.onerror = function () {
        reject(new Error('Failed to load audio file'));
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
  
    const mergedMp3Data = new Uint8Array(mp3Data.reduce((acc, chunk) => acc.concat(chunk), []));
    return mergedMp3Data.buffer;
  }
  
  // Convert audio file from URI to MP3
  function convertToMp3(uri) {
    convertAudioToBuffer(uri)
      .then((audioBuffer) => {
        const mp3Buffer = encodeToMp3(audioBuffer);
        const mp3Blob = new Blob([mp3Buffer], { type: 'audio/mp3' });
  
        // Use the mp3Blob as needed (e.g., download it or send it to the server)
        // For example, to download the converted file:
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(mp3Blob);
        downloadLink.download = 'converted.mp3';
        downloadLink.click();
      })
      .catch((error) => {
        console.error('Failed to convert audio to MP3:', error);
      });
  }

  

router.post("/speech-to-text", async (req, res) => {
  console.log ("hiiiiiiii");
    const token = req.header("Authorization");
    const { path_to_audio_uri } = req.body;
    console.log("path_to_audio_uri ", path_to_audio_uri);
    const path_to_audio = convertToMp3(path_to_audio_uri);
    console.log("path_to_audio ", path_to_audio);
    jwt.verify(token, secretKey, async (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        try {
            if (path_to_audio == null) {
                throw new Error("Missing path_to_audio in request body");
            }
            const response = await openai.createTranscription(
                fs.createReadStream(path_to_audio),
                "whisper-1"
            );
            const transcript = response.data.text;
            return res.status(200).json({
                success: true,
                message: transcript,
            });
        } catch (error) {
            console.log(error.message);
        }
    });
});


module.exports = router;
