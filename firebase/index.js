const firebase = require("firebase-admin");

const credentials = require("./credentials.json");

firebase.initializeApp({
  credential: firebase.credential.cert(credentials),
  databaseURL: "https://pricetracker-8da04.firebaseio.com",
});

module.exports = firebase;