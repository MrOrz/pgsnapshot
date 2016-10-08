require('./handle_rejection');

const {S3} = require('aws-sdk');
const {query} = require('./pkget');
const {processToCSV} = require('./process');
const upload = require('./upload');

const s3 = new S3();
let filename = ''

query({latitude: 25.0049404, longitude: 121.5142067}, 1000).then(result => {
  filename = `${+new Date}.json`;
  s3.putObject({
    ACL: 'public-read',
    Bucket: 'pksnapshot',
    Key: filename,
    Body: JSON.stringify(result),
  }, err => {
    if(err) console.error({err});
    else console.log({count: result.length, key: filename, createdAt: Date()});
  });

  return processToCSV(result);
}).then(upload).then(result => {
  console.log({
    uploaded: filename,
    result
  });
  process.exit(0);
}).catch(err => {
  throw err;
});
