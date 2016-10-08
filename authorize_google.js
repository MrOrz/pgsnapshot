require('./handle_rejection');
// Ref: https://github.com/google/google-api-nodejs-client/blob/master/samples/oauth2.js
//

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const google = require('googleapis');
const OAuth2Client = google.auth.OAuth2;

// Client ID and client secret are available at
// https://code.google.com/apis/console
const CREDENTIAL_FILE_PATH = path.resolve('credentials.json');

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_SECRET;
const REDIRECT_URL = 'urn:ietf:wg:oauth:2.0:oob'; // https://developers.google.com/identity/protocols/OAuth2InstalledApp#redirect-uri_alternative

const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function setAccessTokenFromGoogle (oauth2Client, callback) {
  // generate consent page url
  var url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // will return a refresh token
    scope: 'https://www.googleapis.com/auth/fusiontables' // can be a space-delimited string or an array of scopes
  });

  console.log('Visit the url: ', url);
  rl.question('Enter the code here:', function (code) {
    // request access token
    oauth2Client.getToken(code, function (err, tokens) {
      if (err) {
        return callback(err);
      }
      callback(null, tokens);
    });
  });
}

function writeCredential(tokens) {
  fs.writeFileSync(CREDENTIAL_FILE_PATH, JSON.stringify(tokens), {
    encoding: 'utf8',
    mode: 0o600,
  });
}

// Do initial auth with Google and writes credentials
// (access token & refresh token) to file.
//
function init() {
  return new Promise((resolve, reject) => {
    setAccessTokenFromGoogle(oauth2Client, (err, tokens /* === credentials */) => {
      if(err) {
        reject(err);
        return;
      }

      oauth2Client.setCredentials(tokens);
      writeCredential(tokens);
      resolve({client: oauth2Client, tokens});
    })
  });
}

// Read previously written token and refresh it when required.
//
function auth() {
  const tokens = JSON.parse(fs.readFileSync(CREDENTIAL_FILE_PATH, 'utf8'));
  oauth2Client.setCredentials(tokens);

  return new Promise((resolve, reject) => {
    oauth2Client.getAccessToken((err, newTokens) => {
      if(err) {
        reject(err);
        return;
      }


      oauth2Client.setCredentials(newTokens);
      writeCredential(newTokens);
      resolve({client: oauth2Client, tokens: newTokens});
    });
  })
}

if(require.main === module) {
  init().then(() => {
    console.log('Initialization done.');
    process.exit(0);
  });
}

exports.init = init;
exports.auth = auth;
