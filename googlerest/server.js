//var cors = require('cors');
var express = require('express'),
    util = require('util'),
    path = require('path'),
    app = express();

var showroom = express.Router();

//CORS middleware
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
};

// app.use(cors);
// app.options('*', cors());
app.use(express.static(__dirname));
// app.use(allowCrossDomain);

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Start listening
app.listen(3000, function () {
    console.log('listening on port 3000');
});
