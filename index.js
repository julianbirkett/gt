var express = require('express'),
    util = require('util'),
    path = require('path'),
    app = express();

var showroom = express.Router();

app.use(express.static(__dirname));

// Start listening
app.listen(3000, function () {
    console.log('listening on port 3000');
});
