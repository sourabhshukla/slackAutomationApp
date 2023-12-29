require("dotenv").config();
const { App, ExpressReceiver } = require("@slack/bolt");
const askGpt = require("./utils/chatgpt");
const queryNotionDatabase = require("./notion/queryNotion");
const addNotionPageToDatabase = require("./notion/addToNotion");
const qs = require("qs");
const axios = require("axios");
const { uploadData, getAccessToken } = require("./database/mongo");
const userInstallHtml = require("./config/config");
const displayModal = require("./utils/displayModal");
const {
  getUserApp,
  getUserToken,
  postNewMessage,
} = require("./utils/userUtils");

const receiver = new ExpressReceiver({
  signingSecret: process.env.signingSecret,
});

const app = new App({
  signingSecret: process.env.signingSecret,
  token: process.env.token,
  receiver,
  installerOptions: {
    stateVerification: false,
  },
});

receiver.router.get("/slack/install", (req, res) => {
  console.log("hello");
  res.writeHead(200);
  res.end(userInstallHtml);
});

receiver.router.get("/slack/oauth_redirect", async (req, res) => {
  // You're working with an express req and res now.
  console.log(req.query);
  let data = qs.stringify({
    client_id: process.env.clientId,
    client_secret: process.env.clientSecret,
    code: req.query.code,
    redirect_uri: process.env.redirectUri,
  });

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://slack.com/api/oauth.v2.access",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: data,
  };

  const response = await axios
    .request(config)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.log(error);
    });
  const status = await uploadData(response);

  if (status) {
    res.send("Successfully registered");
  } else {
    res.send("User is already registered");
  }
});

app.message(async ({ message, say }) => {
  const stringifiedMessage = JSON.stringify(message);
  if (stringifiedMessage.includes("createSummary")) return;
  //console.log(JSON.stringify(message));
  const text = message.blocks[0].elements[0].elements[0].text;
  const currUser = message.user;
  const userToken = await getUserToken(currUser);
  console.log(userToken);
  if (!userToken) return;
  const userApp = getUserApp(userToken);
  await postNewMessage(userApp, message.channel, text);
});

app.action("createSummary", async ({ ack, body, say }) => {
  await ack();

  const channelId = body.channel.id;
  const messageTs = body.message.ts;
  const text = body.actions[0].value;
  //console.log(text);

  const result = await queryNotionDatabase(messageTs);
  const isPresent = result.length > 0;
  console.log(isPresent);
  if (isPresent) {
    await displayModal(app, body, "Warning", "Summary Already Present");
    console.log("Already present");
    return;
  }

  await displayModal(app, body, "Success", "Summary Creation Successfull");
  let summarizedText = text;
  if (text.split(" ").length > process.env.max_words) {
    summarizedText = await askGpt(text);
  }
  addNotionPageToDatabase(process.env.DATABASE_ID, messageTs, summarizedText);
  console.log("Done");
});

// Handle the installation process (OAuth)
app.command("/install", async ({ command, ack, body }) => {
  console.log("inside command");

  await ack(
    `Please install the app by clicking on this [link](${process.env.host}/slack/install).`
  );
});

(async () => {
  await app.start(process.env.PORT || 3000);
  console.log("Bolt app is running");
})();
