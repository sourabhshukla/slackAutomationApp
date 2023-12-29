const { MongoClient } = require("mongodb");
require("dotenv").config();

async function connectToCluster(uri) {
  let monggoClient;
  try {
    monggoClient = new MongoClient(uri);
    console.log("Connection to MongoDB Atlas cluster....");
    await monggoClient.connect();
    console.log("Successfully connected to MongoDB Atlas");
    return monggoClient;
  } catch (err) {
    console.log("Connection to MongoDB Atlas failed!", err);
    process.exit();
  }
}

async function uploadData(data) {
  let mongoClient;
  const uri = process.env.MONGO_URI;
  try {
    mongoClient = await connectToCluster(uri);

    const db = mongoClient.db("slackUsers");
    const collection = db.collection("slackUsers");
    const present = await isPresent(data.authed_user.id, collection);
    if (present) return false;
    console.log("Data Upload Started...");
    await collection.insertOne(data);
    console.log("Data Uploaded Successfully...");
    return true;
  } catch (error) {
    console.log("Some thing went wrong", error);
  } finally {
    await mongoClient.close();
  }
}

async function isPresent(userId, collection) {
  const result = await collection.findOne({
    "authed_user.id": userId,
  });

  if (result) {
    const accessToken = result.authed_user.access_token;
    console.log("User is already registered");
    console.log("Access Token:", accessToken);
    return true;
  } else {
    console.log("User not found in the collection.");
    return false;
  }
}

async function getAccessToken(userId) {
  let mongoClient;
  const uri = process.env.MONGO_URI;
  try {
    mongoClient = await connectToCluster(uri);

    const db = mongoClient.db("slackUsers");
    const collection = db.collection("slackUsers");
    const result = await collection.findOne({
      "authed_user.id": userId,
    });

    if (result) {
      const accessToken = result.authed_user.access_token;
      console.log("User is already registered");
      console.log("Access Token:", accessToken);
      return accessToken;
    } else {
      console.log("User not found in the collection.");
      return null;
    }
  } catch (error) {
    console.log("Some thing went wrong", error);
  } finally {
    await mongoClient.close();
  }
  return null;
}

module.exports = { uploadData, getAccessToken };
