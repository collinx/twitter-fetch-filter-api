var express = require('express');
 
var config = require('../config');
var utils = require('./utils');
var Tweet = require('../model');
var TwitterStream = require('twitter-stream-api');
var keys  =  {
  consumer_key : config.consumer_key,
  consumer_secret : config.consumer_secret,
  token : config.access_token_key,
  token_secret : config.access_token_secret
};
var Twitter = new TwitterStream(keys, false);
var stream;

const MAX_TWEET = 100;
const MAX_TIME = 30;

module.exports.stream_function = function(req, res, next) {
 
  var keyword = req.body.track || req.query.track; 
  var max_tweet = req.body.tweet || req.query.tweet;
  var max_time = req.body.time || req.query.time;
  if(!max_tweet && !max_time){
    max_time = MAX_TIME;
  }
  var results = [];

  var tweet_count = 0;
  var start_time = (new Date()).getTime(); 
  
  Twitter.stream('statuses/filter', {track: keyword, stall_warnings: true });
  
  Twitter.on('connection success', function (uri) {
    console.log('connection success', uri);
 
});

Twitter.on('connection aborted', function () {
  console.log('connection aborted');
});
Twitter.on('connection error network', function (error) {
  console.log('connection error network', error);
});

Twitter.on('connection error stall', function () {
  console.log('connection error stall');
});

Twitter.on('connection error http', function (httpStatusCode) {
  console.log('connection error http', httpStatusCode);
});

Twitter.on('connection rate limit', function (httpStatusCode) {
  console.log('connection rate limit', httpStatusCode);
});

Twitter.on('connection error unknown', function (error) {
  console.log('connection error unknown', error);
    Twitter.close();

});

Twitter.on('data', function (obj) {
  var data = JSON.parse(obj);
  console.log('data', 1);
  if(results.length == 0){
    res.send({
      'code' : 0,
      'status' : "Success",
      'message' : "Streaming Successful",
       
    });
  }
  results.push(data);
  tweet_count++;

  if(tweet_count >= max_tweet || (new Date()).getTime() >= max_time*1000 + start_time){
    Twitter.close();
   
    save_data(results);
    start_time = (new Date()).getTime();
    tweet_count = 0;
    results = [];
  } 
});

Twitter.on('data keep-alive', function () {
  console.log('data keep-alive');
  if(tweet_count == 0 || (new Date()).getTime() >= 5*1000 + start_time){
    Twitter.close();
   
    res.send({
      'code' : 0,
      'status' : "Failed",
      'message' : "No Tweets Found",
       
    });
  } 

});

Twitter.on('data error', function (error) {
  console.log('data error', error);
});
  
 
  }

var save_data = function(results) {
  

    var tweet = new Tweet();
  
    console.log(results.length);
    }
