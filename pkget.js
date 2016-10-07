// https://github.com/yhsiang/pokemon-go-query/blob/master/pkget.js

const request = require('request-promise');
const geolib = require('geolib');
const { stringify } = require('querystring');
const pokemon = require('pokemon');

const PkgetURL = "https://pkget.com/pkm333.ashx";

exports.query = function query(location, distance) {
  // const [min, max] = geolib.getBoundsOfDistance(location, distance);
  const params = {
    v1: 111,
    v2: 25.075800, //max.latitude,
    v3: 121.573152,//max.longitude,
    v4: 24.991528, // 21.893581, // min.latitude,
    v5: 121.436858, // min.longitude,
    v6: 0,
  };

  // console.debug(`curl "${PkgetURL}?${stringify(params)}" -H "X-Requested-With: XMLHttpRequest" -H "Referer: https://pkget.com/" --`);

  return request({
    url: `${PkgetURL}?${stringify(params)}`,
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      'Referer': 'https://pkget.com/',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.116 Safari/537.36',
    },
    gzip: true,
  })
  .then(res => {
      if (res.match(/^找/)) return [];
      const { pk123 } = JSON.parse(res);
      const pokemons = pk123.map(({ d1, d3, d4, d5  }) => {
        let name = pokemon.getName(+d1, "zh-Hant");
        const latitude = +d4;
        const longitude = +d5;
        const vanish = +d3 / 1000;

        return {
          uuid: `${vanish}-${d1}-${latitude}-${longitude}`,
          id: +d1,
          lat: latitude,
          long: longitude,
          pokemon: name,
          end: +d3,
        };
      });
      return pokemons;
    })
};
