const google = require('googleapis');
const {auth} = require('./authorize_google');

// const TABLE_ID = '1kQJntLu9hw0ULKYLwpC46FzZmtX2K9yvhE5X5Kzx';
const TABLE_ID = '1M-iN2NIWekvnJTNLGIqJ7S0-jAP8hfQjnx-RLzJk';

function upload(csvOutput) {
  return auth().then(({client}) => {
    const fusiontables = google.fusiontables({
      version: 'v2',
      auth: client,
    });
    return new Promise((resolve, reject) => {
      fusiontables.table.importRows({
        tableId: TABLE_ID,
        media: {
          mimeType: 'application/octet-stream',
          body: csvOutput
        }
      }, (err, result) => {
        if(err) {
          reject(err);
          return;
        }
        resolve(result);
      })
    });
  });
};

// if(require.main === module) {
//   upload("").then(data => {
//     console.log(data);
//     process.exit(0);
//   });
// }

module.exports = upload;
