// todos.js
const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const secretKey = require("../handlers/jwt_key");
const openai = require("../handlers/openAi");

// speech to rext
const fs = require("fs");
router.use(express.json());

function generatePrompt(text) {
    return ` Extract tasks from the following text and return the tasks as a java script list:  ${text}`;
}

router.post("/extract-task", async (req, res) => {
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
            console.log("text ", text);
            const response = await openai.createCompletion({
                model: "text-davinci-003",
                prompt: generatePrompt(text),
                max_tokens: 2000,
                temperature: 0.6,
            });
            const completion = response.data.choices[0].text;
            console.log("completion ", completion);
            /**
             * // convert completion to list (complection = ["task1", "task2"])
            const tasks_list = JSON.parse(completion);
            for (let i = 0; i < tasks_list.length; i++) {
              const task = tasks_list[i];
              console.log("task ", task);
              // add task to db
            }
             * 
             */

            return res.status(200).json({
                success: true,
                message: completion,
            });
        } catch (error) {
            console.log(error.message);
        }
    });
});



router.post("/speech-to-text", async (req, res) => {
    const token = req.header("Authorization");
    const { path_to_audio } = req.body;
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
