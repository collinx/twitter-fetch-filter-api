require('dotenv').config();
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require("mongoose");
var config = require('./config');
 
 
 

mongoose.Promise = global.Promise;
mongoose.connect( config.mongodb_uri, {reconnectTries: Number.MAX_VALUE, poolSize: 10 });
  var db = mongoose.connection;
  db.on('error',console.error.bind(console, 'connection error:'));
  db.once('open', function(){
    console.log('connected to db server successfully');
  });

var index = require('./routes/index');

var app = express();

app.set('views', path.join(__dirname, 'public'));
app.set('view engine', 'ejs');

app.use('*/js', express.static(path.join(__dirname, 'public/js')))
app.use('*/css', express.static(path.join(__dirname, 'public/css'))) 

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', index);


app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


app.use(function(err, req, res, next) {

  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};


  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
