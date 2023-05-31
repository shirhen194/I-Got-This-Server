// Get Tasks From Text Using OpenAI API
const { Configuration, OpenAIApi } = require("openai");

const OPENAI_API_KEY = "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";

const configuration = new Configuration({
  //get SECRET_KEY from env variable,
  apiKey: OPENAI_API_KEY,
});
console.log("sdfsddddf")

const openai = new OpenAIApi(configuration);
console.log("sdfsdf")
module.exports =  openai; //export the app