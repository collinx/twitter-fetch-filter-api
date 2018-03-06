var express = require('express');
var router = express.Router();
var utils = require('./utils');
 
 


router.get('/twitter/stream',utils.stream_function);

router.post('/twitter/stream', utils.stream_function);



module.exports = router;
