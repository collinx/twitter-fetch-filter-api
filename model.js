var mongoose = require('mongoose');

var tweetSchema = mongoose.Schema({
    
    
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
         }
});

 
module.exports = mongoose.model('Tweet', tweetSchema);
