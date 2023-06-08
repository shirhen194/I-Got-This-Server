// Get Tasks From Text Using OpenAI API
const { Configuration, OpenAIApi } = require("openai");

OPENAI_API_KEY = "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";

const configuration = new Configuration({
  //get SECRET_KEY from env variable,
  apiKey: OPENAI_API_KEY,
});


const openai = new OpenAIApi(configuration);
module.exports =  openai; //export the app