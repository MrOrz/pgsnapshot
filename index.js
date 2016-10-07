const {S3} = require('aws-sdk');
const {query} = require('./pkget');

const s3 = new S3();

query({latitude: 25.0049404, longitude: 121.5142067}, 1000).then(result => {
  const key = `${+new Date}.json`;
  s3.putObject({
    ACL: 'public-read',
    Bucket: 'pksnapshot',
    Key: key,
    Body: JSON.stringify(result),
  }, err => {
    if(err) console.error({err});
    else console.log({count: result.length, key, createdAt: Date()});
  });
});
