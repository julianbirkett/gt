var express = require('express'),
    bodyParser = require('body-parser'),
    request = require('request'),
    fs = require('fs'),
    cors = require('cors');
    // APIBuilder = require('claudia-api-builder');

var localTest = true;

var app = express();

var port = process.env.port || 3000;

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.use(cors());
// app.use(APIBuilder());

app.get('/', function(req, res) {
    res.send('Welcome to my API!');
});

app.get('/getTicker', function(req, res) {
  
    var baseURL = "https://www.google.com/finance/historical?output=csv&q=LON:"
    var ticker = req.query.ticker;
    
    if (!req.query.ticker) {
        res.status(400);
        res.send('Ticker is required');
        return;
    }
 
    console.log(baseURL + ticker);
    // request(baseURL + ticker).pipe(fs.createWriteStream(ticker + '.csv'))
    req.pipe(request(baseURL + ticker)).pipe(res);
    
});

app.listen(port, function() {
    console.log('Running on port: ' + port);
})

module.exports = app;