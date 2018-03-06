module.exports = {
    'consumer_key'      :process.env.TWITTER_CONSUMER_KEY,
    'consumer_secret'  :process.env.TWITTER_CONSUMER_SECRET ,
    'access_token_key'      : process.env.TWITTER_ACCESS_TOKEN_KEY ,
    'access_token_secret'      : process.env.TWITTER_ACCESS_TOKEN_SECRET ,
    'mongodb_uri': "mongodb://dev:pass2018@cluster0-shard-00-00-93anw.mongodb.net:27017,cluster0-shard-00-01-93anw.mongodb.net:27017,cluster0-shard-00-02-93anw.mongodb.net:27017/twitter?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin",
};