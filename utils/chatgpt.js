const OpenAI = require("openai");
require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const askGpt = async (text) => {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "Summarize the given text in maximum of 15 words",
      },
      {
        role: "user",
        content: text,
      },
    ],
  });

  // console.log(JSON.stringify(response));
  console.log(response.choices[0].message.content);

  return response.choices[0].message.content;
};
//ask();

module.exports = askGpt;
