const stringify = require('csv-stringify');
const moment = require('moment');
const upload = require('./upload');

const TITLE_ROW = [
  'uuid',
  'id',
  'latitude',
  'longitude',
  'pokemon',
  'timestamp',
  'time',
  'icon',
];

function csvRow(record) {
  return [
    record.uuid,
    record.id,
    record.lat,
    record.long,
    record.pokemon,
    record.end,
    moment(record.end).format('YYYY-MM-DD HH:mm:ss'),
    `https://s3-ap-northeast-1.amazonaws.com/pksnapshot/images/${(record.id/1000).toFixed(3).slice(2)}.png`
  ];
}

function processToCSV(records) {
  return new Promise((resolve, reject) => {
    stringify([TITLE_ROW].concat(records.map(csvRow)), (err, output) => {
      if(err) {
        reject(err);
        return;
      }
      resolve(output);
    });
  })
}

exports.TITLE_ROW = TITLE_ROW;
exports.csvRow = csvRow;
exports.processToCSV = processToCSV;

if(require.main === module) {
  const path = require('path');
  const fs = require('fs');

  const jsonFilePath = process.argv.slice(-1)[0];
  let records;
  try {
    records = require(path.resolve(jsonFilePath));
  } catch (e) {
    console.error(`Usage: node process XXX.json`);
    throw e;
  }

  processToCSV(records).then(output => {
    // fs.writeFileSync(path.join(
    //   path.dirname(jsonFilePath),
    //   `${path.basename(jsonFilePath, '.json')}.csv`
    // ), output);
    return upload(output);
  }).then(result => {
    console.log({
      input: jsonFilePath,
      result
    });
    process.exit(0);
  }).catch(err => {
    throw err;
  });
}
