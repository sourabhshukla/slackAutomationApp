const { Client } = require("@notionhq/client");
require("dotenv").config();

// Set up Notion API client
const notion = new Client({
  auth: process.env.YOUR_NOTION_API_KEY, // Replace with your Notion integration token
});

async function addNotionPageToDatabase(
  databaseId,
  timestamp,
  summary,
  pageProperties = null
) {
  const newPage = await notion.pages.create({
    parent: {
      database_id: databaseId,
    },
    properties: {
      timestamp: {
        type: "title",
        title: [{ type: "text", text: { content: timestamp } }],
      },
      summary: {
        type: "rich_text",
        rich_text: [{ type: "text", text: { content: summary } }],
      },
    },
  });
  console.log(newPage);
}

//addNotionPageToDatabase("0d77031c70b04f74b32891c59b4fa7fd");
module.exports = addNotionPageToDatabase;
