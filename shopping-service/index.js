var express = require('express');
var app = express();
var port = process.env.PORT || 8080;
var path = require("path");
var pg = require("pg").native;
var app = express();

var connectionString = 'postgres://luuyzgizzvhmgw:jZbnKaGUolV3qXTv2nKeZyfkXk@ec2-54-235-65-221.compute-1.amazonaws.com:5432/d6tisfgcqns11n';

var client = new pg.Client(connectionString);
client.connect();

var bodyParser = require('body-parser')
app.use( bodyParser.json() ); // to support JSON­encoded bodies
app.use(bodyParser.urlencoded({ // to support URL­encoded bodies
  extended: true
}));

//static files
app.use("/css", express.static(__dirname + '/css'));
app.use("/js", express.static(__dirname + '/js'));
app.use("/fonts", express.static(__dirname + '/fonts'));

app.use(function(req, res, next) {
  if (req.headers.origin) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Authorization')
    res.header('Access-Control-Allow-Methods', 'GET,PUT,PATCH,POST,DELETE')
    if (req.method === 'OPTIONS') return res.send(200)
  }
  next();
})

app.use(express.static(__dirname + '/public'));

//Initial browse page, will query the db for all products.
app.get('/products', function(req, res){
  var query = "SELECT * FROM products;";

  if(req.body.name != null){
    query = "SELECT * FROM products WHERE product_name='" + req.body.name + "';";
  }

  client.query(query, function (error, data) {

    if(error) {
      res.status(400).json({
        status: 'failed',
        message: 'failed to retrieve all products'
      });
    } else {
      res.status(200)
      .json({
        status: 'success',
        data: data.rows,
        message: 'successfully retrieved all products'
      });
    }
  })
});

app.put('/products', function(req, res){
  var query = "SELECT * FROM products;";
  console.log("HIT")
  if(req.body.name != null){
    query = "SELECT * FROM products WHERE product_name='" + req.body.name + "';";
  }

  client.query(query, function (error, data) {

    if(error) {
      res.status(400).json({
        status: 'failed',
        message: 'failed to retrieve all products'
      });
    } else {
      res.status(200)
      .json({
        status: 'success',
        data: data.rows,
        message: 'successfully retrieved all products'
      });
    }
  })
});



app.get('/products/:productID', function(req, res) {
  var query = "SELECT * FROM products WHERE productID='" +
  parseInt(req.params.productID) + "';";

  client.query(query, function(error, data){

        if(error) {
          res.status(400).json({
            status: 'failed',
            message: 'failed to retrieve product'
          });
        } else {
          res.status(200)
          .json({
            status: 'success',
            data: data.rows,
            message: 'successfully retrieved product'
          });
        }
  })
});

//Register
app.get('/register', function(req, res){

});

//login
app.get('/login', function(req, res){

});



app.listen(8080);
