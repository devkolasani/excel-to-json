// Firebase Dependencies
const functions = require("firebase-functions");

const { app } = require("./app");

// Firebase Integration
const api = functions.https.onRequest(app);

module.exports = { api };
