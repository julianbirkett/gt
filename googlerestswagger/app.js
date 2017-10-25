var express = require('express'),
    subpath = express(),
    bodyParser = require('body-parser'),
    request = require('request'),
    fs = require('fs');
    // swagger = require("swagger-node-express");

var localTest = true;

var app = express();

var port = process.env.port || 3000;

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use("/v1", subpath);

var swagger = require("swagger-node-express").createNew(subpath);
//swagger.setAppHandler(app);

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

var findById = {
  'spec': {
    "description" : "Operations about pets",
    "path" : "/pet.{format}/{petId}",
    "notes" : "Returns a pet based on ID",
    "summary" : "Find pet by ID",
    "method": "GET",
    "parameters" : [swagger.pathParam("petId", "ID of pet that needs to be fetched", "string")],
    "type" : "Pet",
    "errorResponses" : [swagger.errors.invalid('id'), swagger.errors.notFound('pet')],
    "nickname" : "getPetById"
  },
  'action': function (req,res) {
    if (!req.params.petId) {
      throw swagger.errors.invalid('id');
    }
    var id = parseInt(req.params.petId);
    var pet = petData.getPetById(id);
 
    if (pet) {
      res.send(JSON.stringify(pet));
    } else {
      throw swagger.errors.notFound('pet');
    }
  }
};

swagger.addGet(findById);

swagger.configure("http://petstore.swagger.wordnik.com", "0.1");

app.listen(port, function() {
    console.log('Running on port: ' + port);
})

module.exports = app;