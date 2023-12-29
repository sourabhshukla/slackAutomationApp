const { Client } = require("@notionhq/client");
require("dotenv").config();

// Set up Notion API client
const notion = new Client({
  auth: process.env.YOUR_NOTION_API_KEY, // Replace with your Notion integration token
});

async function queryNotionDatabase(timestamp) {
  try {
    const response = await notion.databases.query({
      database_id: process.env.DATABASE_ID, // Replace with your Notion database ID
      filter: {
        property: "timestamp", // Replace with the actual property name
        title: {
          equals: timestamp, // Replace with the timestamp you're looking for
        },
      },
    });

    //console.log("Query result:", response);
    return response.results;
  } catch (error) {
    console.error("Error querying Notion database:", error.body);
  }
}

// Call the function to query the database
//queryNotionDatabase();
module.exports = queryNotionDatabase;
