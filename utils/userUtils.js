const { getAccessToken } = require("../database/mongo");
const { App } = require("@slack/bolt");

const getUserToken = async (userId) => {
  const accessToken = await getAccessToken(userId);
  return accessToken;
};

const getUserApp = (userToken) => {
  return new App({
    signingSecret: process.env.signingSecret,
    token: userToken,
  });
};

const postNewMessage = async (user, channel, text) => {
  try {
    let blocks = [];
    blocks.push({
      type: "actions",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "Create Summary",
            emoji: true,
          },
          value: text,
          action_id: "createSummary",
        },
      ],
    });
    const result = await user.client.chat.postMessage({
      channel: channel,
      blocks: blocks,
    });
    console.log("Message posted:", result.ts);
  } catch (error) {
    console.error("Error posting message:", error.message);
  }
};

module.exports = { getUserToken, getUserApp, postNewMessage };
