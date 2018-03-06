var express = require('express');
var router = express.Router();
var Twitter = require('twitter');
var config = require('../config');
var client = new Twitter({
  consumer_key: config.consumer_key,
  consumer_secret: config.consumer_secret,
  access_token_key: config.access_token_key,
  access_token_secret: config.access_token_secret
});

 
var stream_function = function(req, res, next) {
 
let keyword = req.body.track || req.query.track; 

// You can also get the stream in a callback if you prefer. 
client.stream('statuses/filter', {track: keyword}, function(stream) {
  let results=[];
  let count=0;
  stream.on('data', function(event) {
    results.push(event); 
    count++;
    
    if(count >= 5){
      stream.destroy();
      console.log("Streaming Completed");
      res.send({'data':results});
    } 

  });



 
  stream.on('error', function(error) {
    throw error;
  });
});
}

router.get('/twitter/stream',stream_function);

router.post('/twitter/stream', stream_function);



module.exports = router;
