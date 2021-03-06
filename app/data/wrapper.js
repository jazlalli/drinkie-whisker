var r = require('request');
var connection = 'http://localhost:7474/db/data/transaction/commit';

function cypher (query, params, cb) {
  r.post({
    uri: connection,
    json:{
      statements:[
        {statement: query, parameters: params}
      ]
    }
  },
  function (err,res) {
    cb(err, res.body);
  });
}

module.exports = cypher;