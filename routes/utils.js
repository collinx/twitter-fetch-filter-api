var express = require('express');
var Twitter = require('twitter');
var config = require('../config');
var utils = require('./utils');
var client = new Twitter({
  consumer_key: config.consumer_key,
  consumer_secret: config.consumer_secret,
  access_token_key: config.access_token_key,
  access_token_secret: config.access_token_secret
});

const MAX_TWEET = 100;
const MAX_TIME = 30;

module.exports.stream_function = function(req, res, next) {
 
  let keyword = req.body.track || req.query.track; 
  let max_tweet = req.body.tweet || req.query.tweet || MAX_TWEET;
  let max_time = req.body.time || req.query.time || MAX_TIME;
  let tweet_count = 0;
  let start_time = (new Date()).getTime(); 
  // You can also get the stream in a callback if you prefer. 
  client.stream('statuses/filter', {track: keyword}, function(stream) {
   
    let results=[];
  
    stream.on('data', function(event) {
      results.push(event); 
      tweet_count++;
      if(tweet_count >= max_tweet || (new Date()).getTime() >= max_time*1000 + start_time){
        stream.destroy();
        save_data(results);
        res.send({
          'code' : 0,
          'status' : "Success",
          'message' : "Streaming Completed with "+ tweet_count +" Tweets"
        });
      } 

     
      
  
    });
    stream.on('error', function(error) {
      
      res.send({
        'code' : -1,
        'status' : "Failed",
        'message' : "" + error.toString() ,
      });
    });
  });
  }

let save_data = function(results) {
  
  
    console.log(results.length);
    }
