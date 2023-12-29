const displayModal = async (app, body, type, msg) => {
  try {
    // Open a modal when the action is triggered
    const result = await app.client.views.open({
      trigger_id: body?.trigger_id,
      view: {
        type: "modal",
        callback_id: "modal-identifier",
        title: {
          type: "plain_text",
          text: type,
        },
        blocks: [
          {
            type: "section",
            block_id: "section-identifier",
            text: {
              type: "mrkdwn",
              text: msg,
            },
          },
        ],
      },
    });

    console.log(result);
  } catch (error) {
    console.error(error);
  }
};

module.exports = displayModal;
