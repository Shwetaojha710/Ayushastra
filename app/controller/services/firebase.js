var admin = require("firebase-admin");

var serviceAccount = require("../../../web-application-fea96-firebase-adminsdk-g63x0-9f836e9d97.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;