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

var stream;

const MAX_TWEET = 200;
const MAX_TIME = 60;

module.exports.stream_function = function(req, res, next) {
  var Twitter = new TwitterStream(keys, false);
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
    
    res.send({
      'code' : httpStatusCode,
      'status' : "Failed",
      'message' : "connection rate limit",
      
    });
  });
  
  Twitter.on('connection error unknown', function (error) {
    console.log('connection error unknown', error);
    Twitter.close();
    
  });
  
  Twitter.on('data', function (obj) {
    var data = JSON.parse(obj);
    
    if(results.length == 0){
      res.send({
        'code' : 0,
        'status' : "Success",
        'message' : "Streaming Successful",
        
      });
    }
    results.push(data);
    save_data(data);
    tweet_count++;
    
    if(tweet_count >= max_tweet || (new Date()).getTime() >= max_time*1000 + start_time){
      Twitter.close();
      
      
      start_time = (new Date()).getTime();
      tweet_count = 0;
      results = [];
    } 
  });
  
  Twitter.on('data keep-alive', function () {
    console.log('data keep-alive');
    if(tweet_count == 0 && (new Date()).getTime() >= 5*1000 + start_time){
      Twitter.close();
      
      res.send({
        'code' : 0,
        'status' : "Success",
        'message' : "No Tweets Found",
        
      });
    }
    
    if((new Date()).getTime() >= (max_time+1)*1000 + start_time){
      Twitter.close();
    }
  });
  
  Twitter.on('data error', function (error) {
    console.log('data error', error);
  });
  
  
}


module.exports.filter_function = function(req, res, next) {
  var query = {};
  var sortQ = {};
  var perPage = 10;
  var page = req.body.page || req.query.page || 1;
  
  var keyword = req.body.keyword || req.query.keyword || null;
  
  var name = req.body.name || req.query.name || null;
  
  var sort =  req.body.sort || req.query.sort || null;

  var lang = req.body.lang || req.query.lang || null;


  if(keyword != null){
    query['text'] = {$regex: keyword+"+", $options:"i"};
  }
  
  
  if(name != null){
    
    query['user.screen_name'] = name;
    
  }

  if(lang != null){
    query['lang'] = lang;
  }
 
  if(sort !=null){
    var temp = sort.split('-');
    switch(temp[1]){
      case 'name': sortQ['user.screen_name'] = temp[0] == 0?1:-1;
      break;
      case 'date':sortQ['created_at'] = temp[0] == 0?1:-1;
      break;
      case 'fav':sortQ['favorite_count'] = temp[0] == 0?1:-1;
      break;
      case 'retw':sortQ['retweet_count'] = temp[0] == 0?1:-1;
      break;
      case 'text':sortQ['text'] = temp[0] == 0?1:-1;
      break;
    }
  }

  console.log(query,sortQ);
  page = Number(page);
  
  
  
  Tweet.find(query).sort(sortQ).skip((perPage * page) - perPage)
  .limit(perPage).exec( function(err,results){
    Tweet.find(query).count().exec(function(err, count) {
      if( Math.ceil(count / perPage) < page){
        res.send({
          
          "total_pages": Math.ceil(count / perPage),
          "total_match" : count,
        });
      }else{

        var fin = [];
        results.forEach(result => {

          var temp = {
            date: result.created_at,
            lang: result.lang,
            text: result.text,
            retweet: result.retweet_count,
            fav: result.favorite_count,
            urls: result.urls,
            mentions: result.mentions,
            hashtags: result.hashtags,
            userScreenName: result.user.screen_name,
            userName: result.user.name,
            userFollowers: result.user.followers_count,
            userFollowing: result.user.following_count,
            userTweets: result.user.tweets_count
          }
          fin.push(temp);
        });

        res.send({
          "current_page": page,
          "total_pages": Math.ceil(count / perPage),
          "results" : fin,
          "total_match" : count,
        });
      }
      
    })
  })
  
}




var save_data = function(data) {
  
  
  
  var tweet = new Tweet();
  var head;
  if(data.retweeted_status !=undefined){
    head =  data.retweeted_status;
  }else{
    head =  data;
  }
  
  
  tweet.created_at = (new Date(head.created_at)).getTime();
  tweet.lang = head.lang;
  tweet.id = data.id;
  
  
  if(head.truncated == true){
    tweet.text = head.extended_tweet.full_text;
  }else {
    tweet.text = head.text;
  }
  
  tweet.quote_count = head.quote_count;
  tweet.reply_count = head.reply_count;
  tweet.retweet_count = head.retweet_count;
  tweet.favorite_count = head.favorite_count;
  
  tweet.hashtags = [];
  tweet.urls = [];
  tweet.user_mentions = [];
  if( head.entities !=undefined){
    
    head.entities.hashtags.forEach(hash => {
      tweet.hashtags.push(hash.text);
    })
    
    head.entities.urls.forEach(url => {
      tweet.urls.push(url.url);
    })
    
    
    head.entities.user_mentions.forEach(user => {
      tweet.user_mentions.push(user.screen_name);
    })
    
  } 
  
  
  if(head.place != undefined){
    tweet.country_code = head.place.country_code;
  }
  
  tweet.user.name = head.user.name;
  tweet.user.screen_name = head.user.screen_name;
  tweet.user.location = head.user.location;
  tweet.user.followers_count = head.user.followers_count;
  tweet.user.following_count = head.user.friends_count;
  tweet.user.likes_count = head.user.favourites_count;
  tweet.user.tweets_count = head.user.statuses_count;
  tweet.user.joined_at = (new Date(head.user.created_at)).getTime() ;
  
  
  
  
  
  tweet.save(function(err){
    
    if (err) {
      console.log(err);
      return;
    }
    else {
      
      return;
    }
  });
}
