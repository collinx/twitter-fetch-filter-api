var mongoose = require('mongoose');

var tweetSchema = mongoose.Schema({
    
    created_at : Number,
    lang: String,
    type:String,
    type_id:String,
    tweet: {
        id:Number,
        text: String,
        quote_count:Number,
        reply_count:Number,
        retweet_count:Number,
        favorite_count:Number,

    },
    urls:[],
    user_mentions:[],
    hashtags:[],
    user : {
             id : Number,
             name : String,
             screen_name : String,
             location : String,
             followers_count : Number,
             following_count : Number,
             listed_count: Number,
             likes_count: Number,
             tweets_count: Number,
             joined_at: Number,
             time_zone:String,
         }
});

 
module.exports = mongoose.model('Tweet', tweetSchema);
