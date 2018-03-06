var mongoose = require('mongoose');

var tweetSchema = mongoose.Schema({
    
    created_at : Number,
    lang: String,
    
    
    id:Number,
    text: String,
    quote_count:Number,
    reply_count:Number,
    retweet_count:Number,
    favorite_count:Number,
    
    urls:[],
    user_mentions:[],
    hashtags:[],

    country_code : String,
     
    user : {
        name : String,
        screen_name : String,
        location : String,
        followers_count : Number,
        following_count : Number,
        likes_count: Number,
        tweets_count: Number,
        joined_at: Number,
    }
});


module.exports = mongoose.model('Tweet', tweetSchema);
