import {query} from './pkget';

query({latitude: 25.0049404, longitude: 121.5142067}, 1000).then(result => {
  console.log(result);
});
