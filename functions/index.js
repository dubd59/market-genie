const functions = require('firebase-functions');

// Example HTTP function
exports.helloWorld = functions.https.onRequest((request, response) => {
  response.send('Hello from Firebase Functions!');
});
